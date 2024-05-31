import {
  DEVNET_RPC_ENDPOINT,
  MAINNET_RPC_ENDPOINT,
} from '@/constants/endpoints';

export function extractCluster(slug: string[] | undefined) {
  const extractedSlug = slug?.length === 1 ? slug[0] : undefined;
  const cluster =
    extractedSlug === 'devnet' ? DEVNET_RPC_ENDPOINT : MAINNET_RPC_ENDPOINT;
  return { cluster };
}
