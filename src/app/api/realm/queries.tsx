import {
  CURRENT_RPC_ENDPOINT,
  DEVNET_RPC_ENDPOINT,
  MAINNET_RPC_ENDPOINT,
} from '@/constants/endpoints';
import { queryClient } from '@/providers/query';
import {
  ProgramAccount,
  Realm,
  getRealm,
  getRealms,
} from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';
import { atom, useAtom } from 'jotai';

// FIXME: use the correct endpoint
const connection = new Connection(CURRENT_RPC_ENDPOINT, 'confirmed');

// prefetch all Realms
export async function prefetchRealms(pubkey: string) {
  const realmId = new PublicKey(pubkey);

  const data = await getRealms(connection, realmId);

  // stringify for server
  return JSON.stringify(data);
}



export async function fetchRealmByPubkey(
  connection: Connection,
  pubkey: PublicKey
) {
  return await queryClient.fetchQuery(getRealmQuery(pubkey, connection));
}

export function getRealmQuery(pubkey: PublicKey, connection: Connection) {
  return {
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['realm', pubkey, connection.rpcEndpoint],
    queryFn: async () => await getRealm(connection, pubkey),
    staleTime: 1000 * 60 * 60,
  };
}
