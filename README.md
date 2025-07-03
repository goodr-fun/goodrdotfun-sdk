# Goodr SDK

JavaScript/TypeScript SDK for interacting with goodr.fun and Sonic on Solana.

## Installation

```bash
npm install goodrdotfun-sdk
```

## Usage

Currently we are supporting Solana and [SonicSVM](https://www.sonic.game/) only

Here's a complete example showing how to create a token, buy, and sell using the SDK:

```typescript
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import {
  GoodrFunSDK,
  TokenMetadata,
  MemeDonationDestinationName,
  getMemeDonationDestinationFromName,
  ChainType,
} from 'goodrdotfun-sdk';
import { BigNumber } from 'bignumber.js';

const main = async () => {
  // Initialize SDK with RPC endpoint
  const rpcEndpoint = 'https://api.testnet.sonic.game'; // Use appropriate endpoint (Solana or Sonic SVM)
  const sdk = new GoodrFunSDK(ChainType.SONIC, rpcEndpoint);

  // Set up your wallet (using environment variables for security)
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

  console.log('Token created and bought:', {
    signature: result.signature,
    tokenAddress: mint.publicKey.toBase58(),
  });

  // Get token state
  const tokenState = await sdk.getCurrentState(mint.publicKey);
  console.log('Token state:', {
    bondingCurveProgress: `${tokenState.bondingCurveProgress}%`,
    price: `${tokenState.priceData.price} SOL`,
    totalSupply: `${tokenState.totalSupply} Tokens`,
    marketCap: `${tokenState.priceData.marketCap} SOL`,
  });

  // Buy more tokens
  const buyResult = await sdk.buy(wallet, {
    mint: mint.publicKey,
    solAmount: new BigNumber(0.01).multipliedBy(LAMPORTS_PER_SOL),
    slippageBasisPoints: 500,
  });

  console.log('Additional tokens bought:', {
    signature: buyResult.signature,
    tokenAddress: mint.publicKey.toBase58(),
  });

  // Sell tokens
  const sellResult = await sdk.sell(wallet, {
    mint: mint.publicKey,
    tokenAmount: new BigNumber(100000000).multipliedBy(10 ** 6),
    slippageBasisPoints: 500,
  });

  console.log('Tokens sold:', {
    signature: sellResult.signature,
    tokenAddress: mint.publicKey.toBase58(),
  });
};

main().catch(console.error);
```

## Features

- Create and buy tokens in a single transaction
- Buy and sell tokens with slippage protection
- Get token balances and price data
- Monitor token state and bonding curve progress
- Built-in bonding curve calculations

## API Reference

### GoodrFunSDK

The main SDK class for interacting with the GoodrFun program.

#### Constructor

```typescript
constructor(rpcEndpoint: string)
```

- `rpcEndpoint`: Solana RPC endpoint URL

#### Methods

- `createAndBuy(creator: Keypair, params: CreateAndBuyParams): Promise<TransactionResult>`

  - Creates a new token and buys initial tokens in a single transaction
  - Parameters:
    - `mint`: Token mint keypair
    - `buySolAmount`: Initial buy amount in SOL
    - `slippageBasisPoints`: Slippage tolerance
    - `metadata`: Token metadata (name, symbol, URI)

- `buy(creator: Keypair, params: BuyParams): Promise<TransactionResult>`

  - Buys tokens with specified SOL amount and slippage protection
  - Parameters:
    - `mint`: Token mint public key
    - `solAmount`: Amount of SOL to spend
    - `slippageBasisPoints`: Slippage tolerance

- `sell(creator: Keypair, params: SellParams): Promise<TransactionResult>`

  - Sells specified amount of tokens with slippage protection
  - Parameters:
    - `mint`: Token mint public key
    - `tokenAmount`: Amount of tokens to sell
    - `slippageBasisPoints`: Slippage tolerance

- `getCurrentState(mint: PublicKey): Promise<TokenState>`

  - Gets current token state including:
    - Bonding curve progress
    - Price data
    - Total supply
    - Market cap

- `getTokenAccountBalance(mint: PublicKey, authority: PublicKey): Promise<BigNumber>`

  - Gets token balance for a specific account
  - Parameters:
    - `mint`: Token mint public key
    - `authority`: Account owner public key

- `getPriceAndMarketcapData(mint: PublicKey): Promise<PriceData>`

  - Gets current price and market cap information
  - Returns price data including current price and market cap

- `calculateBuyTokenAmount(params: { mint: PublicKey, amountSol: BigNumber }): Promise<{ amountToken: BigNumber }>`
  - Calculates the amount of tokens that can be bought with a given SOL amount
  - Useful for price impact estimation before trading

#### Event Listeners

- `addOnCreateEvent(callback: (event: CreateEvent, slot: number, signature: string) => void): number`

  - Listen for token creation events
  - Returns an event listener ID

- `addOnTradeEvent(callback: (event: TradeEvent, slot: number, signature: string) => void): number`

  - Listen for trade events (buys and sells)
  - Returns an event listener ID

- `addOnCompleteEvent(callback: (event: CompleteEvent, slot: number, signature: string) => void): number`

  - Listen for completion events
  - Returns an event listener ID

- `addOnSetParamsEvent(callback: (event: SetParamsEvent, slot: number, signature: string) => void): number`

  - Listen for parameter update events
  - Returns an event listener ID

- `removeEventListener(...eventIds: number[]): void`
  - Remove one or more event listeners by their IDs

#### Event Usage Example

```typescript
// Listen for trade events
const tradeListenerId = sdk.addOnTradeEvent((event, slot, signature) => {
  console.log('Trade executed:', {
    event,
    slot,
    signature,
  });
});

// Listen for token creation
const createListenerId = sdk.addOnCreateEvent((event, slot, signature) => {
  console.log('Token created:', {
    event,
    slot,
    signature,
  });
});

// Remove listeners when no longer needed
sdk.removeEventListener(tradeListenerId, createListenerId);
```

## Error Handling Example

When using the SDK, you can catch and handle program errors (such as slippage or authorization errors) using a try/catch block. The SDK will throw a `ProgramError` (extending JavaScript's `Error`) for any known on-chain error, with a `code` and `message` property.

```typescript
import { GoodrFunSDK } from 'goodrdotfun-sdk'; // adjust import as needed
import { ProgramError } from 'goodrdotfun-sdk/src/base/types/common'; // adjust path as needed

async function buyTokens(sdk, buyParams) {
  try {
    const result = await sdk.buy(wallet, buyParams);
    console.log('Buy successful:', result);
  } catch (e) {
    if (e instanceof ProgramError) {
      // This is a program error from the Solana program
      console.error('Program error code:', e.code); // e.g., 'TooMuchSolRequired'
      console.error('Program error message:', e.message); // e.g., 'slippage: Too much SOL required to buy the given amount of tokens.'
      // Handle specific error codes if needed
      if (e.code === 'TooMuchSolRequired') {
        // Handle slippage error
      }
    } else {
      // This is some other error (network, JS, etc.)
      console.error('Other error:', e);
    }
  }
}
```

You can use this pattern for any SDK method that may throw a program error (e.g., `buy`, `sell`, `buyExactToken`, etc.).

## License

MIT
