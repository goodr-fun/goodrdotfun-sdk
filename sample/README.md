# GoodrFun SDK Samples

This directory contains sample usage examples for the GoodrFun SDK.

## Files

### `sample.ts` - SOL-based Operations
Demonstrates how to:
- Create and buy tokens using SOL as the base currency
- Buy additional tokens with SOL
- Sell tokens for SOL
- Query token state and pricing information

### `sample_sonic.ts` - SONIC-based Operations  
Demonstrates how to:
- Create and buy tokens using SONIC as the base currency
- Buy additional tokens with SONIC
- Sell tokens for SONIC
- Calculate token amounts and SONIC amounts
- Query token state and pricing information

## Key Differences

| Operation | SOL-based (sample.ts) | SONIC-based (sample_sonic.ts) |
|-----------|----------------------|-------------------------------|
| **Create & Buy** | `sdk.createAndBuy()` | `sdk.createAndBuyWithSonic()` |
| **Buy Tokens** | `sdk.buy()` | `sdk.buyWithSonic()` |
| **Sell Tokens** | `sdk.sell()` | `sdk.sellWithSonic()` |
| **Base Currency** | SOL (native) | SONIC token |
| **Amount Units** | LAMPORTS_PER_SOL | SONIC decimals (9) |
| **Required Params** | `solAmount` | `sonicAmount` + `baseCurrencyMint` |

## SONIC Token Configuration

```typescript
const SONIC_TOKEN = {
  MINT: new PublicKey('mrujEYaN1oyQXDHeYNxBYpxWKVkQ2XsGxfznpifu4aL'),
  DECIMALS: 9,
};
```

## Setup

1. Copy `.env.example` to `.env`
2. Set your wallet credentials:
   ```
   WALLET_PUBLIC_KEY=your_public_key_here
   WALLET_PRIVATE_KEY=your_private_key_here
   ```
3. Ensure you have SONIC tokens in your wallet for SONIC-based operations
4. Run the samples:
   ```bash
   npx ts-node sample/sample.ts        # SOL-based
   npx ts-node sample/sample_sonic.ts  # SONIC-based
   ```

## Key Concepts

### SOL-based Bonding Curve
- Uses native SOL as the base currency
- Simpler parameter structure
- Standard bonding curve mechanics

### SONIC-based Bonding Curve (V2)
- Uses SONIC SPL token as base currency
- Requires `baseCurrencyMint` parameter
- Enhanced bonding curve with SPL token support
- More complex but supports any SPL token as base currency

### Amount Calculations

**SOL Example:**
```typescript
// Buy with 0.1 SOL
buySolAmount: new BigNumber(0.1).multipliedBy(LAMPORTS_PER_SOL)
```

**SONIC Example:**
```typescript
// Buy with 100 SONIC
buySonicAmount: new BigNumber(100).multipliedBy(10 ** SONIC_TOKEN.DECIMALS)
```

## Error Handling

Both samples include basic error handling. For production use, implement proper error handling for:
- Network connectivity issues
- Insufficient token balance
- Slippage tolerance exceeded
- Program errors