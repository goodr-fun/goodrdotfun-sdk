import { Keypair, PublicKey } from '@solana/web3.js';
import { MemeDonationDestinationName } from '../base/meme-donation-destination';
import { BigNumber } from 'bignumber.js';

export type DonationAmount =
  | 50_000_000
  | 100_000_000
  | 200_000_000
  | 500_000_000
  | 1_000_000_000;

export type TokenCreationMetadata = {
  name: string;
  symbol: string;
  metadataUri: string;
};

export type CreateAndBuyParams = {
  mint: Keypair;
  metadata: TokenCreationMetadata;
  buySolAmount: BigNumber;
  meme: MemeDonationDestinationName;
  slippageBasisPoints: number;
};

export type BuyParams = {
  mint: PublicKey;
  slippageBasisPoints: number;
  solAmount: BigNumber;
};

export type SellParams = {
  mint: PublicKey;
  slippageBasisPoints: number;
  tokenAmount: BigNumber;
};

// SONIC-specific parameter types
export type CreateAndBuyWithSonicParams = {
  mint: Keypair;
  metadata: TokenCreationMetadata;
  buySonicAmount: BigNumber;
  baseCurrencyMint: PublicKey;
  meme: MemeDonationDestinationName;
  slippageBasisPoints: number;
};

export type BuyWithSonicParams = {
  mint: PublicKey;
  slippageBasisPoints: number;
  sonicAmount: BigNumber;
  baseCurrencyMint: PublicKey;
};

export type SellWithSonicParams = {
  mint: PublicKey;
  slippageBasisPoints: number;
  tokenAmount: BigNumber;
  baseCurrencyMint: PublicKey;
};
