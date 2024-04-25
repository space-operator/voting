import { getRealm } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection(process.env.HELIUS_MAINNET_URL, 'confirmed');

export async function fetchRealm(pubkey: string) {
  const realmId = new PublicKey(pubkey);

  const data = await getRealm(connection, realmId);

  return JSON.stringify(data);
}
