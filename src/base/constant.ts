import { Commitment, Finality } from '@solana/web3.js';

export const DEFAULT_COMMITMENT: Commitment = 'finalized';
export const DEFAULT_FINALITY: Finality = 'finalized';
export const DEFAULT_SLIPPAGE_BASIS_POINTS = 500;
export const TOKEN_DECIMALS = 6;

// SONIC-specific constants
export const BONDING_CURVE_V2_SEED = 'bonding_curve_v2';
