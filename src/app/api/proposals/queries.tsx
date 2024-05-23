import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@/constants/programs';
import { getAllProposals } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';

// Prefetch
export async function prefetchAllProposalsByRealm(
  pubkey: string,
  rpcEndpoint: string
) {
  const connection = new Connection(rpcEndpoint);
  const realmId = new PublicKey(pubkey);
  const govProgramId = new PublicKey(DEFAULT_GOVERNANCE_PROGRAM_ID);

  // Response is an array of arrays and not consistent, need to flatten
  const data = (
    await getAllProposals(connection, govProgramId, realmId)
  ).flat();

  // Must stringify for server
  return JSON.stringify(data);
}

export function getAllProposalsQuery(
  realmPk: string,
  connection: Connection,
  programId: PublicKey,
  realmId: PublicKey
) {
  return {
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['allProposals', realmPk, connection.rpcEndpoint],
    queryFn: async () =>
      (await getAllProposals(connection, programId, realmId)).flat(),
      staleTime: 60 * 1000 * 60, // 1 hour
    };
}
