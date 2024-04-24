import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@/constants';
import { getAllProposals } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

export async function fetchProposalsByRealm(pubkey: string) {
  const connection = new Connection(process.env.HELIUS_MAINNET_URL, 'recent');
  const realmId = new PublicKey(pubkey);
  const programId = new PublicKey(DEFAULT_GOVERNANCE_PROGRAM_ID);

  const data = await getAllProposals(connection, programId, realmId);
  //   console.log(data);
  return data;
}

export function useProposalsByRealm(props: { pubkey: string }) {
  const query = useQuery({
    queryKey: ['realm-proposals', props.pubkey],
    queryFn: async () => await fetchProposalsByRealm(props.pubkey),
    // staleTime: 3600000, // 1 hour
  });

  return [query] as const;
}
