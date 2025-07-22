import { Connection } from '@solana/web3.js';
import {
  BondingCurveState,
  BondingCurveV2State,
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

    const decimalBN = new BigNumber(10).pow(this._decimals);

    // Apply the same scaling as getCurrentState for V1 (SOL)
    const priceBN = new BigNumber(deltaSol).div(new BigNumber(10).pow(3));
    const marketCapBN = new BigNumber(deltaSol * tokenTotalSupply).div(
      new BigNumber(10).pow(9),
    );
    const totalSupplyBN = new BigNumber(tokenTotalSupply).div(decimalBN);

    return {
      price: priceBN,
      marketCap: marketCapBN,
      totalSupply: totalSupplyBN,
    };
  }

  async getPriceDataFromStateV2(
    bondingCurveV2State: BondingCurveV2State,
  ): Promise<PriceData> {
    const virtualBaseReserves =
      bondingCurveV2State?.virtualBaseReserves.toNumber();
    const virtualTokenReserves =
      bondingCurveV2State?.virtualTokenReserves.toNumber();
    const tokenTotalSupply = bondingCurveV2State?.tokenTotalSupply.toNumber();
    const constant = virtualBaseReserves * virtualTokenReserves;
    const deltaBase =
      virtualBaseReserves - constant / (virtualTokenReserves + 1);

    const decimalBN = new BigNumber(10).pow(this._decimals);

    // Apply the same scaling as getCurrentState for V2 (SONIC)
    const priceBN = new BigNumber(deltaBase).div(new BigNumber(10).pow(3));
    const marketCapBN = new BigNumber(deltaBase * tokenTotalSupply).div(
      new BigNumber(10).pow(9),
    );
    const totalSupplyBN = new BigNumber(tokenTotalSupply).div(decimalBN);
    return {
      price: priceBN,
      marketCap: marketCapBN,
      totalSupply: totalSupplyBN,
    };
  }
}
