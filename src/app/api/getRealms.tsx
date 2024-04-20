import { getRealms } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';
import { useSuspenseQuery } from '@tanstack/react-query';

export async function fetchRealms(pubkey: string) {
  const connection = new Connection(
    'https://eran-eafb8u-fast-mainnet.helius-rpc.com/',
    'recent'
  );
  const programId = new PublicKey(pubkey);

  const data = await getRealms(connection, programId);

  return data;
}

export function useRealms(props: { pubkey: string }) {
  const query = useSuspenseQuery({
    queryKey: ['realms', props.pubkey],
    queryFn: async () => await fetchRealms(props.pubkey),
    staleTime: 3600000, // 1 hour
  });

  return [query] as const;
}
