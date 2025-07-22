import { Keypair, PublicKey } from '@solana/web3.js';
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
import { Connection } from '@solana/web3.js';

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '.env') });

// SONIC Token Configuration (updated with dummy token for testing)
const SONIC_TOKEN = {
  MINT: new PublicKey('Dp3dL14gJMQDCxE2XZKd4Jz42TShQLY7gGzU2YgmVY2J'), // Dummy SONIC token mint for testing
  DECIMALS: 9,
};

const main = async () => {
  const rpcEndpoint = 'https://api.testnet.sonic.game';
  const sdk = new GoodrFunSDK(ChainType.SONIC, rpcEndpoint);
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

  const metadataUri =
    'https://goodr-fun.s3.us-east-1.amazonaws.com/metadata/1745847137445-SONIC-DONUTS';

  console.log('=== SONIC Trading Test ===');
  console.log(`Token to be created: ${mint.publicKey.toBase58()}`);
  console.log(
    `SONIC token used: ${SONIC_TOKEN.MINT.toBase58()} (Dummy SONIC for testing)`,
  );

  // Get initial SONIC balance
  const sonicTokenAccount = getAssociatedTokenAddressSync(
    SONIC_TOKEN.MINT,
    wallet.publicKey,
    true,
    TOKEN_2022_PROGRAM_ID,
  );

  const initialSonicBalance =
    await connection.getTokenAccountBalance(sonicTokenAccount);
  const initialSonicAmount = new BigNumber(
    initialSonicBalance.value.amount,
  ).dividedBy(10 ** SONIC_TOKEN.DECIMALS);
  console.log(
    `\nInitial SONIC balance: ${initialSonicAmount.toFixed(4)} SONIC`,
  );

  // Step 1: CreateAndBuy with SONIC tokens
  console.log('\n--- Step 1: CreateAndBuy ---');
  const createAndBuyAmount = new BigNumber(50).multipliedBy(
    10 ** SONIC_TOKEN.DECIMALS,
  ); // 50 SONIC
  const createResult = await sdk.createAndBuyWithSonic(wallet, {
    mint: mint,
    buySonicAmount: createAndBuyAmount,
    baseCurrencyMint: SONIC_TOKEN.MINT,
    slippageBasisPoints: 500, // 5%
    meme: donation.name,
    metadata: {
      name: 'SONIC_DONUTS',
      symbol: 'SDONUTS',
      metadataUri: metadataUri,
    },
  });

  console.log(`✅ CreateAndBuy transaction: ${createResult.signature}`);
  console.log(`💰 SONIC spent in CreateAndBuy: 50 SONIC`);

  // Check token state after creation
  const tokenStateAfterCreate = await sdk.getCurrentState(mint.publicKey);
  console.log(
    `📈 Price: ${tokenStateAfterCreate.priceData.price.toFixed(8)} SONIC per token`,
  );
  console.log(
    `💎 Market Cap: ${tokenStateAfterCreate.priceData.marketCap.dividedBy(10 ** 9).toFixed(4)} SONIC`,
  );
  console.log(
    `🚀 Bonding curve progress: ${tokenStateAfterCreate.bondingCurveProgress.toFixed(4)}%`,
  );
  console.log(
    `🪙 Total supply: ${tokenStateAfterCreate.totalSupply.toFixed(0)} tokens`,
  );
  console.log(`💱 Currency type: ${tokenStateAfterCreate.currencyType}`);

  // Step 2: Additional Buy with SONIC tokens
  console.log('\n--- Step 2: Additional Buy ---');
  const additionalBuyAmount = new BigNumber(25).multipliedBy(
    10 ** SONIC_TOKEN.DECIMALS,
  ); // 25 SONIC
  const buyResult = await sdk.buyWithSonic(wallet, {
    mint: mint.publicKey,
    sonicAmount: additionalBuyAmount,
    baseCurrencyMint: SONIC_TOKEN.MINT,
    slippageBasisPoints: 500, // 5%
  });

  console.log(`✅ Buy transaction: ${buyResult.signature}`);
  console.log(`💰 SONIC spent in Buy: 25 SONIC`);

  // Check token state after additional buy
  const tokenStateAfterBuy = await sdk.getCurrentState(mint.publicKey);
  console.log(
    `📈 New price: ${tokenStateAfterBuy.priceData.price.toFixed(8)} SONIC per token`,
  );
  console.log(
    `💎 New market cap: ${tokenStateAfterBuy.priceData.marketCap.dividedBy(10 ** 9).toFixed(4)} SONIC`,
  );
  console.log(
    `🚀 New bonding curve progress: ${tokenStateAfterBuy.bondingCurveProgress.toFixed(4)}%`,
  );
  console.log(`💱 Currency type: ${tokenStateAfterBuy.currencyType}`);

  // Step 3: Confirm total SONIC spent
  console.log('\n--- Step 3: Confirm SONIC Spent ---');
  const totalSonicSpent = createAndBuyAmount
    .plus(additionalBuyAmount)
    .dividedBy(10 ** SONIC_TOKEN.DECIMALS);
  console.log(
    `🧮 Total SONIC spent to buy tokens: ${totalSonicSpent.toFixed(4)} SONIC`,
  );

  const currentSonicBalance =
    await connection.getTokenAccountBalance(sonicTokenAccount);
  const currentSonicAmount = new BigNumber(
    currentSonicBalance.value.amount,
  ).dividedBy(10 ** SONIC_TOKEN.DECIMALS);
  const actualSonicSpent = initialSonicAmount.minus(currentSonicAmount);
  console.log(
    `📊 Actual SONIC spent (including fees): ${actualSonicSpent.toFixed(4)} SONIC`,
  );

  // Get token holdings
  const tokenAccount = getAssociatedTokenAddressSync(
    mint.publicKey,
    wallet.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
  );

  const tokenBalance = await connection.getTokenAccountBalance(tokenAccount);
  const totalTokensHeld = new BigNumber(tokenBalance.value.amount);
  const tokensHeldDisplay = totalTokensHeld.dividedBy(10 ** TOKEN_DECIMALS);
  console.log(`🪙 Total tokens held: ${tokensHeldDisplay.toFixed(0)} tokens`);

  // Step 4: Sell ALL holding tokens
  console.log('\n--- Step 4: Sell All Holdings ---');
  console.log(`💸 Selling all ${tokensHeldDisplay.toFixed(0)} tokens...`);

  const sellResult = await sdk.sellWithSonic(wallet, {
    mint: mint.publicKey,
    tokenAmount: totalTokensHeld, // Sell ALL tokens
    baseCurrencyMint: SONIC_TOKEN.MINT,
    slippageBasisPoints: 1000, // 10% slippage for selling all
  });

  console.log(`✅ Sell transaction: ${sellResult.signature}`);

  // Check final token state after selling all tokens
  const tokenStateAfterSell = await sdk.getCurrentState(mint.publicKey);
  console.log(
    `📈 Final price: ${tokenStateAfterSell.priceData.price.toFixed(8)} SONIC per token`,
  );
  console.log(
    `💎 Final market cap: ${tokenStateAfterSell.priceData.marketCap.dividedBy(10 ** 9).toFixed(4)} SONIC`,
  );
  console.log(
    `🚀 Final bonding curve progress: ${tokenStateAfterSell.bondingCurveProgress.toFixed(4)}%`,
  );
  console.log(`💱 Currency type: ${tokenStateAfterSell.currencyType}`);

  // Step 5: Confirm received SONIC is smaller than spent amount
  console.log('\n--- Step 5: Confirm Loss ---');
  const finalSonicBalance =
    await connection.getTokenAccountBalance(sonicTokenAccount);
  const finalSonicAmount = new BigNumber(
    finalSonicBalance.value.amount,
  ).dividedBy(10 ** SONIC_TOKEN.DECIMALS);
  const sonicReceived = finalSonicAmount.minus(currentSonicAmount);
  console.log(`💰 SONIC received from sell: ${sonicReceived.toFixed(4)} SONIC`);

  const netLoss = actualSonicSpent.minus(sonicReceived);
  const lossPercentage = netLoss.dividedBy(actualSonicSpent).multipliedBy(100);

  console.log('\n=== SUMMARY ===');
  console.log(`💸 Total SONIC spent: ${actualSonicSpent.toFixed(4)} SONIC`);
  console.log(`💰 SONIC received back: ${sonicReceived.toFixed(4)} SONIC`);
  console.log(
    `📉 Net loss: ${netLoss.toFixed(4)} SONIC (${lossPercentage.toFixed(2)}%)`,
  );
  console.log(
    `✅ Confirmed: Received SONIC (${sonicReceived.toFixed(4)}) < Spent SONIC (${actualSonicSpent.toFixed(4)})`,
  );

  if (sonicReceived.isLessThan(actualSonicSpent)) {
    console.log(
      '🎯 Test successful: As expected, selling resulted in a loss due to trading fees and slippage',
    );
  } else {
    console.log(
      '⚠️  Unexpected: Received more SONIC than spent (this would be unusual)',
    );
  }
};

main().catch(console.error);
