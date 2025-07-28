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
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  calculateWithSlippageBuy,
  calculateWithSlippageSell,
} from './helpers/helper';
import { BondingCurveAccount, GlobalAccount } from './states';
import { BONDING_CURVE_V2_SEED } from './constant';

export const GLOBAL_SEED = 'global';
export const BONDING_CURVE_SEED = 'bonding_curve';
export const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);

export type GlobalState = IdlAccounts<GoodrFun>['global'];
export type BondingCurveState = IdlAccounts<GoodrFun>['bondingCurve'];
export type BondingCurveV2State = IdlAccounts<GoodrFun>['bondingCurveV2'];

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

  get accounts(): anchor.Program['account'] {
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
   * Returns the bonding curve V2 PDA for a given mint (SONIC operations).
   * @param mint - The mint to get the bonding curve V2 PDA for.
   * @returns The bonding curve V2 PDA.
   */
  bondingCurveV2PDA({ mint }: { mint: PublicKey }): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(BONDING_CURVE_V2_SEED), mint.toBuffer()],
      this.program.programId,
    )[0];
  }

  /**
   * Helper function to determine token program for a mint.
   * @param mint - The mint to check
   * @returns The appropriate token program ID
   */
  async getTokenProgramForMint(mint: PublicKey): Promise<PublicKey> {
    // SONIC tokens are always in TOKEN_2022_PROGRAM_ID
    const SONIC_MAINNET_MINT = 'mrujEYaN1oyQXDHeYNxBYpxWKVkQ2XsGxfznpifu4aL';
    const SONIC_TESTNET_MINT = 'Dp3dL14gJMQDCxE2XZKd4Jz42TShQLY7gGzU2YgmVY2J';

    const mintString = mint.toString();

    // Force TOKEN_2022_PROGRAM_ID for SONIC tokens
    if (
      mintString === SONIC_MAINNET_MINT ||
      mintString === SONIC_TESTNET_MINT
    ) {
      console.log(
        '🔧 SDK: Forcing TOKEN_2022_PROGRAM_ID for SONIC mint:',
        mintString,
      );
      return TOKEN_2022_PROGRAM_ID;
    }

    try {
      const mintInfo = await this.connection.getAccountInfo(mint);
      if (!mintInfo) {
        console.log(
          '⚠️ SDK: Mint account not found, defaulting to TOKEN_2022_PROGRAM_ID',
        );
        return TOKEN_2022_PROGRAM_ID;
      }

      if (mintInfo.owner.equals(TOKEN_2022_PROGRAM_ID)) {
        console.log(
          '✅ SDK: Detected TOKEN_2022_PROGRAM_ID for mint:',
          mintString,
        );
        return TOKEN_2022_PROGRAM_ID;
      } else if (mintInfo.owner.equals(TOKEN_PROGRAM_ID)) {
        console.log('✅ SDK: Detected TOKEN_PROGRAM_ID for mint:', mintString);
        return TOKEN_PROGRAM_ID;
      } else {
        console.log(
          '❌ SDK: Invalid mint owner program, defaulting to TOKEN_2022_PROGRAM_ID',
        );
        return TOKEN_2022_PROGRAM_ID;
      }
    } catch (error) {
      console.log(
        '⚠️ SDK: Error detecting token program, defaulting to TOKEN_2022_PROGRAM_ID:',
        error,
      );
      return TOKEN_2022_PROGRAM_ID;
    }
  }

  /**
   * Returns the global state.
   * @returns The global state.
   */
  async getGlobalState(): Promise<GlobalState | null> {
    try {
      return await (
        this.program as unknown as anchor.Program<GoodrFun>
      ).account.global.fetch(this.globalPDA);
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
      const globalState = await (
        this.program as unknown as anchor.Program<GoodrFun>
      ).account.global.fetch(this.globalPDA);
      const globalAccount = new GlobalAccount(
        globalState.initialized,
        globalState.authority,
        globalState.operatingWallet,
        new BigNumber(globalState.initialVirtualTokenReserves.toString()),
        new BigNumber(globalState.initialVirtualSolReserves.toString()),
        new BigNumber(globalState.initialRealTokenReserves.toString()),
        new BigNumber(globalState.tokenTotalSupply.toString()),
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
      return await (
        this.program as unknown as anchor.Program<GoodrFun>
      ).account.bondingCurve.fetch(this.bondingCurvePDA({ mint }));
    } catch (error) {
      return null;
    }
  }

  /**
   * Returns the bonding curve V2 state for a given mint (SONIC operations).
   * @param mint - The mint to get the bonding curve V2 state for.
   * @returns The bonding curve V2 state.
   */
  async getBondingCurveV2State({
    mint,
  }: {
    mint: PublicKey;
  }): Promise<BondingCurveV2State | null> {
    try {
      return await (
        this.program as unknown as anchor.Program<GoodrFun>
      ).account.bondingCurveV2.fetch(this.bondingCurveV2PDA({ mint }));
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
      const bondingCurveState = await (
        this.program as unknown as anchor.Program<GoodrFun>
      ).account.bondingCurve.fetch(this.bondingCurvePDA({ mint }));
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

  async updateAuthority({
    authority,
    newAuthority,
  }: {
    authority: PublicKey;
    newAuthority: PublicKey;
  }): Promise<Transaction> {
    return await this.program.methods
      .updateAuthority(newAuthority)
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
   * Creates a new bonding curve with SPL token (SONIC) as base currency.
   * @param user - The user to create the bonding curve.
   * @param mint - The mint to create the bonding curve for.
   * @param sonicMint - The SONIC mint address.
   * @param name - The name of the bonding curve.
   * @param symbol - The symbol of the bonding curve.
   * @param uri - The URI of the bonding curve.
   * @param donationDestination - The donation destination for the bonding curve.
   * @param donationAmount - The donation amount for the bonding curve.
   * @returns The transaction.
   */
  async createWithSpl({
    user,
    mint,
    sonicMint,
    name,
    symbol,
    uri,
    donationDestination,
    donationAmount,
  }: {
    user: PublicKey;
    mint: Keypair;
    sonicMint: PublicKey;
    name: string;
    symbol: string;
    uri: string;
    donationDestination: PublicKey;
    donationAmount: anchor.BN;
  }): Promise<Transaction> {
    // Determine the token program for SONIC mint
    const sonicTokenProgram = await this.getTokenProgramForMint(sonicMint);

    const tx = new Transaction();
    const createTx = await this.program.methods
      .createWithSpl(name, symbol, uri, donationAmount)
      .accountsPartial({
        user,
        global: this.globalPDA,
        sonicMint,
        mint: mint.publicKey,
        donationDestination: donationDestination,
        associatedBondingCurve: getAssociatedTokenAddressSync(
          mint.publicKey,
          this.bondingCurveV2PDA({ mint: mint.publicKey }),
          true,
          TOKEN_2022_PROGRAM_ID,
        ),
        associatedDonationDestination: getAssociatedTokenAddressSync(
          mint.publicKey,
          donationDestination,
          true,
          TOKEN_2022_PROGRAM_ID,
        ),
        bondingCurveSonicAccount: getAssociatedTokenAddressSync(
          sonicMint,
          this.bondingCurveV2PDA({ mint: mint.publicKey }),
          true,
          sonicTokenProgram,
        ),
        bondingCurve: this.bondingCurveV2PDA({ mint: mint.publicKey }),
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        splTokenProgram: sonicTokenProgram,
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
   * Buys tokens from the bonding curve.
   * @param user - The user to buy the tokens.
   * @param mint - The mint to buy the tokens for.
   * @param amount - The amount of tokens to buy.
   * @param maxCostSol - The maximum cost in SOL to buy the tokens.
   * @returns The transaction.
   */
  async buy({
    user,
    mint,
    amount,
    maxCostSol,
    creatorWallet,
  }: {
    user: PublicKey;
    mint: PublicKey;
    amount: anchor.BN;
    maxCostSol: anchor.BN;
    creatorWallet: PublicKey;
  }): Promise<Transaction> {
    const globalState = await this.getGlobalState();
    const bondingCurvePDA = this.bondingCurvePDA({ mint });
    const associatedBondingCurve = getAssociatedTokenAddressSync(
      mint,
      bondingCurvePDA,
      true,
      TOKEN_2022_PROGRAM_ID,
    );

    const associatedUser = getAssociatedTokenAddressSync(
      mint,
      user,
      false,
      TOKEN_2022_PROGRAM_ID,
    );

    return await this.program.methods
      .buy(amount, maxCostSol)
      .accountsPartial({
        user,
        global: this.globalPDA,
        associatedBondingCurve: associatedBondingCurve,
        bondingCurve: bondingCurvePDA,
        mint: mint,
        associatedUser: associatedUser,
        operatingWallet: globalState?.operatingWallet,
        creatorWallet: creatorWallet,
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
   * Buys tokens from the bonding curve using SPL token (SONIC).
   * @param user - The user to buy the tokens.
   * @param mint - The mint to buy the tokens for.
   * @param sonicMint - The SONIC mint address.
   * @param amount - The amount of tokens to buy.
   * @param maxCostSonic - The maximum cost in SONIC to buy the tokens.
   * @param creatorWallet - The creator wallet to receive fees.
   * @returns The transaction.
   */
  async buyWithSpl({
    user,
    mint,
    sonicMint,
    amount,
    maxCostSonic,
    creatorWallet,
  }: {
    user: PublicKey;
    mint: PublicKey;
    sonicMint: PublicKey;
    amount: anchor.BN;
    maxCostSonic: anchor.BN;
    creatorWallet: PublicKey;
  }): Promise<Transaction> {
    const globalState = await this.getGlobalState();
    const bondingCurveV2PDA = this.bondingCurveV2PDA({ mint });

    // Determine the token program for SONIC mint
    const sonicTokenProgram = await this.getTokenProgramForMint(sonicMint);

    const associatedBondingCurve = getAssociatedTokenAddressSync(
      mint,
      bondingCurveV2PDA,
      true,
      TOKEN_2022_PROGRAM_ID,
    );
    const associatedBondingCurveSonic = getAssociatedTokenAddressSync(
      sonicMint,
      bondingCurveV2PDA,
      true,
      sonicTokenProgram,
    );

    const associatedUser = getAssociatedTokenAddressSync(
      mint,
      user,
      false,
      TOKEN_2022_PROGRAM_ID,
    );
    const associatedUserSonic = getAssociatedTokenAddressSync(
      sonicMint,
      user,
      false,
      sonicTokenProgram,
    );
    if (!globalState?.operatingWallet) {
      throw new Error('Global state or operating wallet not found');
    }
    const operatingWalletSonic = getAssociatedTokenAddressSync(
      sonicMint,
      globalState.operatingWallet,
      true, // allowOwnerOffCurve for operating wallet
      sonicTokenProgram,
    );
    const creatorWalletSonic = getAssociatedTokenAddressSync(
      sonicMint,
      creatorWallet,
      false,
      sonicTokenProgram,
    );

    return await this.program.methods
      .buyWithSpl(amount, maxCostSonic)
      .accountsPartial({
        user,
        global: this.globalPDA,
        sonicMint,
        creatorWallet,
        operatingWallet: globalState?.operatingWallet,
        userSonicAccount: associatedUserSonic,
        creatorSonicAccount: creatorWalletSonic,
        operatingSonicAccount: operatingWalletSonic,
        bondingCurveTokenAccount: associatedBondingCurve,
        bondingCurveSonicAccount: associatedBondingCurveSonic,
        bondingCurve: bondingCurveV2PDA,
        userTokenAccount: associatedUser,
        mint,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        sonicTokenProgram: sonicTokenProgram,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
  }

  /**
   * Sells tokens to the bonding curve for SPL token (SONIC).
   * @param user - The user to sell the tokens.
   * @param mint - The mint to sell the tokens for.
   * @param sonicMint - The SONIC mint address.
   * @param amount - The amount of tokens to sell.
   * @param minSonicReceived - The minimum amount of SONIC to receive.
   * @param creatorWallet - The creator wallet to receive fees.
   * @returns The transaction.
   */
  async sellWithSpl({
    user,
    mint,
    sonicMint,
    amount,
    minSonicReceived,
    creatorWallet,
  }: {
    user: PublicKey;
    mint: PublicKey;
    sonicMint: PublicKey;
    amount: anchor.BN;
    minSonicReceived: anchor.BN;
    creatorWallet: PublicKey;
  }): Promise<Transaction> {
    const globalState = await this.getGlobalState();
    const bondingCurveV2PDA = this.bondingCurveV2PDA({ mint });

    // Determine the token program for SONIC mint
    const sonicTokenProgram = await this.getTokenProgramForMint(sonicMint);

    const associatedBondingCurve = getAssociatedTokenAddressSync(
      mint,
      bondingCurveV2PDA,
      true,
      TOKEN_2022_PROGRAM_ID,
    );
    const associatedBondingCurveSonic = getAssociatedTokenAddressSync(
      sonicMint,
      bondingCurveV2PDA,
      true,
      sonicTokenProgram,
    );

    const associatedUser = getAssociatedTokenAddressSync(
      mint,
      user,
      false,
      TOKEN_2022_PROGRAM_ID,
    );
    const associatedUserSonic = getAssociatedTokenAddressSync(
      sonicMint,
      user,
      false,
      sonicTokenProgram,
    );
    if (!globalState?.operatingWallet) {
      throw new Error('Global state or operating wallet not found');
    }
    const operatingWalletSonic = getAssociatedTokenAddressSync(
      sonicMint,
      globalState.operatingWallet,
      true, // allowOwnerOffCurve for operating wallet
      sonicTokenProgram,
    );
    const creatorWalletSonic = getAssociatedTokenAddressSync(
      sonicMint,
      creatorWallet,
      false,
      sonicTokenProgram,
    );

    return await this.program.methods
      .sellWithSpl(amount, minSonicReceived)
      .accountsPartial({
        user,
        global: this.globalPDA,
        sonicMint,
        mint,
        operatingWallet: globalState?.operatingWallet,
        creatorWallet,
        userSonicAccount: associatedUserSonic,
        creatorSonicAccount: creatorWalletSonic,
        operatingSonicAccount: operatingWalletSonic,
        bondingCurveTokenAccount: associatedBondingCurve,
        bondingCurveSonicAccount: associatedBondingCurveSonic,
        bondingCurve: bondingCurveV2PDA,
        userTokenAccount: associatedUser,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        sonicTokenProgram: sonicTokenProgram,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
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

    const bondingCurve = await (
      this.program as unknown as anchor.Program<GoodrFun>
    ).account.bondingCurve.fetch(bondingCurveState);

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
        creatorWallet: bondingCurve?.creator,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .transaction();
  }

  /**
   * Withdraws tokens and SONIC from a completed bonding curve V2.
   * @param user - The user (authority) to withdraw the tokens.
   * @param mint - The token mint to withdraw.
   * @param sonicMint - The SONIC mint address.
   * @returns The transaction.
   */
  async withdrawSpl({
    user,
    mint,
    sonicMint,
  }: {
    user: PublicKey;
    mint: PublicKey;
    sonicMint: PublicKey;
  }): Promise<Transaction> {
    const bondingCurveV2State = this.bondingCurveV2PDA({ mint });

    // Determine the token program for SONIC mint
    const sonicTokenProgram = await this.getTokenProgramForMint(sonicMint);

    // Bonding curve token accounts
    const bondingCurveTokenAccount = getAssociatedTokenAddressSync(
      mint,
      bondingCurveV2State,
      true,
      TOKEN_2022_PROGRAM_ID,
    );
    const bondingCurveSonicAccount = getAssociatedTokenAddressSync(
      sonicMint,
      bondingCurveV2State,
      true,
      sonicTokenProgram,
    );

    // Authority (user) token accounts
    const authorityTokenAccount = getAssociatedTokenAddressSync(
      mint,
      user,
      false,
      TOKEN_2022_PROGRAM_ID,
    );
    const authoritySonicAccount = getAssociatedTokenAddressSync(
      sonicMint,
      user,
      false,
      sonicTokenProgram,
    );

    return await this.program.methods
      .withdrawSpl()
      .accountsPartial({
        global: this.globalPDA,
        mint: mint,
        sonicMint: sonicMint,
        bondingCurveTokenAccount: bondingCurveTokenAccount,
        bondingCurveSonicAccount: bondingCurveSonicAccount,
        authorityTokenAccount: authorityTokenAccount,
        authoritySonicAccount: authoritySonicAccount,
        bondingCurve: bondingCurveV2State,
        user: user,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .transaction();
  }

  /**
   * Calculates the amount of tokens to buy with improved slippage protection.
   * @param mint - The mint to buy the tokens for.
   * @param amountSol - The amount of SOL to buy the tokens with.
   * @param slippage - The slippage percentage (e.g., 5 = 5%, capped at 20% for safety).
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
    console.log('🔧 SDK: Fixed calculateBuyTokenAmount called', {
      mint: mint.toString(),
      amountSol: amountSol.toString(),
      slippage,
    });

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
        maxCostSol: amountSol
          .mul(new BN(100 + Math.min(slippage, 20)))
          .div(new BN(100)),
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
        maxCostSol: amountSol
          .mul(new BN(100 + Math.min(slippage, 20)))
          .div(new BN(100)),
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

  async getPriceAndMarketcapV2(mint: PublicKey) {
    const bondingCurveV2State = await this.getBondingCurveV2State({ mint });

    const virtualBaseReserves =
      bondingCurveV2State?.virtualBaseReserves.toNumber();
    const virtualTokenReserves =
      bondingCurveV2State?.virtualTokenReserves.toNumber();
    const tokenTotalSupply = bondingCurveV2State?.tokenTotalSupply.toNumber();
    if (!virtualBaseReserves || !virtualTokenReserves || !tokenTotalSupply) {
      throw new Error('Bonding curve V2 state not found');
    }
    const constant = virtualBaseReserves * virtualTokenReserves;
    const deltaBase =
      virtualBaseReserves - constant / (virtualTokenReserves + 1);
    return {
      price: deltaBase,
      marketcap: deltaBase * tokenTotalSupply,
    };
  }

  async getBondingCurveProgressV2(mint: PublicKey) {
    const bondingCurveV2State = await this.getBondingCurveV2State({ mint });
    if (!bondingCurveV2State) {
      throw new Error('Bonding curve V2 state not found');
    }
    const globalState = await this.getGlobalState();
    if (!globalState) {
      throw new Error('Global state not found');
    }

    const progress =
      bondingCurveV2State.realTokenReserves.toNumber() /
      globalState.sonicInitialRealTokenReserves.toNumber();

    const progressPercentage = (1 - progress) * 100;
    return progressPercentage;
  }

  /**
   * Calculates the amount of tokens to buy from the bonding curve using SPL token (SONIC).
   * @param mint - The mint to buy the tokens for.
   * @param sonicMint - The SONIC mint address.
   * @param amountSonic - The amount of SONIC to buy the tokens with.
   * @param slippage - The slippage percentage.
   * @returns The amount of tokens to buy and the maximum cost in SONIC.
   */
  async calculateBuyTokenAmountWithSpl({
    mint,
    sonicMint: _sonicMint,
    amountSonic,
    slippage,
  }: {
    mint: PublicKey;
    sonicMint: PublicKey;
    amountSonic: anchor.BN;
    slippage: number;
  }): Promise<{
    amountToken: anchor.BN;
    maxCostSonic: anchor.BN;
  }> {
    const bondingCurveV2State = await this.getBondingCurveV2State({ mint });
    if (bondingCurveV2State) {
      const virtualSonicReserves = bondingCurveV2State.virtualBaseReserves;
      const virtualTokenReserves = bondingCurveV2State.virtualTokenReserves;
      const constant = virtualSonicReserves.mul(virtualTokenReserves);
      let deltaToken = virtualTokenReserves.sub(
        constant.div(virtualSonicReserves.add(amountSonic)),
      );
      if (deltaToken.gt(bondingCurveV2State.realTokenReserves)) {
        deltaToken = bondingCurveV2State.realTokenReserves;
      }
      return {
        amountToken: deltaToken,
        maxCostSonic: amountSonic
          .mul(new anchor.BN(100 + Math.min(slippage, 20)))
          .div(new anchor.BN(100)),
      };
    } else {
      const globalState = await this.getGlobalState();
      const virtualSonicReserves = globalState?.sonicInitialVirtualBaseReserves;
      const virtualTokenReserves =
        globalState?.sonicInitialVirtualTokenReserves;
      if (!virtualSonicReserves || !virtualTokenReserves) {
        throw new Error('SONIC virtual reserves not found in global state');
      }
      const constant = virtualSonicReserves.mul(virtualTokenReserves);
      const deltaToken = virtualTokenReserves.sub(
        constant.div(virtualSonicReserves.add(amountSonic)),
      );
      return {
        amountToken: deltaToken,
        maxCostSonic: amountSonic
          .mul(new anchor.BN(100 + Math.min(slippage, 20)))
          .div(new anchor.BN(100)),
      };
    }
  }

  /**
   * Calculates the amount of tokens to sell to the bonding curve for SPL token (SONIC).
   * @param mint - The mint to sell the tokens for.
   * @param sonicMint - The SONIC mint address.
   * @param amountToken - The amount of tokens to sell.
   * @param slippage - The slippage percentage.
   * @returns The amount of tokens to sell and the minimum amount of SONIC to receive.
   */
  async calculateSellTokenAmountWithSpl({
    mint,
    sonicMint: _sonicMint,
    amountToken,
    slippage,
  }: {
    mint: PublicKey;
    sonicMint: PublicKey;
    amountToken: anchor.BN;
    slippage: number;
  }): Promise<{
    amountToken: anchor.BN;
    minSonicReceived: anchor.BN;
  }> {
    const bondingCurveV2State = await this.getBondingCurveV2State({ mint });
    if (bondingCurveV2State) {
      const virtualSonicReserves = bondingCurveV2State.virtualBaseReserves;
      const virtualTokenReserves = bondingCurveV2State.virtualTokenReserves;
      const realSonicReserves = bondingCurveV2State.realBaseReserves;

      // Get global state for fees
      const globalState = await this.getGlobalState();
      if (!globalState) {
        throw new Error('Global state not found');
      }

      // Use constant product formula (x*y=k) - same as buy operations and updated contract
      const constant = virtualSonicReserves.mul(virtualTokenReserves);
      const newVirtualTokenReserves = virtualTokenReserves.add(amountToken);
      const newVirtualSonicReserves = constant.div(newVirtualTokenReserves);
      const sonicReceived = virtualSonicReserves.sub(newVirtualSonicReserves);

      // Cap by real reserves (same as contract)
      const cappedSonicReceived = sonicReceived.gt(realSonicReserves)
        ? realSonicReserves
        : sonicReceived;

      // Subtract fees (operating + creator)
      const operatingFee = cappedSonicReceived
        .mul(globalState.operatingFeeBasisPoints)
        .div(new anchor.BN(10000));
      const creatorFee = cappedSonicReceived
        .mul(globalState.creatorFeeBasisPoints)
        .div(new anchor.BN(10000));
      const sonicAfterFees = cappedSonicReceived
        .sub(operatingFee)
        .sub(creatorFee);

      // Apply slippage to the after-fee amount
      return {
        amountToken: amountToken,
        minSonicReceived: sonicAfterFees
          .mul(new anchor.BN(100 - slippage))
          .div(new anchor.BN(100)),
      };
    } else {
      const globalState = await this.getGlobalState();
      const virtualSonicReserves = globalState?.sonicInitialVirtualBaseReserves;
      const virtualTokenReserves =
        globalState?.sonicInitialVirtualTokenReserves;
      if (!virtualSonicReserves || !virtualTokenReserves) {
        throw new Error('SONIC virtual reserves not found in global state');
      }
      const constant = virtualSonicReserves.mul(virtualTokenReserves);
      const deltaSonic = virtualSonicReserves.sub(
        constant.div(virtualTokenReserves.add(amountToken)),
      );
      return {
        amountToken: amountToken,
        minSonicReceived: deltaSonic
          .mul(new anchor.BN(100 - slippage))
          .div(new anchor.BN(100)),
      };
    }
  }

  /**
   * Helper method to calculate tokens for given SONIC amount
   * @private
   */
  private calculateTokensForSonic(
    bondingCurve: any,
    sonicAmount: anchor.BN,
  ): { tokens: anchor.BN; actualCost: anchor.BN } {
    const virtualSonicReserves = bondingCurve.virtualBaseReserves;
    const virtualTokenReserves = bondingCurve.virtualTokenReserves;
    const constant = virtualSonicReserves.mul(virtualTokenReserves);

    let deltaToken = virtualTokenReserves.sub(
      constant.div(virtualSonicReserves.add(sonicAmount)),
    );

    // Cap at available tokens
    if (deltaToken.gt(bondingCurve.realTokenReserves)) {
      deltaToken = bondingCurve.realTokenReserves;
    }

    return {
      tokens: deltaToken,
      actualCost: sonicAmount,
    };
  }

  /**
   * Helper method to calculate SONIC needed for specific token amount
   * @private
   */
  private calculateSonicForTokens(
    bondingCurve: any,
    tokenAmount: anchor.BN,
  ): anchor.BN {
    const virtualSonicReserves = bondingCurve.virtualBaseReserves;
    const virtualTokenReserves = bondingCurve.virtualTokenReserves;
    const constant = virtualSonicReserves.mul(virtualTokenReserves);

    const newTokenReserves = virtualTokenReserves.sub(tokenAmount);
    const newSonicReserves = constant.div(newTokenReserves);

    return newSonicReserves.sub(virtualSonicReserves);
  }

  /**
   * Helper method to calculate fees
   * @private
   */
  private calculateFees(
    baseAmount: anchor.BN,
    operatingFeeBasisPoints: number,
    creatorFeeBasisPoints: number,
  ): { operatingFee: anchor.BN; creatorFee: anchor.BN } {
    const operatingFee = baseAmount
      .mul(new anchor.BN(operatingFeeBasisPoints))
      .div(new anchor.BN(10000));

    const creatorFee = baseAmount
      .mul(new anchor.BN(creatorFeeBasisPoints))
      .div(new anchor.BN(10000));

    return { operatingFee, creatorFee };
  }
}
