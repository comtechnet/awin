import { config } from './config';
import { Contract, providers } from 'ethers';
import { NFTStorage } from 'nft.storage';
import { awinTokenABI } from '@awin/contracts';
import Redis from 'ioredis';

/**
 * IFPS Storage Client
 */
export const storage = new NFTStorage({ token: config.nftStorageApiKey });

/**
 * Redis Client
 */
export const redis = new Redis(config.redisPort, config.redisHost);

/**
 * Ethers JSON RPC Provider
 */
export const jsonRpcProvider = new providers.JsonRpcProvider(config.jsonRpcUrl);

/**
 * awin ERC721 Token Contract
 */
export const awinTokenContract = new Contract(
  config.awinTokenAddress,
  awinTokenABI,
  jsonRpcProvider,
);
