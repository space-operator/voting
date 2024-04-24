import { getRealm } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

export async function fetchRealm(pubkey: string) {
  const connection = new Connection(process.env.HELIUS_MAINNET_URL, 'recent');
  const realmId = new PublicKey(pubkey);

  const data = await getRealm(connection, realmId);

  return data;
}

export function useRealm(props: { pubkey: string }) {
  const query = useSuspenseQuery({
    queryKey: ['realm', props.pubkey],
    queryFn: async () => await fetchRealm(props.pubkey),
    staleTime: 3600000, // 1 hour
  });

  return [query] as const;
}
