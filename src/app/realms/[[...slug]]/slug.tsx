'use client';

import { useParams } from 'next/navigation';
import { extractCluster } from './slugHelper';

/*
Slug examples

With cluster for server prefetching, slug length === 1
/devnet/

Without
/
*/
export function useRealmsSlug() {
  const { slug } = useParams<{ slug?: string[] }>();
  const { cluster } = extractCluster(slug);

  return { cluster };
}
