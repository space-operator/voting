'use client';

import { realmAtom } from '@/components/display-proposals';
import { ProgramAccount, Realm, getRealm } from '@solana/spl-governance';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { atom, useAtom } from 'jotai';
import { useParams } from 'next/navigation';

export function useRealm(
  pubkey: string
): UseQueryResult<ProgramAccount<Realm>, Error> {
  const { connection } = useConnection();

  const realmId = new PublicKey(pubkey);

  const query = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['realm', realmId, connection.rpcEndpoint],
    queryFn: async () => await getRealm(connection, realmId),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return query;
}

export function useRealmParams() {
  // const { id: pubkey } = useParams<{ id: string }>();
  const [realm, setRealm] = useAtom(realmAtom);
  console.log('useRealmParams', realm.pubkey.toString());

  return useRealm(realm.pubkey.toString());
}
