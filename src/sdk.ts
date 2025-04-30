import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  Signer,
  Transaction,
} from '@solana/web3.js';
import { GoodrFunProgram } from './base/program';
import {
  CreateEvent,
  TradeEvent,
  CompleteEvent,
  SetParamsEvent,
  TransactionResult,
  CreateAndBuyParams,
  BuyParams,
  SellParams,
  PriceData,
  TokenState,
  GlobalAccount,
  BondingCurveAccount,
} from './types';
import { getDonationDestinationFromName } from './base/donation-destination';
import { BN } from 'bn.js';
import { DEFAULT_SLIPPAGE_BASIS_POINTS, TOKEN_DECIMALS } from './base/constant';
import { sendTx } from './base/helpers/helper';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { BigNumber } from 'bignumber.js';
import { Idl } from '@coral-xyz/anchor';

/**
 * SDK for interacting with the GoodrFun program on Solana and Sonic
 */
export class GoodrFunSDK {
  private program: GoodrFunProgram;

  /**
   * Creates a new instance of GoodrFunSDK
   * @param rpcEndpoint - The Solana RPC endpoint URL
   */
  constructor(rpcEndpoint: string) {
    this.program = new GoodrFunProgram(rpcEndpoint);
  }

  /**
   * Gets the program ID
   * @returns The program ID
   */
  get programId(): PublicKey {
    return this.program.program.programId;
  }

  /**
   * Gets the IDL
   * @returns The IDL of the program
   */
  get idl(): Idl {
    return this.program.program.idl;
  }

  /**
   * Gets the global account
   * @returns The global account
   */
  async getGlobalAccount(): Promise<GlobalAccount | null> {
    return await this.program.getGlobalAccount();
  }

  /**
   * Gets the bonding curve account
   * @returns The bonding curve account
   */
  async getBondingCurveAccount(
    mint: PublicKey,
  ): Promise<BondingCurveAccount | null> {
    return await this.program.getBondingCurveAccount({ mint });
  }

  /**
   * Adds a callback for the Create event
   * @param callback - Function to be called when a Create event occurs
   * @returns Event listener ID that can be used to remove the listener
   */
  addOnCreateEvent(
    callback: (event: CreateEvent, slot: number, signature: string) => void,
  ): number {
    return this.program.onCreateEvent(callback);
  }

  /**
   * Adds a callback for the Trade event
   * @param callback - Function to be called when a Trade event occurs
   * @returns Event listener ID that can be used to remove the listener
   */
  addOnTradeEvent(
    callback: (event: TradeEvent, slot: number, signature: string) => void,
  ): number {
    return this.program.onTradeEvent((event, slot, signature) => {
      callback(
        {
          mint: event.mint,
          solAmount: new BigNumber(event.solAmount.toString()),
          tokenAmount: new BigNumber(event.tokenAmount.toString()),
          isBuy: event.isBuy,
          user: event.user,
          timestamp: new BigNumber(event.timestamp.toString()),
          virtualSolReserves: new BigNumber(
            event.virtualSolReserves.toString(),
          ),
          virtualTokenReserves: new BigNumber(
            event.virtualTokenReserves.toString(),
          ),
          realTokenReserves: new BigNumber(event.realTokenReserves.toString()),
          realSolReserves: new BigNumber(event.realSolReserves.toString()),
        },
        slot,
        signature,
      );
    });
  }

  /**
   * Adds a callback for the Complete event
   * @param callback - Function to be called when a Complete event occurs
   * @returns Event listener ID that can be used to remove the listener
   */
  addOnCompleteEvent(
    callback: (event: CompleteEvent, slot: number, signature: string) => void,
  ): number {
    return this.program.onCompleteEvent((event, slot, signature) => {
      callback(
        {
          user: event.user,
          mint: event.mint,
          bondingCurve: event.bondingCurve,
          timestamp: new BigNumber(event.timestamp.toString()),
        },
        slot,
        signature,
      );
    });
  }

  /**
   * Adds a callback for the SetParams event
   * @param callback - Function to be called when a SetParams event occurs
   * @returns Event listener ID that can be used to remove the listener
   */
  addOnSetParamsEvent(
    callback: (event: SetParamsEvent, slot: number, signature: string) => void,
  ): number {
    return this.program.onSetParamsEvent((event, slot, signature) => {
      callback(
        {
          operatingWallet: event.operatingWallet,
          initialVirtualTokenReserves: new BigNumber(
            event.initialVirtualTokenReserves.toString(),
          ),
          initialVirtualSolReserves: new BigNumber(
            event.initialVirtualSolReserves.toString(),
          ),
          initialRealTokenReserves: new BigNumber(
            event.initialRealTokenReserves.toString(),
          ),
          tokenTotalSupply: new BigNumber(event.tokenTotalSupply.toString()),
          operatingFeeBasisPoints: new BigNumber(
            event.operatingFeeBasisPoints.toString(),
          ),
          creatorFeeBasisPoints: new BigNumber(
            event.creatorFeeBasisPoints.toString(),
          ),
        },
        slot,
        signature,
      );
    });
  }

