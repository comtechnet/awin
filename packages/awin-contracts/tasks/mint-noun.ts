import { task, types } from 'hardhat/config';

task('mint-noun', 'Mints a Noun')
  .addOptionalParam(
    'awinToken',
    'The `awinToken` contract address',
    '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    types.string,
  )
  .setAction(async ({ awinToken }, { ethers }) => {
    const nftFactory = await ethers.getContractFactory('awinToken');
    const nftContract = nftFactory.attach(awinToken);

    const receipt = await (await nftContract.mint()).wait();
    const nounCreated = receipt.events?.[1];
    const { tokenId } = nounCreated?.args;

    console.log(`Noun minted with ID: ${tokenId.toString()}.`);
  });
