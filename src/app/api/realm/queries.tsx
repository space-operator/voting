import { queryClient } from '@/providers/query';
import { ProgramAccount, Realm, getRealm } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';

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
