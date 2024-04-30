'use client';

import { useConnection } from '@solana/wallet-adapter-react';
import { useRealmParams } from '../governance/realm';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { getRealmConfig, getRealmConfigAddress } from '@solana/spl-governance';

export const useRealmConfigQuery = () => {
  const { connection } = useConnection();
  const realm = useRealmParams();

  const query = useSuspenseQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['realm-config', realm.data.pubkey, connection.rpcEndpoint],
    queryFn: async () =>
      await getRealmConfigAddress(realm.data.owner, realm.data.pubkey).then(
        (data) => getRealmConfig(connection, data)
      ),
    staleTime: 3600000, // 1 hour
  });
  return query;
};
