import {
  DEVNET_RPC_ENDPOINT,
  MAINNET_RPC_ENDPOINT,
} from '@/constants/endpoints';

export function extractPubkeyAndCluster(slug: string[] | undefined) {
  const pubkey = slug?.length === 1 ? slug[0] : slug?.[1];
  const extractedCluster = slug?.length === 2 ? slug[0] : undefined;
  const cluster =
    extractedCluster === 'devnet' ? DEVNET_RPC_ENDPOINT : MAINNET_RPC_ENDPOINT;
  return { pubkey, cluster };
}
