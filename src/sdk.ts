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
  CreateAndBuyWithSonicParams,
  BuyWithSonicParams,
  SellWithSonicParams,
  PriceData,
  TokenState,
  GlobalAccount,
  BondingCurveAccount,
  ChainType,
  getMemeDonationDestinationFromName,
} from './types';
import { BN } from 'bn.js';
import { DEFAULT_SLIPPAGE_BASIS_POINTS, TOKEN_DECIMALS } from './base/constant';
import { sendTx } from './base/helpers/helper';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { BigNumber } from 'bignumber.js';
import { Idl } from '@coral-xyz/anchor';
import { ProgramErrorCodeTs, ProgramError } from './base/types/common';

/**
 * SDK for interacting with the GoodrFun program on Solana and Sonic
 */
export class GoodrFunSDK {
  private chainType: ChainType;
  private program: GoodrFunProgram;

  /**
   * Creates a new instance of GoodrFunSDK
   * @param rpcEndpoint - The Solana RPC endpoint URL
   */
  constructor(chainType: ChainType, rpcEndpoint: string) {
    this.program = new GoodrFunProgram(rpcEndpoint);
    this.chainType = chainType;
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
          baseCurrencyMint: event.baseCurrencyMint,
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

    const memeDestination = getMemeDonationDestinationFromName(params.meme);

    const createTokenTx = await this.program.create({
      user: creator,
      mint: params.mint,
      name: params.metadata.name,
      symbol: params.metadata.symbol,
      uri: params.metadata.metadataUri,
      donationDestination: memeDestination.address,
      donationAmount: new BN(
        memeDestination.donationAmount * 10 ** this.program.decimals,
      ),
    });

    tx.add(createTokenTx);

    if (params.buySolAmount.gt(0)) {
      const { amountToken, maxCostSol } =
        await this.program.calculateBuyTokenAmount({
          mint: params.mint.publicKey,
          amountSol: new BN(params.buySolAmount.toNumber()),
          slippage: slippageBasisPoints / 100, // Convert basis points to percentage
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
    if (!result.success) {
      if (result.results) checkProgramErrorInLogs(result.results);
      if (hasErrorMessage(result.error)) {
        for (const [code, errorMsg] of Object.entries(ProgramErrorCodeTs)) {
          if (result.error.message.includes(errorMsg)) {
            throw new ProgramError(
              code as keyof typeof ProgramErrorCodeTs,
              errorMsg,
            );
          }
        }
      }
    } else {
      if (result.results) checkProgramErrorInLogs(result.results);
    }
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
    if (!result.success) {
      if (result.results) checkProgramErrorInLogs(result.results);
      if (hasErrorMessage(result.error)) {
        for (const [code, errorMsg] of Object.entries(ProgramErrorCodeTs)) {
          if (result.error.message.includes(errorMsg)) {
            throw new ProgramError(
              code as keyof typeof ProgramErrorCodeTs,
              errorMsg,
            );
          }
        }
      }
    } else {
      if (result.results) checkProgramErrorInLogs(result.results);
    }
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

  // SONIC-specific methods

  /**
   * Creates a new token with SONIC and buys tokens in a single transaction
   * @param creator - The keypair of the creator
   * @param params - Parameters for creating and buying tokens with SONIC
   * @returns Transaction result containing signature and slot
   */
  async createAndBuyWithSonic(
    creator: Keypair,
    params: CreateAndBuyWithSonicParams,
  ): Promise<TransactionResult> {
    const tx = await this.createAndBuyWithSonicTx(creator.publicKey, params);
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
   * Creates a transaction for creating a new token with SONIC and buying tokens
   * @param creator - The public key of the creator
   * @param params - Parameters for creating and buying tokens with SONIC
   * @returns Transaction object ready to be signed and sent
   */
  async createAndBuyWithSonicTx(
    creator: PublicKey,
    params: CreateAndBuyWithSonicParams,
  ): Promise<Transaction> {
    const slippageBasisPoints =
      params.slippageBasisPoints <= 0
        ? DEFAULT_SLIPPAGE_BASIS_POINTS
        : params.slippageBasisPoints;
    const tx = new Transaction();

    const memeDestination = getMemeDonationDestinationFromName(params.meme);

    const createTokenTx = await this.program.createWithSpl({
      user: creator,
      mint: params.mint,
      sonicMint: params.baseCurrencyMint,
      name: params.metadata.name,
      symbol: params.metadata.symbol,
      uri: params.metadata.metadataUri,
      donationDestination: memeDestination.address,
      donationAmount: new BN(
        memeDestination.donationAmount * 10 ** this.program.decimals,
      ),
    });

    tx.add(createTokenTx);

    if (params.buySonicAmount.gt(0)) {
      const { amountToken, maxCostSonic } =
        await this.program.calculateBuyTokenAmountWithSpl({
          mint: params.mint.publicKey,
          sonicMint: params.baseCurrencyMint,
          amountSonic: new BN(params.buySonicAmount.toNumber()),
          slippage: slippageBasisPoints / 100, // Convert basis points to percentage
        });

      const initialBuyTx = await this.program.buyWithSpl({
        user: creator,
        mint: params.mint.publicKey,
        sonicMint: params.baseCurrencyMint,
        amount: amountToken,
        maxCostSonic: maxCostSonic,
        creatorWallet: creator,
      });

      tx.add(initialBuyTx);
    }

    return tx;
  }

  /**
   * Buys tokens for a given amount of SONIC
   * @param creator - The keypair of the buyer
   * @param params - Parameters for buying tokens with SONIC
   * @returns Transaction result containing signature and slot
   */
  async buyWithSonic(
    creator: Keypair,
    params: BuyWithSonicParams,
  ): Promise<TransactionResult> {
    const tx = await this.buyWithSonicTx(creator.publicKey, params);
    const hash = await this.program.connection.getLatestBlockhash();
    tx.feePayer = creator.publicKey;
    tx.recentBlockhash = hash.blockhash;

    const result = await sendTx(
      this.program.connection,
      tx,
      creator.publicKey,
      [creator],
    );
    if (!result.success) {
      if (result.results) checkProgramErrorInLogs(result.results);
      if (hasErrorMessage(result.error)) {
        for (const [code, errorMsg] of Object.entries(ProgramErrorCodeTs)) {
          if (result.error.message.includes(errorMsg)) {
            throw new ProgramError(
              code as keyof typeof ProgramErrorCodeTs,
              errorMsg,
            );
          }
        }
      }
    } else {
      if (result.results) checkProgramErrorInLogs(result.results);
    }
    return result;
  }

  /**
   * Creates a transaction for buying tokens with SONIC
   * @param creator - The public key of the buyer
   * @param params - Parameters for buying tokens with SONIC
   * @returns Transaction object ready to be signed and sent
   */
  async buyWithSonicTx(
    creator: PublicKey,
    params: BuyWithSonicParams,
  ): Promise<Transaction> {
    const slippageBasisPoints =
      params.slippageBasisPoints <= 0
        ? DEFAULT_SLIPPAGE_BASIS_POINTS
        : params.slippageBasisPoints;

    const { amountToken, maxCostSonic } =
      await this.program.calculateBuyTokenAmountWithSpl({
        mint: params.mint,
        sonicMint: params.baseCurrencyMint,
        amountSonic: new BN(params.sonicAmount.toString()),
        slippage: slippageBasisPoints / 100, // Convert basis points to percentage
      });

    const buyTokenTx = await this.program.buyWithSpl({
      user: creator,
      mint: params.mint,
      sonicMint: params.baseCurrencyMint,
      amount: amountToken,
      maxCostSonic: maxCostSonic,
      creatorWallet: creator,
    });

    return buyTokenTx;
  }

  /**
   * Sells tokens for SONIC
   * @param creator - The keypair of the seller
   * @param params - Parameters for selling tokens for SONIC
   * @returns Transaction result containing signature and slot
   */
  async sellWithSonic(
    creator: Keypair,
    params: SellWithSonicParams,
  ): Promise<TransactionResult> {
    const tx = await this.sellWithSonicTx(creator.publicKey, params);

    const hash = await this.program.connection.getLatestBlockhash();
    tx.feePayer = creator.publicKey;
    tx.recentBlockhash = hash.blockhash;

    const result = await sendTx(
      this.program.connection,
      tx,
      creator.publicKey,
      [creator],
    );
    if (!result.success) {
      if (result.results) checkProgramErrorInLogs(result.results);
      if (hasErrorMessage(result.error)) {
        for (const [code, errorMsg] of Object.entries(ProgramErrorCodeTs)) {
          if (result.error.message.includes(errorMsg)) {
            throw new ProgramError(
              code as keyof typeof ProgramErrorCodeTs,
              errorMsg,
            );
          }
        }
      }
    } else {
      if (result.results) checkProgramErrorInLogs(result.results);
    }
    return result;
  }

  /**
   * Creates a transaction for selling tokens for SONIC
   * @param creator - The public key of the seller
   * @param params - Parameters for selling tokens for SONIC
   * @returns Transaction object ready to be signed and sent
   */
  async sellWithSonicTx(
    creator: PublicKey,
    params: SellWithSonicParams,
  ): Promise<Transaction> {
    const slippageBasisPoints =
      params.slippageBasisPoints <= 0
        ? DEFAULT_SLIPPAGE_BASIS_POINTS
        : params.slippageBasisPoints;

    const { amountToken, minSonicReceived } =
      await this.program.calculateSellTokenAmountWithSpl({
        mint: params.mint,
        sonicMint: params.baseCurrencyMint,
        amountToken: new BN(params.tokenAmount.toString()),
        slippage: slippageBasisPoints / 100, // Convert basis points to percentage
      });

    const sellTokenTx = await this.program.sellWithSpl({
      user: creator,
      mint: params.mint,
      sonicMint: params.baseCurrencyMint,
      amount: amountToken,
      minSonicReceived: minSonicReceived,
      creatorWallet: creator,
    });

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
   * Withdraws tokens and SONIC from a completed bonding curve V2
   * @param authority - The authority (signer) to withdraw the tokens
   * @param mint - The token mint address to withdraw
   * @param sonicMint - The SONIC token mint address
   * @returns Transaction hash of the withdrawal
   */
  async withdrawSpl({
    authority,
    mint,
    sonicMint,
  }: {
    authority: Signer;
    mint: PublicKey;
    sonicMint: PublicKey;
  }) {
    const withdrawTx = await this.program.withdrawSpl({
      user: authority.publicKey,
      mint,
      sonicMint,
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
   * Calculates the amount of tokens that can be bought for a given amount of SONIC
   * @param params - Parameters containing mint, base currency mint and SONIC amount
   * @returns Object containing the calculated token amount
   */
  async calculateBuyTokenAmountWithSonic({
    mint,
    baseCurrencyMint,
    amountSonic,
  }: {
    mint: PublicKey;
    baseCurrencyMint: PublicKey;
    amountSonic: BigNumber;
  }): Promise<{
    amountToken: BigNumber;
  }> {
    const result = await this.program.calculateBuyTokenAmountWithSpl({
      mint,
      sonicMint: baseCurrencyMint,
      amountSonic: new BN(amountSonic.toNumber()),
      slippage: 0,
    });

    return {
      amountToken: new BigNumber(result.amountToken.toString()).dividedBy(
        new BigNumber(10).pow(TOKEN_DECIMALS),
      ),
    };
  }

  /**
   * Calculates the amount of SONIC that can be received for a given amount of tokens
   * @param params - Parameters containing mint, base currency mint and token amount
   * @returns Object containing the calculated SONIC amount
   */
  async calculateSellTokenAmountWithSonic({
    mint,
    baseCurrencyMint,
    amountToken,
  }: {
    mint: PublicKey;
    baseCurrencyMint: PublicKey;
    amountToken: BigNumber;
  }): Promise<{ amountSonic: BigNumber }> {
    const result = await this.program.calculateSellTokenAmountWithSpl({
      mint,
      sonicMint: baseCurrencyMint,
      amountToken: new BN(amountToken.toNumber()),
      slippage: 0,
    });

    const decimals = 9; // SONIC has 9 decimals
    return {
      amountSonic: new BigNumber(result.minSonicReceived.toString()).dividedBy(
        new BigNumber(10).pow(decimals),
      ),
    };
  }

  /**
   * Gets the current price and market cap data for a token
   * @param mint - The token mint address
   * @returns Price data including current price and market cap
   */
  async getPriceAndMarketcapData(mint: PublicKey): Promise<PriceData> {
    // Try V2 (SONIC) bonding curve first, then V1 (SOL)
    const bondingCurveV2State = await this.program.getBondingCurveV2State({
      mint,
    });

    if (bondingCurveV2State) {
      // SONIC token - use V2 method
      return this.program.getPriceDataFromStateV2(bondingCurveV2State);
    } else {
      // Try V1 (SOL) bonding curve
      const bondingCurveState = await this.program.getBondingCurveState({
        mint,
      });
      if (!bondingCurveState)
        throw new Error('Bonding curve state is not found');
      return this.program.getPriceDataFromState(bondingCurveState);
    }
  }

  /**
   * Gets the current state of a token including price data and bonding curve progress
   * @param mint - The token mint address
   * @returns Token state including price data, bonding curve progress, and total supply
   */
  async getCurrentState(mint: PublicKey): Promise<TokenState> {
    const globalState = await this.program.getGlobalState();
    if (!globalState) throw new Error('Global state is not found');

    // Try V2 (SONIC) bonding curve first, then V1 (SOL)
    const bondingCurveState = await this.program.getBondingCurveV2State({
      mint,
    });
    let priceData;
    let bondingCurveProgress;
    let totalSupplyBN;

    if (bondingCurveState) {
      // SONIC token - use V2 methods
      const priceAndMarketcap = await this.program.getPriceAndMarketcapV2(mint);
      bondingCurveProgress = await this.program.getBondingCurveProgressV2(mint);
      totalSupplyBN = new BigNumber(
        bondingCurveState.tokenTotalSupply.toString(),
      ).div(new BigNumber(10).pow(this.program.decimals));
      // For SONIC (V2), price includes 10^3 scaling factor from contract, marketcap needs conversion by SONIC decimals
      priceData = {
        price: new BigNumber(priceAndMarketcap.price).div(
          new BigNumber(10).pow(3),
        ),
        marketCap: new BigNumber(priceAndMarketcap.marketcap).div(
          new BigNumber(10).pow(9),
        ),
        totalSupply: totalSupplyBN,
      };
    } else {
      // Try V1 (SOL) bonding curve
      const bondingCurveV1State = await this.program.getBondingCurveState({
        mint,
      });
      if (!bondingCurveV1State)
        throw new Error('Bonding curve state is not found');

      // SOL token - use V1 methods
      const priceAndMarketcap = await this.program.getPriceAndMarketcap(mint);
      bondingCurveProgress = await this.program.getBondingCurveProgress(mint);
      totalSupplyBN = new BigNumber(
        bondingCurveV1State.tokenTotalSupply.toString(),
      ).div(new BigNumber(10).pow(this.program.decimals));
      // For SOL (V1), price includes 10^3 scaling factor from contract, marketcap needs conversion from lamports
      priceData = {
        price: new BigNumber(priceAndMarketcap.price).div(
          new BigNumber(10).pow(3),
        ),
        marketCap: new BigNumber(priceAndMarketcap.marketcap).div(
          new BigNumber(10).pow(9),
        ),
        totalSupply: totalSupplyBN,
      };
    }

    return {
      priceData,
      bondingCurveProgress,
      totalSupply: totalSupplyBN,
      currencyType: bondingCurveState ? 'SONIC' : 'SOL',
    };
  }
}

function checkProgramErrorInLogs(results?: unknown) {
  if (!results || typeof results !== 'object' || results === null) return;
  const resultsObj = results as { meta?: { logMessages?: string[] } };
  if (!resultsObj.meta || !resultsObj.meta.logMessages) return;
  const logs: string[] = resultsObj.meta.logMessages;
  for (const [code, errorMsg] of Object.entries(ProgramErrorCodeTs)) {
    if (logs.some(log => log.includes(errorMsg))) {
      throw new ProgramError(code as keyof typeof ProgramErrorCodeTs, errorMsg);
    }
  }
}

function hasErrorMessage(e: unknown): e is { message: string } {
  return (
    typeof e === 'object' &&
    e !== null &&
    'message' in e &&
    typeof (e as { message: unknown }).message === 'string'
  );
}
