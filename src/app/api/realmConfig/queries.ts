import { queryClient } from '@/providers/query';
import { getRealmConfigAddress, getRealmConfig } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';
import { fetchRealmByPubkey } from '../realm/queries';

export const fetchRealmConfigQuery = async (
  connection: Connection,
  pubkey: PublicKey
) =>
  queryClient.fetchQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['realmConfig', pubkey, connection.rpcEndpoint],
    queryFn: async () => {
      const realm = await fetchRealmByPubkey(connection, pubkey);
      if (realm === undefined) throw new Error('Realm not found');

      const realmConfigPk = await getRealmConfigAddress(
        realm.owner,
        realm.pubkey
      );
      return getRealmConfig(connection, realmConfigPk);
    },
    staleTime: 60 * 1000 * 60, // 1 hour
  });
