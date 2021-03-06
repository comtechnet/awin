import chai from 'chai';
import { ethers, upgrades } from 'hardhat';
import { BigNumber as EthersBN } from 'ethers';
import { solidity } from 'ethereum-waffle';

import {
  Weth,
  awinToken,
  awinAuctionHouse,
  awinAuctionHouseFactory,
  awinDescriptor,
  awinDescriptorFactory,
  awinDaoProxyFactory,
  awinDaoLogicV1,
  awinDaoLogicV1Factory,
  awinDaoExecutor,
  awinDaoExecutorFactory,
} from '../typechain';

import {
  deployawinToken,
  deployWeth,
  populateDescriptor,
  address,
  encodeParameters,
  advanceBlocks,
  blockTimestamp,
  setNextBlockTimestamp,
} from './utils';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

chai.use(solidity);
const { expect } = chai;

let awinToken: awinToken;
let awinAuctionHouse: awinAuctionHouse;
let descriptor: awinDescriptor;
let weth: Weth;
let gov: awinDaoLogicV1;
let timelock: awinDaoExecutor;

let deployer: SignerWithAddress;
let wethDeployer: SignerWithAddress;
let bidderA: SignerWithAddress;
let noundersDAO: SignerWithAddress;

// Governance Config
const TIME_LOCK_DELAY = 172_800; // 2 days
const PROPOSAL_THRESHOLD_BPS = 500; // 5%
const QUORUM_VOTES_BPS = 1_000; // 10%
const VOTING_PERIOD = 5_760; // About 24 hours with 15s blocks
const VOTING_DELAY = 1; // 1 block

// Proposal Config
const targets: string[] = [];
const values: string[] = [];
const signatures: string[] = [];
const callDatas: string[] = [];

let proposalId: EthersBN;

// Auction House Config
const TIME_BUFFER = 15 * 60;
const RESERVE_PRICE = 2;
const MIN_INCREMENT_BID_PERCENTAGE = 5;
const DURATION = 60 * 60 * 24;

async function deploy() {
  [deployer, bidderA, wethDeployer, noundersDAO] = await ethers.getSigners();

  // Deployed by another account to simulate real network

  weth = await deployWeth(wethDeployer);

  // nonce 2: Deploy AuctionHouse
  // nonce 3: Deploy nftDescriptorLibraryFactory
  // nonce 4: Deploy awinDescriptor
  // nonce 5: Deploy awinSeeder
  // nonce 6: Deploy awinToken
  // nonce 0: Deploy awinDAOExecutor
  // nonce 1: Deploy awinDAOLogicV1
  // nonce 7: Deploy awinDAOProxy
  // nonce ++: populate Descriptor
  // nonce ++: set ownable contracts owner to timelock

  // 1. DEPLOY awin token
  awinToken = await deployawinToken(
    deployer,
    noundersDAO.address,
    deployer.address, // do not know minter/auction house yet
  );

  // 2a. DEPLOY AuctionHouse
  const auctionHouseFactory = await ethers.getContractFactory('awinAuctionHouse', deployer);
  const awinAuctionHouseProxy = await upgrades.deployProxy(auctionHouseFactory, [
    awinToken.address,
    weth.address,
    TIME_BUFFER,
    RESERVE_PRICE,
    MIN_INCREMENT_BID_PERCENTAGE,
    DURATION,
  ]);

  // 2b. CAST proxy as AuctionHouse
  awinAuctionHouse = awinAuctionHouseFactory.connect(awinAuctionHouseProxy.address, deployer);

  // 3. SET MINTER
  await awinToken.setMinter(awinAuctionHouse.address);

  // 4. POPULATE body parts
  descriptor = awinDescriptorFactory.connect(await awinToken.descriptor(), deployer);

  await populateDescriptor(descriptor);

  // 5a. CALCULATE Gov Delegate, takes place after 2 transactions
  const calculatedGovDelegatorAddress = ethers.utils.getContractAddress({
    from: deployer.address,
    nonce: (await deployer.getTransactionCount()) + 2,
  });

  // 5b. DEPLOY awinDAOExecutor with pre-computed Delegator address
  timelock = await new awinDaoExecutorFactory(deployer).deploy(
    calculatedGovDelegatorAddress,
    TIME_LOCK_DELAY,
  );

  // 6. DEPLOY Delegate
  const govDelegate = await new awinDaoLogicV1Factory(deployer).deploy();

  // 7a. DEPLOY Delegator
  const awinDAOProxy = await new awinDaoProxyFactory(deployer).deploy(
    timelock.address,
    awinToken.address,
    noundersDAO.address, // NoundersDAO is vetoer
    timelock.address,
    govDelegate.address,
    VOTING_PERIOD,
    VOTING_DELAY,
    PROPOSAL_THRESHOLD_BPS,
    QUORUM_VOTES_BPS,
  );

  expect(calculatedGovDelegatorAddress).to.equal(awinDAOProxy.address);

  // 7b. CAST Delegator as Delegate
  gov = awinDaoLogicV1Factory.connect(awinDAOProxy.address, deployer);

  // 8. SET awin owner to awinDAOExecutor
  await awinToken.transferOwnership(timelock.address);
  // 9. SET Descriptor owner to awinDAOExecutor
  await descriptor.transferOwnership(timelock.address);

  // 10. UNPAUSE auction and kick off first mint
  await awinAuctionHouse.unpause();

  // 11. SET Auction House owner to awinDAOExecutor
  await awinAuctionHouse.transferOwnership(timelock.address);
}

