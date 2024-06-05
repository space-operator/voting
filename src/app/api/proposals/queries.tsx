import { NEXT_PUBLIC_API_URL } from '@/constants/endpoints';
import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@/constants/programs';
import { Cluster } from '@/types/cluster';
import { getAllProposals } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';

// Prefetch
export async function prefetchAllProposalsByRealm(pubkey: string) {
  // const realmPk = new PublicKey(pubkey);
  // Response is an array of arrays and not consistent, need to flatten
  const data = (await fetch(`/api/proposals?realmPk=${pubkey}`)).json();
  // Must stringify for server
  // return JSON.stringify(data);
  return data;
}

export function getAllProposalsQuery(
  realmPk: string,
  connection: Connection,
  programId: PublicKey,
  cluster: Cluster
) {
  return {
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['allProposals', realmPk, cluster?.type ?? 'mainnet'],
    queryFn: async () =>
      (
        await fetch(`${NEXT_PUBLIC_API_URL}/api/proposals?realmPk=${realmPk}`)
      ).json(),
    staleTime: 60 * 1000 * 60, // 1 hour
  };
}
