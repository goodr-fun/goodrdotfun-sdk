/**
 * Buy & Sell an existing Goodr / Sonic token
 * -----------------------------------------
 * Prepare a .env file containing only:
 * WALLET_PUBLIC_KEY=<your public key>
 * WALLET_PRIVATE_KEY=<your private key (bs58)>
 */

import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { GoodrFunSDK } from 'goodrdotfun-sdk';
import bs58 from 'bs58';
import BigNumber from 'bignumber.js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '.env') });

/* ========= Specify the target token and amounts here ========= */
const TOKEN_MINT_ADDRESS = '9aadzjRyiz5qXoKmAinWwV1TbygasMNnpkRxTSP4thry'; // Mint address of the token you want to buy
const BUY_SOL_AMOUNT    = 0.05;                                              // Amount of SOL to spend when buying
const SELL_TOKEN_AMOUNT = 0;                                                 // Amount of tokens to sell
const TOKEN_DECIMALS    = 6;                                                 // Token decimals (usually 6)
/* ============================================================ */

async function main() {
  const rpcEndpoint = 'https://api.testnet.sonic.game'; // Change to mainnet if needed
  const sdk = new GoodrFunSDK(rpcEndpoint);

  const { WALLET_PUBLIC_KEY, WALLET_PRIVATE_KEY } = process.env;
  if (!WALLET_PUBLIC_KEY || !WALLET_PRIVATE_KEY) {
    throw new Error('.env must contain WALLET_PUBLIC_KEY and WALLET_PRIVATE_KEY');
  }

  // -------- Restore wallet --------
  const wallet = new Keypair({
    publicKey: new PublicKey(WALLET_PUBLIC_KEY).toBytes(),
    secretKey: bs58.decode(WALLET_PRIVATE_KEY),
  });

  const mint = new PublicKey(TOKEN_MINT_ADDRESS.trim());

  // -------- BUY --------
  const buyTx = await sdk.buy(wallet, {
    mint,
    solAmount: new BigNumber(BUY_SOL_AMOUNT).multipliedBy(LAMPORTS_PER_SOL),
    slippageBasisPoints: 500,
  });
  console.log(`✅ Buy Tx  : ${buyTx.signature}`);

  // -------- SELL --------
  if (SELL_TOKEN_AMOUNT > 0) {
    const sellTx = await sdk.sell(wallet, {
      mint,
      tokenAmount: new BigNumber(SELL_TOKEN_AMOUNT).multipliedBy(10 ** TOKEN_DECIMALS),
      slippageBasisPoints: 500,
    });
    console.log(`✅ Sell Tx : ${sellTx.signature}`);
  }

  // -------- Display final state (optional) --------
  const state = await sdk.getCurrentState(mint);
  console.log(`
  --- Token State ---
  Price (SOL) : ${state.priceData.price}
  Supply      : ${state.totalSupply} tokens
  Market Cap  : ${state.priceData.marketCap} SOL
  `);
}

main().catch(console.error);

