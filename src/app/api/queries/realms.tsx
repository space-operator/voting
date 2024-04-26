import { getRealms } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection(
  process.env.NEXT_PUBLIC_HELIUS_URL,
  'confirmed'
);

export async function fetchRealms(pubkey: string) {
  const programId = new PublicKey(pubkey);

  const data = await getRealms(connection, programId);

  return JSON.stringify(data);
}
