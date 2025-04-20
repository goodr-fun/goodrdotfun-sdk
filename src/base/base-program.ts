import * as GoodrFunIDL from './idl/idl.json';
import * as anchor from '@coral-xyz/anchor';
import { BN, IdlAccounts, IdlEvents } from '@coral-xyz/anchor';
import { GoodrFun } from './types/program';
import { BigNumber } from 'bignumber.js';
import {
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
} from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import {
  calculateWithSlippageBuy,
  calculateWithSlippageSell,
} from './helpers/helper';
import { BondingCurveAccount } from './states/bonding-curve-account';
import { GlobalAccount } from './states/global-account';

export const GLOBAL_SEED = 'global';
export const BONDING_CURVE_SEED = 'bonding_curve';
export const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);

export type GlobalState = IdlAccounts<GoodrFun>['global'];
export type BondingCurveState = IdlAccounts<GoodrFun>['bondingCurve'];

export type CreateEvent = IdlEvents<GoodrFun>['createEvent'];
export type CompleteEvent = IdlEvents<GoodrFun>['completeEvent'];
export type SetParamsEvent = IdlEvents<GoodrFun>['setParamsEvent'];
export type TradeEvent = IdlEvents<GoodrFun>['tradeEvent'];

export class GoodrFunProgramBase {
  private idl = Object.assign({}, GoodrFunIDL);

  constructor(public readonly connection: anchor.web3.Connection) {}

  get program() {
    return new anchor.Program(this.idl as anchor.Idl, {
      connection: this.connection,
    });
  }

  get accounts(): any {
    return this.program.account;
  }

  /**
   * Adds an event listener for the 'createEvent' event.
   * @param handler - The function to handle the event.
   */
  onCreateEvent(
    handler: (event: CreateEvent, slot: number, signature: string) => void,
  ): number {
    return this.program.addEventListener('createEvent', handler);
  }

  /**
   * Adds an event listener for the 'completeEvent' event.
   * @param handler - The function to handle the event.
   */
  onCompleteEvent(
    handler: (event: CompleteEvent, slot: number, signature: string) => void,
  ): number {
    return this.program.addEventListener('completeEvent', handler);
  }

  /**
   * Adds an event listener for the 'tradeEvent' event.
   * @param handler - The function to handle the event.
   */
  onTradeEvent(
    handler: (event: TradeEvent, slot: number, signature: string) => void,
  ): number {
    return this.program.addEventListener('tradeEvent', handler);
  }

  /**
   * Adds an event listener for the 'setParamsEvent' event.
   * @param handler - The function to handle the event.
   */
  onSetParamsEvent(
    handler: (event: SetParamsEvent, slot: number, signature: string) => void,
  ): number {
    return this.program.addEventListener('setParamsEvent', handler);
  }

  /**
   * Removes event listeners by their ids.
   * @param eventIds - The ids of the event listeners to remove.
   */
  removeListeners(eventIds: number[]) {
    console.log('Removing event listeners: ', eventIds);
    eventIds.forEach(eventId => {
      this.program.removeEventListener(eventId);
    });
  }

