import {
  awinTokenFactory,
  awinAuctionHouseFactory,
  awinDescriptorFactory,
  awinSeederFactory,
  awinDaoLogicV1Factory,
} from '@awin/contracts';

export interface ContractAddresses {
  awinToken: string;
  awinSeeder: string;
  awinDescriptor: string;
  nftDescriptor: string;
  awinAuctionHouse: string;
  awinAuctionHouseProxy: string;
  awinAuctionHouseProxyAdmin: string;
  awinDaoExecutor: string;
  awinDAOProxy: string;
  awinDAOLogicV1: string;
}

export interface Contracts {
  awinTokenContract: ReturnType<typeof awinTokenFactory.connect>;
  awinAuctionHouseContract: ReturnType<typeof awinAuctionHouseFactory.connect>;
  awinDescriptorContract: ReturnType<typeof awinDescriptorFactory.connect>;
  awinSeederContract: ReturnType<typeof awinSeederFactory.connect>;
  awinDaoContract: ReturnType<typeof awinDaoLogicV1Factory.connect>;
}

export enum ChainId {
  Mainnet = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Kovan = 42,
  Local = 31337,
}
