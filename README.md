# Goodr SDK

JavaScript/TypeScript SDK for interacting with goodr.fun and Sonic on Solana.

## Installation

```bash
npm install goodr-sdk
```

## Usage

```typescript
import { GoodrFunSDK } from 'goodr-sdk';
import { Keypair } from '@solana/web3.js';

// Initialize the SDK with your RPC endpoint
const sdk = new GoodrFunSDK('https://api.mainnet-beta.solana.com');

// Create and buy tokens in a single transaction
const creator = Keypair.generate();
const result = await sdk.createAndBuy(creator, {
  mint: Keypair.generate(),
  metadata: {
    name: 'My Token',
    symbol: 'MTK',
    metadataUri: 'https://example.com/metadata.json',
  },
  donationDestination: 'charity',
  donationAmount: 1000000, // 0.001 SOL
  buySolAmount: new BigNumber(1000000000), // 1 SOL
  slippageBasisPoints: 100, // 1% slippage
});

// Buy tokens
const buyResult = await sdk.buy(creator, {
  mint: new PublicKey('TOKEN_MINT_ADDRESS'),
  solAmount: new BigNumber(1000000000), // 1 SOL
  slippageBasisPoints: 100,
});

// Sell tokens
const sellResult = await sdk.sell(creator, {
  mint: new PublicKey('TOKEN_MINT_ADDRESS'),
  tokenAmount: new BigNumber(1000),
  slippageBasisPoints: 100,
});

// Get token balance
const balance = await sdk.getTokenAccountBalance(
  new PublicKey('TOKEN_MINT_ADDRESS'),
  creator.publicKey,
);

// Get price and market cap data
const priceData = await sdk.getPriceAndMarketcapData(
  new PublicKey('TOKEN_MINT_ADDRESS'),
);

// Get current token state
const tokenState = await sdk.getCurrentState(
  new PublicKey('TOKEN_MINT_ADDRESS'),
);

// Listen to events
sdk.addOnCreateEvent((event, slot, signature) => {
  console.log('Token created:', event);
});

sdk.addOnTradeEvent((event, slot, signature) => {
  console.log('Trade executed:', event);
});

sdk.addOnCompleteEvent((event, slot, signature) => {
  console.log('Event completed:', event);
});

sdk.addOnSetParamsEvent((event, slot, signature) => {
  console.log('Parameters set:', event);
});
```

## Features

- Create and buy tokens in a single transaction
- Buy and sell tokens with slippage protection
- Get token balances and price data
- Monitor token events (create, trade, complete, set params)
- Support for donations to various destinations
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
- `buy(creator: Keypair, params: BuyParams): Promise<TransactionResult>`
- `sell(creator: Keypair, params: SellParams): Promise<TransactionResult>`
- `getTokenAccountBalance(mint: PublicKey, authority: PublicKey): Promise<BigNumber>`
- `calculateBuyTokenAmount(params: { mint: PublicKey, amountSol: BigNumber }): Promise<{ amountToken: BigNumber }>`
- `getPriceAndMarketcapData(mint: PublicKey): Promise<PriceData>`
- `getCurrentState(mint: PublicKey): Promise<TokenState>`
- `addOnCreateEvent(callback: (event: CreateEvent, slot: number, signature: string) => void): number`
- `addOnTradeEvent(callback: (event: TradeEvent, slot: number, signature: string) => void): number`
- `addOnCompleteEvent(callback: (event: CompleteEvent, slot: number, signature: string) => void): number`
- `addOnSetParamsEvent(callback: (event: SetParamsEvent, slot: number, signature: string) => void): number`
- `removeEventListener(...eventIds: number[]): void`

## License

MIT
