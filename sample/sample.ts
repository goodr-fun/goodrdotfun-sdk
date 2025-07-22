import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Connection,
} from '@solana/web3.js';
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
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '.env') });

const main = async () => {
  const rpcEndpoint = 'https://api.testnet.sonic.game';
  const sdk = new GoodrFunSDK(ChainType.SOLANA, rpcEndpoint);
  const connection = new Connection(rpcEndpoint);

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

  console.log('=== SOL Trading Test ===');
  console.log(`Token to be created: ${mint.publicKey.toBase58()}`);

  // Get initial SOL balance
  const initialSolBalance = await connection.getBalance(wallet.publicKey);
  const initialSolAmount = new BigNumber(initialSolBalance).dividedBy(
    LAMPORTS_PER_SOL,
  );
  console.log(`\nInitial SOL balance: ${initialSolAmount.toFixed(4)} SOL`);

  // Step 1: CreateAndBuy with SOL
  console.log('\n--- Step 1: CreateAndBuy ---');
  const createAndBuyAmount = new BigNumber(0.1).multipliedBy(LAMPORTS_PER_SOL); // 0.1 SOL
  const result = await sdk.createAndBuy(wallet, {
    mint: mint,
    buySolAmount: createAndBuyAmount,
    slippageBasisPoints: 500,
    meme: donation.name,
    metadata: {
      name: 'DONUTS',
      symbol: 'DONUTS',
      metadataUri: metadataUri,
    },
  });

  console.log(`✅ CreateAndBuy transaction: ${result.signature}`);
  console.log(`💰 SOL spent in CreateAndBuy: 0.1 SOL`);

  // Check token state after creation
  const tokenStateAfterCreate = await sdk.getCurrentState(mint.publicKey);
  console.log(
    `📈 Price: ${tokenStateAfterCreate.priceData.price.toFixed(12)} SOL per token`,
  );
  console.log(
    `💎 Market Cap: ${tokenStateAfterCreate.priceData.marketCap.toFixed(4)} SOL`,
  );
  console.log(
    `🚀 Bonding curve progress: ${tokenStateAfterCreate.bondingCurveProgress.toFixed(4)}%`,
  );
  console.log(
    `🪙 Total supply: ${tokenStateAfterCreate.totalSupply.toFixed(0)} tokens`,
  );
  console.log(`💱 Currency type: ${tokenStateAfterCreate.currencyType}`);

  // Test getPriceAndMarketcapData method consistency
  console.log('\n--- Testing getPriceAndMarketcapData Method ---');
  const priceDataFromMethod = await sdk.getPriceAndMarketcapData(
    mint.publicKey,
  );
  console.log(
    `📈 Method Price: ${priceDataFromMethod.price.toFixed(12)} SOL per token`,
  );
  console.log(
    `💎 Method Market Cap: ${priceDataFromMethod.marketCap.toFixed(4)} SOL`,
  );
  console.log(
    `🪙 Method Total Supply: ${priceDataFromMethod.totalSupply.toFixed(0)} tokens`,
  );

  // Compare values
  const priceMatch = tokenStateAfterCreate.priceData.price.isEqualTo(
    priceDataFromMethod.price,
  );
  const marketCapMatch = tokenStateAfterCreate.priceData.marketCap.isEqualTo(
    priceDataFromMethod.marketCap,
  );
  const totalSupplyMatch =
    tokenStateAfterCreate.priceData.totalSupply.isEqualTo(
      priceDataFromMethod.totalSupply,
    );

  console.log(`🔍 Price match: ${priceMatch ? '✅' : '❌'}`);
  console.log(`🔍 Market cap match: ${marketCapMatch ? '✅' : '❌'}`);
  console.log(`🔍 Total supply match: ${totalSupplyMatch ? '✅' : '❌'}`);

  if (priceMatch && marketCapMatch && totalSupplyMatch) {
    console.log(
      '✅ All values match between getCurrentState and getPriceAndMarketcapData',
    );
  } else {
    console.log('❌ Values differ between methods - needs investigation');
  }

  // Step 2: Additional Buy with SOL
  console.log('\n--- Step 2: Additional Buy ---');
  const additionalBuyAmount = new BigNumber(0.01).multipliedBy(
    LAMPORTS_PER_SOL,
  ); // 0.01 SOL
  const buyResult = await sdk.buy(wallet, {
    mint: mint.publicKey,
    solAmount: additionalBuyAmount,
    slippageBasisPoints: 500,
  });

  console.log(`✅ Buy transaction: ${buyResult.signature}`);
  console.log(`💰 SOL spent in Buy: 0.01 SOL`);

  // Check token state after additional buy
  const tokenStateAfterBuy = await sdk.getCurrentState(mint.publicKey);
  console.log(
    `📈 New price: ${tokenStateAfterBuy.priceData.price.toFixed(12)} SOL per token`,
  );
  console.log(
    `💎 New market cap: ${tokenStateAfterBuy.priceData.marketCap.toFixed(4)} SOL`,
  );
  console.log(
    `🚀 New bonding curve progress: ${tokenStateAfterBuy.bondingCurveProgress.toFixed(4)}%`,
  );
  console.log(`💱 Currency type: ${tokenStateAfterBuy.currencyType}`);

  // Step 3: Confirm total SOL spent
  console.log('\n--- Step 3: Confirm SOL Spent ---');
  const totalSolSpent = createAndBuyAmount
    .plus(additionalBuyAmount)
    .dividedBy(LAMPORTS_PER_SOL);
  console.log(
    `🧮 Total SOL spent to buy tokens: ${totalSolSpent.toFixed(4)} SOL`,
  );

  const currentSolBalance = await connection.getBalance(wallet.publicKey);
  const currentSolAmount = new BigNumber(currentSolBalance).dividedBy(
    LAMPORTS_PER_SOL,
  );
  const actualSolSpent = initialSolAmount.minus(currentSolAmount);
  console.log(
    `📊 Actual SOL spent (including fees): ${actualSolSpent.toFixed(4)} SOL`,
  );

  // Get token holdings
  const tokenAccount = getAssociatedTokenAddressSync(
    mint.publicKey,
    wallet.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
  );

  let totalTokensHeld = new BigNumber(0);
  let tokensHeldDisplay = new BigNumber(0);

  try {
    const tokenBalance = await connection.getTokenAccountBalance(tokenAccount);
    totalTokensHeld = new BigNumber(tokenBalance.value.amount);
    tokensHeldDisplay = totalTokensHeld.dividedBy(10 ** TOKEN_DECIMALS);
    console.log(`🪙 Total tokens held: ${tokensHeldDisplay.toFixed(0)} tokens`);
  } catch (error) {
    console.log('🪙 No token account found yet, tokens might not be delivered');
    console.log(
      '   This can happen if the token account creation is still processing',
    );
  }

  // Step 4: Sell some tokens (only if we have tokens)
  console.log('\n--- Step 4: Sell Tokens ---');

  if (totalTokensHeld.gt(0)) {
    const sellAmount = new BigNumber(500000).multipliedBy(10 ** TOKEN_DECIMALS); // 500000 tokens
    const actualSellAmount = BigNumber.min(sellAmount, totalTokensHeld); // Don't sell more than we have
    const sellAmountDisplay = actualSellAmount.dividedBy(10 ** TOKEN_DECIMALS);

    console.log(`💸 Selling ${sellAmountDisplay.toFixed(0)} tokens...`);

    const sellResult = await sdk.sell(wallet, {
      mint: mint.publicKey,
      tokenAmount: actualSellAmount,
      slippageBasisPoints: 500,
    });

    console.log(`✅ Sell transaction: ${sellResult.signature}`);

    // Check final token state after selling tokens
    const tokenStateAfterSell = await sdk.getCurrentState(mint.publicKey);
    console.log(
      `📈 Final price: ${tokenStateAfterSell.priceData.price.toFixed(12)} SOL per token`,
    );
    console.log(
      `💎 Final market cap: ${tokenStateAfterSell.priceData.marketCap.toFixed(4)} SOL`,
    );
    console.log(
      `🚀 Final bonding curve progress: ${tokenStateAfterSell.bondingCurveProgress.toFixed(4)}%`,
    );
    console.log(`💱 Currency type: ${tokenStateAfterSell.currencyType}`);
  } else {
    console.log('💸 Skipping sell - no tokens available to sell');
  }

  // Step 5: Final balances
  console.log('\n--- Step 5: Final Balances ---');
  const finalSolBalance = await connection.getBalance(wallet.publicKey);
  const finalSolAmount = new BigNumber(finalSolBalance).dividedBy(
    LAMPORTS_PER_SOL,
  );
  const solReceived = finalSolAmount.minus(currentSolAmount);
  console.log(`💰 SOL received from sell: ${solReceived.toFixed(4)} SOL`);

  let finalTokensDisplay = new BigNumber(0);
  try {
    const finalTokenBalance =
      await connection.getTokenAccountBalance(tokenAccount);
    const finalTokensHeld = new BigNumber(finalTokenBalance.value.amount);
    finalTokensDisplay = finalTokensHeld.dividedBy(10 ** TOKEN_DECIMALS);
    console.log(`🪙 Remaining tokens: ${finalTokensDisplay.toFixed(0)} tokens`);
  } catch (error) {
    console.log('🪙 No token account found for final balance check');
  }

  const netSolChange = finalSolAmount.minus(initialSolAmount);

  console.log('\n=== SUMMARY ===');
  console.log(`💸 Total SOL spent: ${actualSolSpent.toFixed(4)} SOL`);
  console.log(`💰 SOL received back: ${solReceived.toFixed(4)} SOL`);
  console.log(`📊 Net SOL change: ${netSolChange.toFixed(4)} SOL`);
  console.log(
    `🪙 Final token holdings: ${finalTokensDisplay.toFixed(0)} tokens`,
  );

  if (netSolChange.isNegative()) {
    console.log('📉 Net result: Loss due to trading fees');
  } else {
    console.log('📈 Net result: Gain from trading');
  }
};

main();
