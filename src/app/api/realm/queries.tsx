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


// prefetch all Realms
export async function prefetchRealms(pubkey: string, rpcEndpoint: string) {
  const connection = new Connection(rpcEndpoint, 'confirmed');
  const governanceProgramID = new PublicKey(pubkey);

  const data = await getRealms(connection, governanceProgramID);

  // stringify for server
  return JSON.stringify(data);
}


// prefetch SINGLE Realm
export async function prefetchRealm(pubkey: string, rpcEndpoint: string) {
  const connection = new Connection(rpcEndpoint, 'confirmed');
  const governanceProgramID = new PublicKey(pubkey);

  const data = await getRealm(connection, governanceProgramID);

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