  /**
   * Removes one or more event listeners
   * @param eventIds - List of event listener IDs to remove
   */
  removeEventListener(...eventIds: number[]) {
    this.program.removeListeners(eventIds);
  }

  /**
   * Creates a new token and buys tokens in a single transaction
   * @param creator - The keypair of the creator
   * @param params - Parameters for creating and buying tokens
   * @returns Transaction result containing signature and slot
   */
  async createAndBuy(
    creator: Keypair,
    params: CreateAndBuyParams,
  ): Promise<TransactionResult> {
    const tx = await this.createAndBuyTx(creator.publicKey, params);
    const hash = await this.program.connection.getLatestBlockhash();
    tx.feePayer = creator.publicKey;
    tx.recentBlockhash = hash.blockhash;

    const result = await sendTx(
      this.program.connection,
      tx,
      creator.publicKey,
      [creator, params.mint],
    );
    return result;
  }

  /**
   * Creates a transaction for creating a new token and buying tokens
   * @param creator - The public key of the creator
   * @param params - Parameters for creating and buying tokens
   * @returns Transaction object ready to be signed and sent
   */
  async createAndBuyTx(
    creator: PublicKey,
    params: CreateAndBuyParams,
  ): Promise<Transaction> {
    const slippageBasisPoints =
      params.slippageBasisPoints <= 0
        ? DEFAULT_SLIPPAGE_BASIS_POINTS
        : params.slippageBasisPoints;
    const tx = new Transaction();

    const donationDestination = getDonationDestinationFromName(
      params.donationDestination,
    );

    const createTokenTx = await this.program.create({
      user: creator,
      mint: params.mint,
      name: params.metadata.name,
      symbol: params.metadata.symbol,
      uri: params.metadata.metadataUri,
      donationDestination: donationDestination.address,
      donationAmount: new BN(
        params.donationAmount * 10 ** this.program.decimals,
      ),
    });

    tx.add(createTokenTx);

    if (params.buySolAmount.gt(0)) {
      const { amountToken, maxCostSol } =
        await this.program.calculateBuyTokenAmount({
          mint: params.mint.publicKey,
          amountSol: new BN(params.buySolAmount.toNumber()),
          slippage: slippageBasisPoints,
        });

      const initialBuyTx = await this.program.buy({
        user: creator,
        mint: params.mint.publicKey,
        amount: amountToken,
        maxCostSol: maxCostSol,
        creatorWallet: creator,
      });

      tx.add(initialBuyTx);
    }

    return tx;
  }

  /**
   * Buys tokens for a given amount of SOL
   * @param creator - The keypair of the buyer
   * @param params - Parameters for buying tokens
   * @returns Transaction result containing signature and slot
   */
  async buy(creator: Keypair, params: BuyParams): Promise<TransactionResult> {
    const tx = await this.buyTx(creator.publicKey, params);
    const hash = await this.program.connection.getLatestBlockhash();
    tx.feePayer = creator.publicKey;
    tx.recentBlockhash = hash.blockhash;

    const result = await sendTx(
      this.program.connection,
      tx,
      creator.publicKey,
      [creator],
    );

    return result;
  }

  /**
   * Creates a transaction for buying tokens
   * @param creator - The public key of the buyer
   * @param params - Parameters for buying tokens
   * @returns Transaction object ready to be signed and sent
   */
  async buyTx(creator: PublicKey, params: BuyParams): Promise<Transaction> {
    const slippageBasisPoints =
      params.slippageBasisPoints <= 0
        ? DEFAULT_SLIPPAGE_BASIS_POINTS
        : params.slippageBasisPoints;

    const buyTokenTx = await this.program.buyBySolAmount(
      creator,
      params.mint,
      params.solAmount,
      slippageBasisPoints,
    );

    return buyTokenTx;
  }

  /**
   * Sells tokens for SOL
   * @param creator - The keypair of the seller
   * @param params - Parameters for selling tokens
   * @returns Transaction result containing signature and slot
   */
  async sell(creator: Keypair, params: SellParams): Promise<TransactionResult> {
    const tx = await this.sellTx(creator.publicKey, params);

    const hash = await this.program.connection.getLatestBlockhash();
    tx.feePayer = creator.publicKey;
    tx.recentBlockhash = hash.blockhash;

    const result = await sendTx(
      this.program.connection,
      tx,
      creator.publicKey,
      [creator],
    );
    return result;
  }

