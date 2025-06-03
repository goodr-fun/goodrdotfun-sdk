import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import {
  ChainType,
  getMemeDonationDestinationFromName,
  GoodrFunSDK,
  MemeDonationDestinationName,
  TokenMetadata,
} from '../src';
import bs58 from 'bs58';
import { BigNumber } from 'bignumber.js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { TOKEN_DECIMALS } from '../src/base/constant';

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '.env') });

const main = async () => {
  const rpcEndpoint = 'https://api.devnet.solana.com';
  const sdk = new GoodrFunSDK(ChainType.SONIC, rpcEndpoint);

  const walletPublicKey = process.env.WALLET_PUBLIC_KEY; // Set your wallet public key
  const walletPrivateKey = process.env.WALLET_PRIVATE_KEY; // Set your wallet private key

  if (!walletPublicKey || !walletPrivateKey) {
    throw new Error('Wallet public key and private key are required');
  }

  const wallet = new Keypair({
    publicKey: new PublicKey(walletPublicKey).toBytes(),
    secretKey: bs58.decode(walletPrivateKey),
  });

  const mint = Keypair.generate();
  const donation = getMemeDonationDestinationFromName(
    MemeDonationDestinationName.FarmMeme,
  );
  const tokenMetadata = new TokenMetadata({
    name: 'DONUTS',
    ticker: 'DONUTS',
    description: 'DONUTS',
    donationAmount: donation.donationAmount.toString(),
    donationDestinationId: donation.id,
    imageUrl: 'https://picsum.photos/200/300',
    websiteUrl: 'https://donuts.com',
    twitterUrl: 'https://twitter.com/donuts',
    telegramUrl: 'https://t.me/donuts',
  }).toJSON();
  // Update this json to ipfs or any storage then get the url. In this test i will use a fixed url

  const metadataUri =
    'https://goodr-fun.s3.us-east-1.amazonaws.com/metadata/1745847137445-DONUTS';

  const result = await sdk.createAndBuy(wallet, {
    mint: mint,
    buySolAmount: new BigNumber(0.1).multipliedBy(LAMPORTS_PER_SOL),
    slippageBasisPoints: 500,
    meme: donation.name,
    metadata: {
      name: 'DONUTS',
      symbol: 'DONUTS',
      metadataUri: metadataUri,
    },
  });
  console.log(`
      Token create and buy ttransaction hash: ${result.signature},
      Token address: ${mint.publicKey.toBase58()},
    `);

  // Fetch token state
  const tokenState = await sdk.getCurrentState(mint.publicKey);
  console.log(`bonding curve progress: ${tokenState.bondingCurveProgress}%`);
  console.log(`price: ${tokenState.priceData.price} SOL`);
  console.log(`total supply: ${tokenState.totalSupply} Tokens`);
  console.log(`market cap: ${tokenState.priceData.marketCap} SOL`);

  // Buy 0.01 SOL
  const buyResult = await sdk.buy(wallet, {
    mint: mint.publicKey,
    solAmount: new BigNumber(0.01).multipliedBy(LAMPORTS_PER_SOL),
    slippageBasisPoints: 500,
  });

  console.log(
    `Token buy transaction hash: ${buyResult.signature}`,
    `Token address: ${mint.publicKey.toBase58()}`,
  );

  // Sell 500000 tokens
  const sellResult = await sdk.sell(wallet, {
    mint: mint.publicKey,
    tokenAmount: new BigNumber(500000).multipliedBy(10 ** TOKEN_DECIMALS),
    slippageBasisPoints: 500,
  });

  console.log(
    `Token sell transaction hash: ${sellResult.signature}`,
    `Token address: ${mint.publicKey.toBase58()}`,
  );
};

main();
