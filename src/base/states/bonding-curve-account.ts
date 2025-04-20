import { PublicKey } from '@solana/web3.js';
import { BigNumber } from 'bignumber.js';

export class BondingCurveAccount {
  public creator: PublicKey;
  public virtualTokenReserves: BigNumber;
  public virtualSolReserves: BigNumber;
  public realTokenReserves: BigNumber;
  public realSolReserves: BigNumber;
  public tokenTotalSupply: BigNumber;
  public complete: boolean;

  constructor(
    creator: PublicKey,
    virtualTokenReserves: BigNumber,
    virtualSolReserves: BigNumber,
    realTokenReserves: BigNumber,
    realSolReserves: BigNumber,
    tokenTotalSupply: BigNumber,
    complete: boolean,
  ) {
    this.creator = creator;
    this.virtualTokenReserves = virtualTokenReserves;
    this.virtualSolReserves = virtualSolReserves;
    this.realTokenReserves = realTokenReserves;
    this.realSolReserves = realSolReserves;
    this.tokenTotalSupply = tokenTotalSupply;
    this.complete = complete;
  }

  getBuyPrice(amount: BigNumber): BigNumber {
    if (this.complete) {
      throw new Error('Curve is complete');
    }

    if (amount.isNegative() || amount.isZero()) {
      return new BigNumber(0);
    }

    // Calculate the product of virtual reserves
    const n = this.virtualSolReserves.multipliedBy(this.virtualTokenReserves);

    // Calculate the new virtual sol reserves after the purchase
    const i = this.virtualSolReserves.plus(amount);

    // Calculate the new virtual token reserves after the purchase
    const r = n.dividedBy(i).plus(1);

    // Calculate the amount of tokens to be purchased
    const s = this.virtualTokenReserves.minus(r);

    // Return the minimum of the calculated tokens and real token reserves
    return s.lt(this.realTokenReserves) ? s : this.realTokenReserves;
  }

  getSellPrice(
    amount: BigNumber,
    operatingFeeBasisPoints: number,
    creatorFeeBasisPoints: number,
  ): BigNumber {
    if (this.complete) {
      throw new Error('Curve is complete');
    }

    if (amount.isNegative() || amount.isZero()) {
      return new BigNumber(0);
    }

    // Calculate the proportional amount of virtual sol reserves to be received
    const n = amount
      .multipliedBy(this.virtualSolReserves)
      .dividedBy(this.virtualTokenReserves.plus(amount));
    // Calculate the fee amount in the same units
    const a = n
      .multipliedBy(new BigNumber(operatingFeeBasisPoints))
      .dividedBy(10000);
    const b = n
      .multipliedBy(new BigNumber(creatorFeeBasisPoints))
      .dividedBy(10000);

    // Return the net amount after deducting the fee
    return n.minus(a).minus(b);
  }

  getBondingCurveProgress(initialRealTokenReserves: BigNumber): number {
    const progress = this.realTokenReserves.dividedBy(initialRealTokenReserves);

    const progressPercentage = new BigNumber(1)
      .minus(progress)
      .multipliedBy(100);
    return progressPercentage.toNumber();
  }

  getMarketCapSOL(): BigNumber {
    if (this.virtualTokenReserves.isZero()) {
      return new BigNumber(0);
    }

    return this.tokenTotalSupply
      .multipliedBy(this.virtualSolReserves)
      .dividedBy(this.virtualTokenReserves);
  }

  getFinalMarketCapSOL(
    operatingFeeBasisPoints: number,
    creatorFeeBasisPoints: number,
  ): BigNumber {
    const totalSellValue = this.getBuyOutPrice(
      this.realTokenReserves,
      operatingFeeBasisPoints,
      creatorFeeBasisPoints,
    );
    const totalVirtualValue = this.virtualSolReserves.plus(totalSellValue);
    const totalVirtualTokens = this.virtualTokenReserves.minus(
      this.realTokenReserves,
    );

    if (totalVirtualTokens.isZero()) {
      return new BigNumber(0);
    }

    return this.tokenTotalSupply
      .multipliedBy(totalVirtualValue)
      .dividedBy(totalVirtualTokens);
  }

  getBuyOutPrice(
    amount: BigNumber,
    operatingFeeBasisPoints: number,
    creatorFeeBasisPoints: number,
  ): BigNumber {
    const solTokens = amount.lt(this.realSolReserves)
      ? this.realSolReserves
      : amount;
    const totalSellValue = solTokens
      .multipliedBy(this.virtualSolReserves)
      .dividedBy(this.virtualTokenReserves.minus(solTokens))
      .plus(1);
    const operatingFee = totalSellValue
      .multipliedBy(operatingFeeBasisPoints)
      .dividedBy(10000);
    const creatorFee = totalSellValue
      .multipliedBy(creatorFeeBasisPoints)
      .dividedBy(10000);
    return totalSellValue.plus(operatingFee).plus(creatorFee);
  }
}
