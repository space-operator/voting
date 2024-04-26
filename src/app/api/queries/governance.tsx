import { Connection, PublicKey } from '@solana/web3.js';
import { fetchRealmByPubkey } from './realm';
import { fetchRealmConfigQuery } from './realmConfig';
import { findPluginName } from '@/constants/plugins';
import { GovernanceRole } from '@/types/governance';
import { useConnection } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import { getGovernance } from '@solana/spl-governance';
import { governanceWithDefaults } from '@/VoteStakeRegistry/sdk/accounts';

export const determineVotingPowerType = async (
  connection: Connection,
  realmPk: PublicKey,
  role: GovernanceRole
) => {
  const realm = await fetchRealmByPubkey(connection, realmPk);
  if (!realm) throw new Error();

  const config = await fetchRealmConfigQuery(connection, realmPk);
  const programId =
    role === 'community'
      ? config.account.communityTokenConfig.voterWeightAddin
      : config.account.councilTokenConfig.voterWeightAddin;

  return findPluginName(programId);
};

export const useGovernanceByPubkeyQuery = (pubkey: PublicKey | undefined) => {
  const { connection } = useConnection();

  const query = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['realm-governance', pubkey, connection.rpcEndpoint],
    queryFn: async () => {
      const governance = await getGovernance(connection, pubkey);
      return governanceWithDefaults(governance);
    },
  });

  return query;
};
