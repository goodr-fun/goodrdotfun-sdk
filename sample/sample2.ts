/**
 * Buy & Sell an existing Goodr / Sonic token
 * -----------------------------------------
 * .env に下記だけを用意してください
 * WALLET_PUBLIC_KEY=<あなたの公開鍵>
 * WALLET_PRIVATE_KEY=<あなたの秘密鍵 (bs58)>
 */

import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { GoodrFunSDK } from 'goodrdotfun-sdk';
import bs58 from 'bs58';
import BigNumber from 'bignumber.js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '.env') });

/* ========= ここで対象トークンと数量を指定 ========= */
const TOKEN_MINT_ADDRESS = '9aadzjRyiz5qXoKmAinWwV1TbygasMNnpkRxTSP4thry';   // 購入したいトークンの Mint
const BUY_SOL_AMOUNT    = 0.05;           // SOL 建ての買付額
const SELL_TOKEN_AMOUNT = 0;           // 売却したいトークン数量
const TOKEN_DECIMALS    = 6;              // トークンの小数点桁数（通常 6）
/* ================================================ */

async function main() {
  const rpcEndpoint = 'https://api.testnet.sonic.game';   // 必要に応じて Mainnet に変更
  const sdk = new GoodrFunSDK(rpcEndpoint);

  const { WALLET_PUBLIC_KEY, WALLET_PRIVATE_KEY } = process.env;
  if (!WALLET_PUBLIC_KEY || !WALLET_PRIVATE_KEY) {
    throw new Error('.env に WALLET_PUBLIC_KEY と WALLET_PRIVATE_KEY を設定してください');
  }

  // -------- ウォレット復元 --------
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

  // -------- 最終状態表示 (任意) --------
  const state = await sdk.getCurrentState(mint);
  console.log(`
  --- Token State ---
  Price (SOL) : ${state.priceData.price}
  Supply      : ${state.totalSupply} tokens
  Market Cap  : ${state.priceData.marketCap} SOL
  `);
}

main().catch(console.error);
