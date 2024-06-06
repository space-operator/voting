import { NEXT_PUBLIC_API_URL } from '@/constants/endpoints';
import { Cluster } from '@/types/cluster';

// Prefetch
export async function prefetchAllProposalsByRealm(pubkey: string) {
  // const realmPk = new PublicKey(pubkey);
  // Response is an array of arrays and not consistent, need to flatten
  const data = (
    await fetch(`${NEXT_PUBLIC_API_URL}/api/proposals?realmPk=${pubkey}`, {
      next: { tags: ['proposals'], revalidate: 1800 },
    })
  ).json();

  return data;
}

export function getAllProposalsQuery(realmPk: string, cluster: Cluster) {
  return {
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['allProposals', realmPk, cluster?.type ?? 'mainnet'],
    queryFn: async () =>
      (
        await fetch(`${NEXT_PUBLIC_API_URL}/api/proposals?realmPk=${realmPk}`, {
          next: { tags: ['proposals'], revalidate: 1800 },
        })
      ).json(),
    staleTime: 60 * 1000 * 60, // 1 hour
  };
}

// export function getAllProposalsClientQuery(
//   connection: Connection,
//   programId: PublicKey,
//   realmId: PublicKey
// ) {
//   return {
//     // eslint-disable-next-line @tanstack/query/exhaustive-deps
//     queryKey: ['allProposals', realmId.toString(), connection.rpcEndpoint],
//     queryFn: async () =>
//       (await getAllProposals(connection, programId, realmId)).flat(),
//     staleTime: 60 * 1000 * 60, // 1 hour
//   };
// }
