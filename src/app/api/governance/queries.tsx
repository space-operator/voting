import {
  CURRENT_RPC_ENDPOINT,
  DEVNET_RPC_ENDPOINT,
  MAINNET_RPC_ENDPOINT,
} from '@/constants/endpoints';
import { queryClient } from '@/providers/query';
import { ProgramAccount, Realm, getRealm } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';
import { atom, useAtom } from 'jotai';

// FIXME: use the correct endpoint
const connection = new Connection(CURRENT_RPC_ENDPOINT, 'confirmed');

export async function fetchRealm(pubkey: string) {
  const realmId = new PublicKey(pubkey);

  const data = await getRealm(connection, realmId);

  return JSON.stringify(data);
}

export const fetchRealmByPubkey = async (
  connection: Connection,
  pubkey: PublicKey
) => {
  console.log('fetchRealmByPubkey', connection.rpcEndpoint);
  const data = await queryClient.fetchQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['realm', pubkey, connection.rpcEndpoint],
    queryFn: async () => await getRealm(connection, pubkey),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return data;
};
