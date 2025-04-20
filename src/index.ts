import { Connection, PublicKey } from '@solana/web3.js';

export class GoodrSDK {
  private connection: Connection;
  private programId: PublicKey;

  constructor(connection: Connection, programId: PublicKey) {
    this.connection = connection;
    this.programId = programId;
  }

  // Add your SDK methods here
}

export * from './types';
