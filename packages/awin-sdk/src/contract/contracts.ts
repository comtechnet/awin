import {
  awinTokenFactory,
  awinAuctionHouseFactory,
  awinDescriptorFactory,
  awinSeederFactory,
  awinDaoLogicV1Factory,
} from '@awin/contracts';
import type { Signer } from 'ethers';
import type { Provider } from '@ethersproject/providers';
import { getContractAddressesForChainOrThrow } from './addresses';
import { Contracts } from './types';

/**
 * Get contract instances that target the Ethereum mainnet
 * or a supported testnet. Throws if there are no known contracts
 * deployed on the corresponding chain.
 * @param chainId The desired chain id
 * @param signerOrProvider The ethers v5 signer or provider
 */
export const getContractsForChainOrThrow = (
  chainId: number,
  signerOrProvider?: Signer | Provider,
): Contracts => {
  const addresses = getContractAddressesForChainOrThrow(chainId);

  return {
    awinTokenContract: awinTokenFactory.connect(
      addresses.awinToken,
      signerOrProvider as Signer | Provider,
    ),
    awinAuctionHouseContract: awinAuctionHouseFactory.connect(
      addresses.awinAuctionHouseProxy,
      signerOrProvider as Signer | Provider,
    ),
    awinDescriptorContract: awinDescriptorFactory.connect(
      addresses.awinDescriptor,
      signerOrProvider as Signer | Provider,
    ),
    awinSeederContract: awinSeederFactory.connect(
      addresses.awinSeeder,
      signerOrProvider as Signer | Provider,
    ),
    awinDaoContract: awinDaoLogicV1Factory.connect(
      addresses.awinDAOProxy,
      signerOrProvider as Signer | Provider,
    ),
  };
};
