import { DevnetCluster, MainnetCluster } from '@/types/cluster';

export function extractPubkeyAndCluster(slug: string[] | undefined) {
  const pubkey = slug?.length === 1 ? slug[0] : slug?.[1];
  const extractedCluster = slug?.length === 2 ? slug[0] : undefined;
  const cluster =
    extractedCluster === 'devnet' ? DevnetCluster : MainnetCluster;

  return { pubkey, cluster };
}
