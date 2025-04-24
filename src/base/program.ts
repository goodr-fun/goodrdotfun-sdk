import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  BondingCurveState,
  GlobalState,
  GoodrFunProgramBase,
} from './base-program';
import { TOKEN_DECIMALS } from './constant';
import { PriceData } from './types/common';
import { BigNumber } from 'bignumber.js';

export class GoodrFunProgram extends GoodrFunProgramBase {
  private _decimals = TOKEN_DECIMALS;

  constructor(rpcEndpoint: string) {
    const connection = new Connection(rpcEndpoint, 'confirmed');
    super(connection);
  }

  get decimals() {
    return this._decimals;
  }

  async getBondingCurveProgressFromState(
    bondingCurveState: BondingCurveState,
    globalState: GlobalState,
  ): Promise<number> {
    const progress =
      bondingCurveState.realTokenReserves.toNumber() /
      globalState.initialRealTokenReserves.toNumber();

    const progressPercentage = (1 - progress) * 100;
    return progressPercentage;
  }

  async getPriceDataFromState(
    bondingCurveState: BondingCurveState,
  ): Promise<PriceData> {
    const virtualSolReserves = bondingCurveState?.virtualSolReserves.toNumber();
    const virtualTokenReserves =
      bondingCurveState?.virtualTokenReserves.toNumber();
    const tokenTotalSupply = bondingCurveState?.tokenTotalSupply.toNumber();
    const constant = virtualSolReserves * virtualTokenReserves;
    const deltaSol = virtualSolReserves - constant / (virtualTokenReserves + 1);

    const lamportPerSolBN = new BigNumber(LAMPORTS_PER_SOL);
    const decimalBN = new BigNumber(10).pow(this._decimals);

    const priceBN = new BigNumber(deltaSol).div(lamportPerSolBN);
    const marketCapBN = new BigNumber(deltaSol * tokenTotalSupply).div(
      lamportPerSolBN,
    );
    const totalSupplyBN = new BigNumber(tokenTotalSupply).div(decimalBN);
    return {
      price: priceBN,
      marketCap: marketCapBN,
      totalSupply: totalSupplyBN,
    };
  }
}
