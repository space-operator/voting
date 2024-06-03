'use client';

import { useConnection } from '@solana/wallet-adapter-react';
import { useRealmFromParams } from '../realm/hooks';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { getRealmConfig, getRealmConfigAddress } from '@solana/spl-governance';

export const useRealmConfig = () => {
  const { connection } = useConnection();
  const { data: realm } = useRealmFromParams();

  const query = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['realmConfig', realm.pubkey, connection.rpcEndpoint],
    queryFn: async () => {
      try {
        const realmConfigPk = await getRealmConfigAddress(
          realm.owner,
          realm.pubkey
        );
        return await getRealmConfig(connection, realmConfigPk);
      } catch (error) {
        console.error('Failed to fetch realm configuration:', error);
      }
    },
    staleTime: 60 * 1000 * 60, // 1 hour
  });
  return query;
};
