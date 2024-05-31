'use client';

import { useParams } from 'next/navigation';
import { extractPubkeyAndCluster } from './slugHelper';

/*
Slug examples

With cluster for server prefetching, slug length === 2
/devnet/ExJuzuE1wZbjFzQD1SMo47YrRtwA7NRHZzRLQF9EJ4b6

Without
/ExJuzuE1wZbjFzQD1SMo47YrRtwA7NRHZzRLQF9EJ4b6
*/
export function useRealmSlug() {
  const { slug } = useParams<{ slug?: string[] }>();
  const { pubkey, cluster } = extractPubkeyAndCluster(slug);

  return { pubkey, cluster };
}
