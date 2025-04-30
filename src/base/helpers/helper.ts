import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  Keypair,
  PublicKey,
  Connection,
  Signer,
  Transaction,
  SystemProgram,
  Commitment,
  Finality,
  VersionedTransaction,
  VersionedTransactionResponse,
  SendTransactionError,
  ComputeBudgetProgram,
  TransactionMessage,
} from '@solana/web3.js';
import bs58 from 'bs58';
import { DEFAULT_FINALITY, DEFAULT_COMMITMENT } from '../constant';
import { PriorityFee, TransactionResult } from '../types/common';

/**
 * Generates a Solana vanity address that ends with "pump".
 * @returns {Keypair} The generated Keypair.
 */
export async function generateVanityAddress(): Promise<Keypair> {
  let keypair: Keypair;
  let publicKey: PublicKey;
  let attempts = 0;

  console.log("Searching for a vanity address ending with 'pump'...");

  do {
    keypair = Keypair.generate();
    publicKey = keypair.publicKey;
    attempts++;

    if (attempts % 1000 === 0) {
      console.log(`Attempts: ${attempts}, Last: ${publicKey.toBase58()}`);
    }
  } while (!publicKey.toBase58().startsWith('Poly'));

  console.log(`Found matching address after ${attempts} attempts!`);
  console.log(`Public Key: ${publicKey.toBase58()}`);
  console.log(`Secret Key (Base58): ${bs58.encode(keypair.secretKey)}`);

  return keypair;
}

export async function mintTokenTo(
  connection: Connection,
  tokenMint: PublicKey,
  mintAuthority: Signer,
  payer: Signer,
  to: PublicKey,
  amount: number,
): Promise<string> {
  const userTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    tokenMint,
    to,
    true,
  );

  const mintInfo = await getMint(connection, tokenMint);

  const txhash = await mintTo(
    connection,
    payer,
    tokenMint,
    userTokenAccount.address,
    mintAuthority,
    amount * 10 ** mintInfo.decimals,
  );

  return txhash;
}

export async function wrappedSOLInstruction(
  connection: Connection,
  recipient: PublicKey,
  amount: number,
) {
  const { tokenAccount: ata, tx: tx } = await getOrCreateTokenAccountTx(
    connection,
    NATIVE_MINT, // mint
    recipient, // owner
    recipient, // payer
  );

  if (!tx) {
    throw new Error('Transaction not found');
  }

  tx.add(
    SystemProgram.transfer({
      fromPubkey: recipient,
      toPubkey: ata,
      lamports: amount,
    }),
    createSyncNativeInstruction(ata),
  );

  return tx;
}

export async function getOrCreateTokenAccountTx(
  connection: Connection,
  mint: PublicKey,
  payer: PublicKey,
  owner: PublicKey,
): Promise<{ tokenAccount: PublicKey; tx: Transaction | null }> {
  const programId = (await isToken2022Mint(connection, mint))
    ? TOKEN_2022_PROGRAM_ID
    : TOKEN_PROGRAM_ID;

  const tokenAccount = await getAssociatedTokenAddress(
    mint,
    owner,
    true,
    programId,
  );
  try {
    await getAccount(connection, tokenAccount, 'confirmed', programId);
    return { tokenAccount: tokenAccount, tx: null };
  } catch (error) {
    const transaction = new Transaction();

    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer,
        tokenAccount,
        owner,
        mint,
        programId,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );
    return { tokenAccount: tokenAccount, tx: transaction };
  }
}

export async function isToken2022Mint(
  connection: Connection,
  mint: PublicKey,
): Promise<boolean> {
  const accountInfo = await connection.getAccountInfo(mint);
  if (accountInfo?.owner.toString() == TOKEN_2022_PROGRAM_ID.toString()) {
    return true;
  }
  return false;
}

export const calculateWithSlippageBuy = (
  amount: BigNumber,
  basisPoints: number,
): BigNumber => {
  return amount.plus(amount.multipliedBy(basisPoints).dividedBy(10000));
};

export const calculateWithSlippageSell = (
  amount: BigNumber,
  basisPoints: number,
): BigNumber => {
  return amount.minus(amount.multipliedBy(basisPoints).dividedBy(10000));
};

export async function sendTx(
  connection: Connection,
  tx: Transaction,
  payer: PublicKey,
  signers: Keypair[],
  priorityFees?: PriorityFee,
  commitment: Commitment = DEFAULT_COMMITMENT,
  finality: Finality = DEFAULT_FINALITY,
): Promise<TransactionResult> {
  const newTx = new Transaction();

  if (priorityFees) {
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: priorityFees.unitLimit,
    });

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: priorityFees.unitPrice,
    });
    newTx.add(modifyComputeUnits);
    newTx.add(addPriorityFee);
  }

  newTx.add(tx);

  const versionedTx = await buildVersionedTx(
    connection,
    payer,
    newTx,
    commitment,
  );
  versionedTx.sign(signers);

  try {
    const sig = await connection.sendTransaction(versionedTx, {
      skipPreflight: false,
    });

    const txResult = await getTxDetails(connection, sig, commitment, finality);
    if (!txResult) {
      return {
        success: false,
        error: 'Transaction failed',
      };
    }
    return {
      success: true,
      signature: sig,
      results: txResult,
    };
  } catch (e) {
    if (e instanceof SendTransactionError) {
      const ste = e as SendTransactionError;
      console.log('SendTransactionError' + (await ste.getLogs(connection)));
    } else {
      console.error(e);
    }
    return {
      error: e,
      success: false,
    };
  }
}

export const buildVersionedTx = async (
  connection: Connection,
  payer: PublicKey,
  tx: Transaction,
  commitment: Commitment = DEFAULT_COMMITMENT,
): Promise<VersionedTransaction> => {
  const blockHash = (await connection.getLatestBlockhash(commitment)).blockhash;

  const messageV0 = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockHash,
    instructions: tx.instructions,
  }).compileToV0Message();

  return new VersionedTransaction(messageV0);
};

export const getTxDetails = async (
  connection: Connection,
  sig: string,
  commitment: Commitment = DEFAULT_COMMITMENT,
  finality: Finality = DEFAULT_FINALITY,
): Promise<VersionedTransactionResponse | null> => {
  const latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction(
    {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: sig,
    },
    commitment,
  );

  return connection.getTransaction(sig, {
    maxSupportedTransactionVersion: 0,
    commitment: finality,
  });
};

export const getBalanceChange = async (
  connection: Connection,
  txHash: string,
  accountPubkey: PublicKey,
): Promise<{
  preBalance: number;
  postBalance: number;
  balanceChange: number;
}> => {
  const transactionWithMeta = await connection.getParsedTransaction(txHash);
  const accountKeys = transactionWithMeta?.transaction.message.accountKeys;
  if (!accountKeys) {
    throw new Error('Account keys not found');
  }
  const accountIndex = accountKeys.findIndex(
    accountKey => accountKey.pubkey.toBase58() === accountPubkey.toBase58(),
  );
  if (accountIndex === -1) {
    throw new Error('Account not found');
  }
  if (!transactionWithMeta?.meta) {
    throw new Error('Transaction meta not found');
  }

  const preBalance = transactionWithMeta.meta.preBalances[accountIndex];
  const postBalance = transactionWithMeta.meta.postBalances[accountIndex];
  const balanceChange = postBalance - preBalance;

  return { preBalance, postBalance, balanceChange };
};
