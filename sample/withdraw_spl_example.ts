import { Keypair, PublicKey } from '@solana/web3.js';
import { ChainType, GoodrFunSDK } from '../src';
import bs58 from 'bs58';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '.env') });

// SONIC Token Configuration
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

  const authority = new Keypair({
    publicKey: new PublicKey(walletPublicKey).toBytes(),
    secretKey: bs58.decode(walletPrivateKey),
  });

  // Example token mint - replace with actual completed bonding curve token
  const tokenMint = new PublicKey('REPLACE_WITH_ACTUAL_TOKEN_MINT');

  console.log('=== Withdraw SPL Example ===');
  console.log(`Authority: ${authority.publicKey.toBase58()}`);
  console.log(`Token Mint: ${tokenMint.toBase58()}`);
  console.log(`SONIC Mint: ${SONIC_TOKEN.MINT.toBase58()}`);

  try {
    // Check if bonding curve is complete before attempting withdrawal
    const bondingCurveState = await sdk.program.getBondingCurveV2State({
      mint: tokenMint,
    });

    if (!bondingCurveState) {
      throw new Error('Bonding curve V2 state not found for this token');
    }

    if (!bondingCurveState.complete) {
      throw new Error(
        'Bonding curve is not complete. Only completed bonding curves can be withdrawn from.',
      );
    }

    console.log('\n✅ Bonding curve is complete, proceeding with withdrawal...');

    // Withdraw tokens and SONIC from completed bonding curve
    const txHash = await sdk.withdrawSpl({
      authority: authority,
      mint: tokenMint,
      sonicMint: SONIC_TOKEN.MINT,
    });

    console.log(`\n🎉 Withdrawal successful!`);
    console.log(`📝 Transaction: ${txHash}`);
    console.log(
      `🔗 View on explorer: https://explorer.sonic.game/tx/${txHash}`,
    );
  } catch (error: any) {
    console.error('\n❌ Withdrawal failed:', error.message);

    if (error.message.includes('NotAuthorized')) {
      console.log(
        '💡 Note: Only the global program authority can withdraw from bonding curves',
      );
    } else if (error.message.includes('BondingCurveNotComplete')) {
      console.log(
        '💡 Note: The bonding curve must be complete before withdrawal is allowed',
      );
    }
  }
};

main().catch(console.error);