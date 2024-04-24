import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@/constants';
import { getAllProposals } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';

export async function fetchProposalsByRealm(pubkey: string) {
  const connection = new Connection(process.env.NEXT_PUBLIC_HELIUS_URL, 'confirmed');

  const realmId = new PublicKey(pubkey);
  const programId = new PublicKey(DEFAULT_GOVERNANCE_PROGRAM_ID);

  const data = await getAllProposals(connection, programId, realmId);

  // Must stringify for server
  return JSON.stringify(data[0]);
}
