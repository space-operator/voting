import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@/constants';
import { getAllProposals } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection(
  process.env.NEXT_PUBLIC_HELIUS_URL,
  'confirmed'
);

export async function fetchProposalsByRealm(pubkey: string) {
  const realmId = new PublicKey(pubkey);
  const programId = new PublicKey(DEFAULT_GOVERNANCE_PROGRAM_ID);

  // Response is an array of arrays and not consistent, need to flatten
  const data = (await getAllProposals(connection, programId, realmId)).flat();

  // Must stringify for server
  return JSON.stringify(data);
}
