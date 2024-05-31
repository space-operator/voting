import { DevnetCluster, MainnetCluster } from '@/types/cluster';

export function extractCluster(slug: string[] | undefined) {
  const extractedSlug = slug?.length === 1 ? slug[0] : undefined;
  const cluster = extractedSlug === 'devnet' ? DevnetCluster : MainnetCluster;
  return { cluster };
}
