import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@/constants/programs';
import { getAllProposals } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';

export async function fetchProposalsByRealm(
  pubkey: string,
  rpcEndpoint: string
) {
  const connection = new Connection(rpcEndpoint);
  const realmId = new PublicKey(pubkey);
  const govProgramId = new PublicKey(DEFAULT_GOVERNANCE_PROGRAM_ID);

  // Response is an array of arrays and not consistent, need to flatten
  const data = (await getAllProposals(connection, govProgramId, realmId)).flat();
  console.log('prefetching, data length', data.length);
  // Must stringify for server
  return JSON.stringify(data);
}
