import { PublicKey } from '@solana/web3.js';
import { BigNumber } from 'bignumber.js';

export class GlobalAccount {
  public initialized: boolean = false;
  public authority: PublicKey;
  public operatingWallet: PublicKey;
  public initialVirtualTokenReserves: BigNumber;
  public initialVirtualSolReserves: BigNumber;
  public initialRealTokenReserves: BigNumber;
  public tokenTotalSupply: BigNumber;
  public operatingFeeBasisPoints: number;
  public creatorFeeBasisPoints: number;

  constructor(
    initialized: boolean,
    authority: PublicKey,
    operatingWallet: PublicKey,
    initialVirtualTokenReserves: BigNumber,
    initialVirtualSolReserves: BigNumber,
    initialRealTokenReserves: BigNumber,
    tokenTotalSupply: BigNumber,
    operatingFeeBasisPoints: number,
    creatorFeeBasisPoints: number,
  ) {
    this.initialized = initialized;
    this.authority = authority;
    this.operatingWallet = operatingWallet;
    this.initialVirtualTokenReserves = initialVirtualTokenReserves;
    this.initialVirtualSolReserves = initialVirtualSolReserves;
    this.initialRealTokenReserves = initialRealTokenReserves;
    this.tokenTotalSupply = tokenTotalSupply;
    this.operatingFeeBasisPoints = operatingFeeBasisPoints;
    this.creatorFeeBasisPoints = creatorFeeBasisPoints;
  }

  getInitialBuyPrice(amount: BigNumber): BigNumber {
    if (amount.isZero() || amount.isNegative()) {
      return new BigNumber(0);
    }

    const n = this.initialVirtualSolReserves
      .multipliedBy(this.initialVirtualTokenReserves)
      .dividedBy(1);
    const i = this.initialVirtualSolReserves.plus(amount);
    const r = n.dividedBy(i).plus(1);
    const s = this.initialVirtualTokenReserves.minus(r);
    return s.lt(this.initialRealTokenReserves)
      ? s
      : this.initialRealTokenReserves;
  }
}
