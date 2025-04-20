import { PublicKey } from '@solana/web3.js';

// Add your types here

export type CreateEvent = {
  name: string;
  symbol: string;
  uri: string;
  mint: PublicKey;
  bondingCurve: PublicKey;
  donationDestination: PublicKey;
  user: PublicKey;
};

export type TradeEvent = {
  mint: PublicKey;
  solAmount: BigNumber;
  tokenAmount: BigNumber;
  isBuy: boolean;
  user: PublicKey;
  timestamp: BigNumber;
  virtualSolReserves: BigNumber;
  virtualTokenReserves: BigNumber;
  realTokenReserves: BigNumber;
  realSolReserves: BigNumber;
};

export type CompleteEvent = {
  user: PublicKey;
  mint: PublicKey;
  bondingCurve: PublicKey;
  timestamp: BigNumber;
};

export type SetParamsEvent = {
  operatingWallet: PublicKey;
  initialVirtualTokenReserves: BigNumber;
  initialVirtualSolReserves: BigNumber;
  initialRealTokenReserves: BigNumber;
  tokenTotalSupply: BigNumber;
  operatingFeeBasisPoints: BigNumber;
  creatorFeeBasisPoints: BigNumber;
};

export interface GoodrFunEventHandlers {
  createEvent: CreateEvent;
  tradeEvent: TradeEvent;
  completeEvent: CompleteEvent;
  setParamsEvent: SetParamsEvent;
}

export type GoodrFunEventType = keyof GoodrFunEventHandlers;
