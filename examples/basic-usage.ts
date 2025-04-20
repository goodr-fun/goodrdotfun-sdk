import { GoodrSDK } from '../src';
import { Connection, PublicKey } from '@solana/web3.js';

async function main() {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const programId = new PublicKey('YOUR_PROGRAM_ID');

  const sdk = new GoodrSDK(connection, programId);

  // Add your example usage here
}

main().catch(console.error);