  /**
   * Returns the metadata PDA for a given mint.
   * @param mint - The mint to get the metadata PDA for.
   * @returns The metadata PDA.
   */
  metadataPDA({ mint }: { mint: PublicKey }): PublicKey {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID).toBuffer(),
        mint.toBuffer(),
      ],
      new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID),
    )[0];
  }

  /**
   * Returns the global PDA.
   * @returns The global PDA.
   */
  get globalPDA(): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_SEED)],
      this.program.programId,
    )[0];
  }

  /**
   * Returns the bonding curve PDA for a given mint.
   * @param mint - The mint to get the bonding curve PDA for.
   * @returns The bonding curve PDA.
   */
  bondingCurvePDA({ mint }: { mint: PublicKey }): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(BONDING_CURVE_SEED), mint.toBuffer()],
      this.program.programId,
    )[0];
  }

  /**
   * Returns the global state.
   * @returns The global state.
   */
  async getGlobalState(): Promise<GlobalState | null> {
    try {
      return await this.accounts.global.fetch(this.globalPDA);
    } catch (error) {
      return null;
    }
  }

  /**
   * Returns the global account.
   * @returns The global account.
   */
  async getGlobalAccount(): Promise<GlobalAccount | null> {
    try {
      const globalState = await this.accounts.global.fetch(this.globalPDA);
      const globalAccount = new GlobalAccount(
        globalState.initialized,
        globalState.authority,
        globalState.operatingWallet,
        globalState.initialVirtualTokenReserves.toNumber(),
        globalState.initialVirtualSolReserves.toNumber(),
        globalState.initialRealTokenReserves.toNumber(),
        globalState.tokenTotalSupply.toNumber(),
        globalState.operatingFeeBasisPoints.toNumber(),
        globalState.creatorFeeBasisPoints.toNumber(),
      );
      return globalAccount;
    } catch (error) {
      return null;
    }
  }

  /**
   * Returns the bonding curve state for a given mint.
   * @param mint - The mint to get the bonding curve state for.
   * @returns The bonding curve state.
   */
  async getBondingCurveState({
    mint,
  }: {
    mint: PublicKey;
  }): Promise<BondingCurveState | null> {
    try {
      return await this.accounts.bondingCurve.fetch(
        this.bondingCurvePDA({ mint }),
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * Returns the bonding curve state for a given mint.
   * @param mint - The mint to get the bonding curve state for.
   * @returns The bonding curve state.
   */
  async getBondingCurveAccount({
    mint,
  }: {
    mint: PublicKey;
  }): Promise<BondingCurveAccount | null> {
    try {
      const bondingCurveState = await this.accounts.bondingCurve.fetch(
        this.bondingCurvePDA({ mint }),
      );
      const bondingCurveAccount = new BondingCurveAccount(
        bondingCurveState.creator,
        new BigNumber(bondingCurveState.virtualTokenReserves.toNumber()),
        new BigNumber(bondingCurveState.virtualSolReserves.toNumber()),
        new BigNumber(bondingCurveState.realTokenReserves.toNumber()),
        new BigNumber(bondingCurveState.realSolReserves.toNumber()),
        new BigNumber(bondingCurveState.tokenTotalSupply.toNumber()),
        bondingCurveState.complete,
      );
      return bondingCurveAccount;
    } catch (error) {
      return null;
    }
  }

  /**
   * Initializes the global state.
   * @param authority - The authority to initialize the global state.
   * @returns The transaction.
   */
  async initialize({
    authority,
  }: {
    authority: PublicKey;
  }): Promise<Transaction> {
    return await this.program.methods
      .initialize()
      .accountsPartial({ authority, global: this.globalPDA })
      .transaction();
  }

  /**
   * Sets the parameters for the global state.
   * @param authority - The authority to set the parameters.
   * @returns The transaction.
   */
  async setParams({
    authority,
    operatingWallet,
    initialVirtualTokenReserves,
    initialVirtualSolReserves,
    initialRealTokenReserves,
    tokenTotalSupply,
    operatingFeeBasisPoints,
    creatorFeeBasisPoints,
  }: {
    authority: PublicKey;
    operatingWallet: PublicKey;
    initialVirtualTokenReserves: anchor.BN;
    initialVirtualSolReserves: anchor.BN;
    initialRealTokenReserves: anchor.BN;
    tokenTotalSupply: anchor.BN;
    operatingFeeBasisPoints: anchor.BN;
    creatorFeeBasisPoints: anchor.BN;
  }): Promise<Transaction> {
    return await this.program.methods
      .setParams(
        operatingWallet,
        initialVirtualTokenReserves,
        initialVirtualSolReserves,
        initialRealTokenReserves,
        tokenTotalSupply,
        operatingFeeBasisPoints,
        creatorFeeBasisPoints,
      )
      .accountsPartial({ authority, global: this.globalPDA })
      .transaction();
  }

  /**
   * Adds donation destinations to the global state.
   * @param authority - The authority to add the donation destinations.
   * @param donationDestinations - The donation destinations to add.
   * @returns The transaction.
   */
  async addDonationDestinations({
    authority,
    donationDestinations,
  }: {
    authority: PublicKey;
    donationDestinations: PublicKey[];
  }): Promise<Transaction> {
    return await this.program.methods
      .addDonationDestinations(donationDestinations)
      .accountsPartial({ authority, global: this.globalPDA })
      .transaction();
  }

  /**
   * Removes donation destinations from the global state.
   * @param authority - The authority to remove the donation destinations.
   * @param donationDestinations - The donation destinations to remove.
   * @returns The transaction.
   */
  async removeDonationDestinations({
    authority,
    donationDestinations,
  }: {
    authority: PublicKey;
    donationDestinations: PublicKey[];
  }): Promise<Transaction> {
    return await this.program.methods
      .removeDonationDestinations(donationDestinations)
      .accountsPartial({ authority, global: this.globalPDA })
      .transaction();
  }

  /**
   * Creates a new bonding curve.
   * @param user - The user to create the bonding curve.
   * @param mint - The mint to create the bonding curve for.
   * @param name - The name of the bonding curve.
   * @param symbol - The symbol of the bonding curve.
   * @param uri - The URI of the bonding curve.
   * @param donationDestination - The donation destination for the bonding curve.
   * @param donationAmount - The donation amount for the bonding curve.
   * @returns The transaction.
   */
  async create({
    user,
    mint,
    name,
    symbol,
    uri,
    donationDestination,
    donationAmount,
  }: {
    user: PublicKey;
    mint: Keypair;
    name: string;
    symbol: string;
    uri: string;
    donationDestination: PublicKey;
    donationAmount: anchor.BN;
  }): Promise<Transaction> {
    const tx = new Transaction();
    const createTx = await this.program.methods
      .create(name, symbol, uri, donationAmount)
      .accountsPartial({
        user,
        global: this.globalPDA,
        mint: mint.publicKey,
        associatedBondingCurve: getAssociatedTokenAddressSync(
          mint.publicKey,
          this.bondingCurvePDA({ mint: mint.publicKey }),
          true,
          TOKEN_2022_PROGRAM_ID,
        ),
        bondingCurve: this.bondingCurvePDA({ mint: mint.publicKey }),
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        donationDestination: donationDestination,
        associatedDonationDestination: getAssociatedTokenAddressSync(
          mint.publicKey,
          donationDestination,
          true,
          TOKEN_2022_PROGRAM_ID,
        ),
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
    tx.add(createTx);
    const hash = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = hash.blockhash;
    tx.feePayer = user;
    tx.partialSign(mint);

    return tx;
  }

  /**
   * Buys tokens from the bonding curve by SOL amount.
   * @param user - The user to buy the tokens.
   * @param mint - The mint to buy the tokens for.
   * @param buyAmountSol - The amount of SOL to buy.
   * @param slippageBasisPoints - The slippage basic points.
   * @returns The transaction.
   */
  async buyBySolAmount(
    user: PublicKey,
    mint: PublicKey,
    buyAmountSol: BigNumber,
    slippageBasisPoints = 500,
  ): Promise<Transaction> {
    const globalState = await this.getGlobalState();
    const bondingCurvePDA = this.bondingCurvePDA({ mint });
    const bondingCurveAccount = await this.getBondingCurveAccount({ mint });
    if (!bondingCurveAccount) {
      throw new Error('Bonding curve account not found');
    }
    const associatedBondingCurve = getAssociatedTokenAddressSync(
      mint,
      bondingCurvePDA,
      true,
      TOKEN_2022_PROGRAM_ID,
    );

    const associatedUser = getAssociatedTokenAddressSync(
      mint,
      user,
      true,
      TOKEN_2022_PROGRAM_ID,
    );
    const buyAmount = bondingCurveAccount.getBuyPrice(
      new BigNumber(buyAmountSol),
    );

    const buyAmountWithSlippage = calculateWithSlippageBuy(
      buyAmountSol,
      slippageBasisPoints,
    );

    return await this.program.methods
      .buy(
        new BN(buyAmount.toNumber()),
        new BN(buyAmountWithSlippage.toNumber()),
      )
      .accountsPartial({
        user,
        global: this.globalPDA,
        associatedBondingCurve,
        associatedUser,
        bondingCurve: bondingCurvePDA,
        mint: mint,
        operatingWallet: globalState?.operatingWallet,
        creatorWallet: bondingCurveAccount.creator,
      })
      .transaction();
  }

  /**
   * Sells tokens to the bonding curve by token amount.
   * @param user - The user to sell the tokens.
   * @param mint - The mint to sell the tokens for.
   * @param sellTokenAmount - The amount of tokens to sell.
   * @param slippageBasisPoints - The slippage basic points.
   * @returns The transaction.
   */
  async sellByTokenAmount(
    user: PublicKey,
    mint: PublicKey,
    sellTokenAmount: BigNumber,
    slippageBasisPoints = 500,
  ): Promise<Transaction> {
    const globalAccount = await this.getGlobalAccount();
    const bondingCurveAccount = await this.getBondingCurveAccount({ mint });
    const bondingCurvePDA = this.bondingCurvePDA({ mint });
    const associatedBondingCurve = getAssociatedTokenAddressSync(
      mint,
      bondingCurvePDA,
      true,
      TOKEN_2022_PROGRAM_ID,
    );
    if (!bondingCurveAccount || !globalAccount) {
      throw new Error('Bonding curve account or global account not found');
    }
    const minSolOutput = bondingCurveAccount.getSellPrice(
      sellTokenAmount,
      globalAccount.operatingFeeBasisPoints,
      globalAccount.creatorFeeBasisPoints,
    );

    const sellAmountWithSlippage = calculateWithSlippageSell(
      minSolOutput,
      slippageBasisPoints,
    );

    const associatedUser = getAssociatedTokenAddressSync(
      mint,
      user,
      false,
      TOKEN_2022_PROGRAM_ID,
    );

    return await this.program.methods
      .sell(
        new BN(sellTokenAmount.toNumber()),
        new BN(Math.floor(sellAmountWithSlippage.toNumber())),
      )
      .accountsPartial({
        user,
        global: this.globalPDA,
        mint: mint,
        bondingCurve: bondingCurvePDA,
        associatedBondingCurve: associatedBondingCurve,
        associatedUser: associatedUser,
        operatingWallet: globalAccount.operatingWallet,
        creatorWallet: bondingCurveAccount.creator,
      })
      .transaction();
  }

  /**
   * Withdraws tokens from the bonding curve.
   * @param user - The user to withdraw the tokens.
   * @param mint - The mint to withdraw the tokens for.
   * @returns The transaction.
   */
  async withdraw({
    user,
    mint,
  }: {
    user: PublicKey;
    mint: PublicKey;
  }): Promise<Transaction> {
    const globalState = await this.getGlobalState();
    const bondingCurveState = this.bondingCurvePDA({ mint });

    const bondingCurve =
      await this.accounts.bondingCurve.fetch(bondingCurveState);

    const associatedUser = getAssociatedTokenAddressSync(
      mint,
      user,
      false,
      TOKEN_2022_PROGRAM_ID,
    );

    const associatedBondingCurve = getAssociatedTokenAddressSync(
      mint,
      bondingCurveState,
      true,
      TOKEN_2022_PROGRAM_ID,
    );
    return await this.program.methods
      .withdraw()
      .accountsPartial({
        user,
        global: this.globalPDA,
        associatedBondingCurve: associatedBondingCurve,
        bondingCurve: bondingCurveState,
        mint: mint,
        operatingWallet: globalState?.operatingWallet,
        associatedUser: associatedUser,
        creatorWallet: bondingCurve?.creatorWallet,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .transaction();
  }

  /**
   * Calculates the amount of tokens to buy from the bonding curve.
   * @param mint - The mint to buy the tokens for.
   * @param amountSol - The amount of SOL to buy the tokens with.
   * @param slippage - The slippage percentage.
   * @returns The amount of tokens to buy and the maximum cost in SOL.
   */
  async calculateBuyTokenAmount({
    mint,
    amountSol,
    slippage,
  }: {
    mint: PublicKey;
    amountSol: anchor.BN;
    slippage: number;
  }): Promise<{
    amountToken: anchor.BN;
    maxCostSol: anchor.BN;
  }> {
    const bondingCurveState = await this.getBondingCurveState({ mint });
    if (bondingCurveState) {
      const virtualSolReserves = bondingCurveState?.virtualSolReserves;
      const virtualTokenReserves = bondingCurveState?.virtualTokenReserves;
      const constant = virtualSolReserves.mul(virtualTokenReserves);
      let deltaToken = virtualTokenReserves.sub(
        constant.div(virtualSolReserves.add(amountSol)),
      );
      if (deltaToken.gt(bondingCurveState.realTokenReserves)) {
        deltaToken = bondingCurveState.realTokenReserves;
      }
      return {
        amountToken: deltaToken,
        maxCostSol: amountSol.mul(new BN(slippage + 100)).div(new BN(100)),
      };
    } else {
      const globalState = await this.getGlobalState();
      const virtualSolReserves = globalState?.initialVirtualSolReserves;
      const virtualTokenReserves = globalState?.initialVirtualTokenReserves;
      if (!virtualSolReserves || !virtualTokenReserves) {
        throw new Error('Virtual reserves not found');
      }
      const constant = virtualSolReserves.mul(virtualTokenReserves);
      const deltaToken = virtualTokenReserves.sub(
        constant.div(virtualSolReserves.add(amountSol)),
      );
      return {
        amountToken: deltaToken,
        maxCostSol: amountSol.mul(new BN(slippage + 100)).div(new BN(100)),
      };
    }
  }

  /**
   * Calculates the amount of tokens to sell to the bonding curve.
   * @param mint - The mint to sell the tokens for.
   * @param amountToken - The amount of tokens to sell.
   * @param slippage - The slippage percentage.
   * @returns The amount of tokens to sell and the minimum amount of SOL to receive.
   */
  async calculateSellTokenAmount({
    mint,
    amountToken,
    slippage,
  }: {
    mint: PublicKey;
    amountToken: anchor.BN;
    slippage: number;
  }): Promise<{
    amountToken: anchor.BN;
    minSolReceived: anchor.BN;
  }> {
    const bondingCurveState = await this.getBondingCurveState({ mint });
    if (!bondingCurveState) {
      throw new Error('Bonding curve state not found');
    }
    const virtualSolReserves = bondingCurveState?.virtualSolReserves;
    const virtualTokenReserves = bondingCurveState?.virtualTokenReserves;
    if (!virtualSolReserves || !virtualTokenReserves) {
      throw new Error('Virtual reserves not found');
    }
    const constant = virtualSolReserves.mul(virtualTokenReserves);
    const deltaSol = virtualSolReserves.sub(
      constant.div(virtualTokenReserves.add(amountToken)),
    );
    return {
      amountToken: amountToken,
      minSolReceived: deltaSol.mul(new BN(100 - slippage)).div(new BN(100)),
    };
  }

  async getPriceAndMarketcap(mint: PublicKey) {
    const bondingCurveState = await this.getBondingCurveState({ mint });

    const virtualSolReserves = bondingCurveState?.virtualSolReserves.toNumber();
    const virtualTokenReserves =
      bondingCurveState?.virtualTokenReserves.toNumber();
    const tokenTotalSupply = bondingCurveState?.tokenTotalSupply.toNumber();
    if (!virtualSolReserves || !virtualTokenReserves || !tokenTotalSupply) {
      throw new Error('Bonding curve state not found');
    }
    const constant = virtualSolReserves * virtualTokenReserves;
    const deltaSol = virtualSolReserves - constant / (virtualTokenReserves + 1);
    return {
      price: deltaSol,
      marketcap: deltaSol * tokenTotalSupply,
    };
  }

  async getBondingCurveProgress(mint: PublicKey) {
    const bondingCurveState = await this.getBondingCurveState({ mint });
    if (!bondingCurveState) {
      throw new Error('Bonding curve state not found');
    }
    const globalState = await this.getGlobalState();
    if (!globalState) {
      throw new Error('Global state not found');
    }

    const progress =
      bondingCurveState.realTokenReserves.toNumber() /
      globalState.initialRealTokenReserves.toNumber();

    const progressPercentage = (1 - progress) * 100;
    return progressPercentage;
  }
}
