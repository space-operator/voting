import { CURRENT_RPC_ENDPOINT, DEVNET_RPC_ENDPOINT } from '@/constants/endpoints';
import { getRealms } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection(CURRENT_RPC_ENDPOINT, 'confirmed');

export async function fetchRealms(pubkey: string) {
  const programId = new PublicKey(pubkey);

  const data = await getRealms(connection, programId);

  return JSON.stringify(data);
}