  /**
   * Creates a transaction for selling tokens
   * @param creator - The public key of the seller
   * @param params - Parameters for selling tokens
   * @returns Transaction object ready to be signed and sent
   */
  async sellTx(creator: PublicKey, params: SellParams): Promise<Transaction> {
    const slippageBasisPoints =
      params.slippageBasisPoints <= 0
        ? DEFAULT_SLIPPAGE_BASIS_POINTS
        : params.slippageBasisPoints;

    const sellTokenTx = await this.program.sellByTokenAmount(
      creator,
      params.mint,
      params.tokenAmount,
      slippageBasisPoints,
    );

    return sellTokenTx;
  }

  async withdraw({ authority, mint }: { authority: Signer; mint: PublicKey }) {
    const withdrawTx = await this.program.withdraw({
      user: authority.publicKey,
      mint,
    });
    const txHash = await sendAndConfirmTransaction(
      this.program.connection,
      withdrawTx,
      [authority],
    );
    return txHash;
  }

  /**
   * Gets the token account balance for a given mint and authority
   * @param mint - The token mint address
   * @param authority - The authority's public key
   * @returns The token balance as a BigNumber
   */
  async getTokenAccountBalance(
    mint: PublicKey,
    authority: PublicKey,
  ): Promise<BigNumber> {
    const accountInfo = await this.program.connection.getAccountInfo(mint);
    if (!accountInfo) throw new Error('Account info is not found');
    const programId = accountInfo.owner;
    const tokenAccount = getAssociatedTokenAddressSync(
      mint,
      authority,
      true,
      programId,
    );

    const balance =
      await this.program.connection.getTokenAccountBalance(tokenAccount);
    return new BigNumber(balance.value.amount).div(
      new BigNumber(10).pow(balance.value.decimals),
    );
  }

  /**
   * Calculates the amount of tokens that can be bought for a given amount of SOL
   * @param params - Parameters containing mint and SOL amount
   * @returns Object containing the calculated token amount
   */
  async calculateBuyTokenAmount({
    mint,
    amountSol,
  }: {
    mint: PublicKey;
    amountSol: BigNumber;
  }): Promise<{
    amountToken: BigNumber;
  }> {
    const bondingCurveAccount = await this.program.getBondingCurveAccount({
      mint,
    });

    if (!bondingCurveAccount) {
      throw new Error('Bonding curve account not found');
    }

    const buyPrice = bondingCurveAccount.getBuyPrice(amountSol);

    return {
      amountToken: buyPrice.dividedBy(new BigNumber(10).pow(TOKEN_DECIMALS)),
    };
  }

  /**
   * Calculates the amount of SOL that can be received for a given amount of tokens
   * @param params - Parameters containing mint and token amount
   * @returns Object containing the calculated SOL amount
   */
  async calculateSellTokenAmount({
    mint,
    amountToken,
  }: {
    mint: PublicKey;
    amountToken: BigNumber;
  }): Promise<{ amountSol: BigNumber }> {
    const bondingCurveAccount = await this.program.getBondingCurveAccount({
      mint,
    });

    const globalAccount = await this.program.getGlobalAccount();
    if (!globalAccount) {
      throw new Error('Global account not found');
    }

    if (!bondingCurveAccount) {
      throw new Error('Bonding curve account not found');
    }

    const sellPrice = bondingCurveAccount.getSellPrice(
      amountToken,
      globalAccount.operatingFeeBasisPoints,
      globalAccount.creatorFeeBasisPoints,
    );

    return {
      amountSol: sellPrice.dividedBy(LAMPORTS_PER_SOL),
    };
  }
  /**
   * Gets the current price and market cap data for a token
   * @param mint - The token mint address
   * @returns Price data including current price and market cap
   */
  async getPriceAndMarketcapData(mint: PublicKey): Promise<PriceData> {
    const bondingCurveState = await this.program.getBondingCurveState({ mint });
    if (!bondingCurveState) throw new Error('Bonding curve state is not found');
    return this.program.getPriceDataFromState(bondingCurveState);
  }

  /**
   * Gets the current state of a token including price data and bonding curve progress
   * @param mint - The token mint address
   * @returns Token state including price data, bonding curve progress, and total supply
   */
  async getCurrentState(mint: PublicKey): Promise<TokenState> {
    const bondingCurveState = await this.program.getBondingCurveState({ mint });
    if (!bondingCurveState) throw new Error('Bonding curve state is not found');
    const globalState = await this.program.getGlobalState();
    if (!globalState) throw new Error('Global state is not found');

    // Calculate price data
    const priceData =
      await this.program.getPriceDataFromState(bondingCurveState);
    const bondingCurveProgress =
      await this.program.getBondingCurveProgressFromState(
        bondingCurveState,
        globalState,
      );

    const totalSupplyBN = new BigNumber(
      bondingCurveState.tokenTotalSupply.toString(),
    ).div(new BigNumber(10).pow(this.program.decimals));

    return {
      priceData,
      bondingCurveProgress,
      totalSupply: totalSupplyBN,
    };
  }
}