describe('End to End test with deployment, auction, proposing, voting, executing', async () => {
  before(deploy);

  it('sets all starting params correctly', async () => {
    expect(await awinToken.owner()).to.equal(timelock.address);
    expect(await descriptor.owner()).to.equal(timelock.address);
    expect(await awinAuctionHouse.owner()).to.equal(timelock.address);

    expect(await awinToken.minter()).to.equal(awinAuctionHouse.address);
    expect(await awinToken.noundersDAO()).to.equal(noundersDAO.address);

    expect(await gov.admin()).to.equal(timelock.address);
    expect(await timelock.admin()).to.equal(gov.address);
    expect(await gov.timelock()).to.equal(timelock.address);

    expect(await gov.vetoer()).to.equal(noundersDAO.address);

    expect(await awinToken.totalSupply()).to.equal(EthersBN.from('2'));

    expect(await awinToken.ownerOf(0)).to.equal(noundersDAO.address);
    expect(await awinToken.ownerOf(1)).to.equal(awinAuctionHouse.address);

    expect((await awinAuctionHouse.auction()).nounId).to.equal(EthersBN.from('1'));
  });

  it('allows bidding, settling, and transferring ETH correctly', async () => {
    await awinAuctionHouse.connect(bidderA).createBid(1, { value: RESERVE_PRICE });
    await setNextBlockTimestamp(Number(await blockTimestamp('latest')) + DURATION);
    await awinAuctionHouse.settleCurrentAndCreateNewAuction();

    expect(await awinToken.ownerOf(1)).to.equal(bidderA.address);
    expect(await ethers.provider.getBalance(timelock.address)).to.equal(RESERVE_PRICE);
  });

  it('allows proposing, voting, queuing', async () => {
    const description = 'Set awinToken minter to address(1) and transfer treasury to address(2)';

    // Action 1. Execute awinToken.setMinter(address(1))
    targets.push(awinToken.address);
    values.push('0');
    signatures.push('setMinter(address)');
    callDatas.push(encodeParameters(['address'], [address(1)]));

    // Action 2. Execute transfer RESERVE_PRICE to address(2)
    targets.push(address(2));
    values.push(String(RESERVE_PRICE));
    signatures.push('');
    callDatas.push('0x');

    await gov.connect(bidderA).propose(targets, values, signatures, callDatas, description);

    proposalId = await gov.latestProposalIds(bidderA.address);

    // Wait for VOTING_DELAY
    await advanceBlocks(VOTING_DELAY + 1);

    // cast vote for proposal
    await gov.connect(bidderA).castVote(proposalId, 1);

    await advanceBlocks(VOTING_PERIOD);

    await gov.connect(bidderA).queue(proposalId);

    // Queued state
    expect(await gov.state(proposalId)).to.equal(5);
  });

  it('executes proposal transactions correctly', async () => {
    const { eta } = await gov.proposals(proposalId);
    await setNextBlockTimestamp(eta.toNumber(), false);
    await gov.execute(proposalId);

    // Successfully executed Action 1
    expect(await awinToken.minter()).to.equal(address(1));

    // Successfully executed Action 2
    expect(await ethers.provider.getBalance(address(2))).to.equal(RESERVE_PRICE);
  });

  it('does not allow awinDAO to accept funds', async () => {
    let error1;

    // awinDAO does not accept value without calldata
    try {
      await bidderA.sendTransaction({
        to: gov.address,
        value: 10,
      });
    } catch (e) {
      error1 = e;
    }

    expect(error1);

    let error2;

    // awinDAO does not accept value with calldata
    try {
      await bidderA.sendTransaction({
        data: '0xb6b55f250000000000000000000000000000000000000000000000000000000000000001',
        to: gov.address,
        value: 10,
      });
    } catch (e) {
      error2 = e;
    }

    expect(error2);
  });

  it('allows awinDAOExecutor to receive funds', async () => {
    // test receive()
    await bidderA.sendTransaction({
      to: timelock.address,
      value: 10,
    });

    expect(await ethers.provider.getBalance(timelock.address)).to.equal(10);

    // test fallback() calls deposit(uint) which is not implemented
    await bidderA.sendTransaction({
      data: '0xb6b55f250000000000000000000000000000000000000000000000000000000000000001',
      to: timelock.address,
      value: 10,
    });

    expect(await ethers.provider.getBalance(timelock.address)).to.equal(20);
  });
});
