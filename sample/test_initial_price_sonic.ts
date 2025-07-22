import { Keypair, PublicKey, Connection } from '@solana/web3.js';
import {
  ChainType,
  getMemeDonationDestinationFromName,
  GoodrFunSDK,
  MemeDonationDestinationName,
} from '../src';
import bs58 from 'bs58';
import { BigNumber } from 'bignumber.js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

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

  const walletPublicKey = process.env.WALLET_PUBLIC_KEY;
  const walletPrivateKey = process.env.WALLET_PRIVATE_KEY;

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
    'https://goodr-fun.s3.us-east-1.amazonaws.com/metadata/test-initial-price-SONIC';

  console.log('=== SONIC Initial Price Test (Zero Buy) ===');
  console.log(`Token to be created: ${mint.publicKey.toBase58()}`);
  console.log(`SONIC token used: ${SONIC_TOKEN.MINT.toBase58()}`);

  // Create token with ZERO initial buy
  const result = await sdk.createAndBuyWithSonic(wallet, {
    mint: mint,
    buySonicAmount: new BigNumber(0), // Zero initial buy
    baseCurrencyMint: SONIC_TOKEN.MINT,
    slippageBasisPoints: 500,
    meme: donation.name,
    metadata: {
      name: 'TEST_SONIC_INITIAL',
      symbol: 'TSONIC',
      metadataUri: metadataUri,
    },
  });

  console.log(`✅ Token created with zero buy: ${result.signature}`);

  // Check initial price immediately after creation
  const initialState = await sdk.getCurrentState(mint.publicKey);

  console.log('\n=== INITIAL PRICE RESULTS ===');
  console.log(
    `📈 Initial Price: ${initialState.priceData.price.toFixed(16)} SONIC per token`,
  );
  console.log(
    `💎 Initial Market Cap: ${initialState.priceData.marketCap.toFixed(2)} SONIC`,
  );
  console.log(
    `🚀 Bonding curve progress: ${initialState.bondingCurveProgress.toFixed(4)}%`,
  );
  console.log(`🪙 Total supply: ${initialState.totalSupply.toFixed(0)} tokens`);
  console.log(`💱 Currency type: ${initialState.currencyType}`);

  // Test the updated methods
  console.log('\n=== TESTING UPDATED METHODS ===');

  const priceDataFromMethod = await sdk.getPriceAndMarketcapData(
    mint.publicKey,
  );
  console.log('\n--- getPriceAndMarketcapData() Results ---');
  console.log(
    `📈 Price: ${priceDataFromMethod.price.toFixed(16)} SONIC per token`,
  );
  console.log(
    `💎 Market Cap: ${priceDataFromMethod.marketCap.toFixed(2)} SONIC`,
  );
  console.log(
    `🪙 Total Supply: ${priceDataFromMethod.totalSupply.toFixed(0)} tokens`,
  );

  // Compare with getCurrentState results
  console.log('\n--- Method Comparison ---');
  const priceMatch = initialState.priceData.price.isEqualTo(
    priceDataFromMethod.price,
  );
  const marketCapMatch = initialState.priceData.marketCap.isEqualTo(
    priceDataFromMethod.marketCap,
  );
  const totalSupplyMatch = initialState.priceData.totalSupply.isEqualTo(
    priceDataFromMethod.totalSupply,
  );

  console.log(`Price match: ${priceMatch ? '✅' : '❌'}`);
  console.log(`Market cap match: ${marketCapMatch ? '✅' : '❌'}`);
  console.log(`Total supply match: ${totalSupplyMatch ? '✅' : '❌'}`);

  if (priceMatch && marketCapMatch && totalSupplyMatch) {
    console.log(
      '✅ All values match between getCurrentState and getPriceAndMarketcapData',
    );
  } else {
    console.log('❌ Values differ between methods');
  }

  console.log('\n=== COMPARISON ===');
  console.log(`Expected SONIC price: ~0.00011669 SONIC per token`);
  console.log(
    `Actual SONIC price:   ${initialState.priceData.price.toFixed(16)} SONIC per token`,
  );

  const expectedPrice = new BigNumber('0.00011669');
  const actualPrice = initialState.priceData.price;
  const ratio = actualPrice.dividedBy(expectedPrice);
  console.log(`Ratio (actual/expected): ${ratio.toFixed(6)}x`);

  if (ratio.isGreaterThan(0.9) && ratio.isLessThan(1.1)) {
    console.log('✅ Price is within 10% of expected value');
  } else {
    console.log('❌ Price differs significantly from expected value');
  }
};

main().catch(console.error);
