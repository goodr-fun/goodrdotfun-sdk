import { GoodrSDK } from '../src';
import { Connection, PublicKey } from '@solana/web3.js';

describe('GoodrSDK', () => {
  it('should create SDK instance', () => {
    const connection = new Connection('http://localhost:8899');
    const programId = new PublicKey('11111111111111111111111111111111');
    const sdk = new GoodrSDK(connection, programId);
    expect(sdk).toBeDefined();
  });
});
