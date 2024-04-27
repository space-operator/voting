// 1 + 32 + 32 + 32 + 8 + 4 + 4 + 1 + 1 + 6

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useRealmParams } from '../governance/realm';
import { useQuery } from '@tanstack/react-query';
import {
  TokenOwnerRecord,
  booleanFilter,
  getGovernanceAccounts,
  pubkeyFilter,
} from '@solana/spl-governance';

// TODO filter in the gPA (would need rpc to also index)
export const useTokenOwnerRecordsDelegatedToUser = () => {
  const { connection } = useConnection();
  const realm = useRealmParams();
  const wallet = useWallet().wallet.adapter;
  const walletPk = wallet?.publicKey ?? undefined;
  const enabled = realm !== undefined && walletPk !== undefined;
  const query = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      'token_owned_record',
      connection.rpcEndpoint,
      realm.data.pubkey,
      walletPk,
    ],
    queryFn: async () => {
      if (!enabled) throw new Error();

      const realmFilter = pubkeyFilter(1, realm.data.pubkey);
      const hasDelegateFilter = booleanFilter(
        1 + 32 + 32 + 32 + 8 + 4 + 4 + 1 + 1 + 6,
        true
      );
      const delegatedToUserFilter = pubkeyFilter(
        1 + 32 + 32 + 32 + 8 + 4 + 4 + 1 + 1 + 6 + 1,
        walletPk
      );
      if (!realmFilter || !delegatedToUserFilter) throw new Error(); // unclear why this would ever happen, probably it just cannot

      const results = await getGovernanceAccounts(
        connection,
        realm.data.owner,
        TokenOwnerRecord,
        [realmFilter, hasDelegateFilter, delegatedToUserFilter]
      );

      // This may or may not be resource intensive for big DAOs, and is not too useful
      /* 
        results.forEach((x) => {
          queryClient.setQueryData(
            tokenOwnerRecordQueryKeys.byPubkey(connection.cluster, x.pubkey),
            { found: true, result: x }
          )
        }) */

      return results;
    },
    enabled,
  });

  return query;
};
