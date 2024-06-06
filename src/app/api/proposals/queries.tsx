import { API_URL, NEXT_PUBLIC_API_URL } from '@/constants/endpoints';
import { Cluster } from '@/types/cluster';
import { Connection, PublicKey } from '@solana/web3.js';

// Prefetch
export async function prefetchAllProposalsByRealm(pubkey: string) {
  // const realmPk = new PublicKey(pubkey);
  // Response is an array of arrays and not consistent, need to flatten
  const data = (
    await fetch(`${API_URL}/api/proposals?realmPk=${pubkey}`)
  ).json();

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
      (await fetch(`${API_URL}/api/proposals?realmPk=${realmPk}`)).json(),
    staleTime: 60 * 1000 * 60, // 1 hour
  };
}
