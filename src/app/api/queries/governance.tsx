import { Connection, PublicKey } from '@solana/web3.js';
import { fetchRealmByPubkey } from '../getRealm';
import { fetchRealmConfigQuery } from './realmConfig';
import { findPluginName } from '@/constants/plugins';
import { GovernanceRole } from '@/types/governance';
import { useConnection } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import {
  Governance,
  ProgramAccount,
  VoteThreshold,
  VoteThresholdType,
  getGovernance,
} from '@solana/spl-governance';

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

const governanceWithDefaults = (governance: ProgramAccount<Governance>) => {
  const isGovernanceInNeedForDefaultValues =
    governance.account.config.councilVoteThreshold.value === 0 &&
    governance.account.config.councilVoteThreshold.type ===
      VoteThresholdType.YesVotePercentage;
  return isGovernanceInNeedForDefaultValues
    ? ({
        ...governance,
        account: {
          ...governance.account,
          config: {
            ...governance.account.config,
            votingCoolOffTime: 0,
            depositExemptProposalCount: 10,
            councilVoteThreshold:
              governance.account.config.communityVoteThreshold,
            councilVetoVoteThreshold:
              governance.account.config.communityVoteThreshold,
            councilVoteTipping: governance.account.config.communityVoteTipping,
            communityVetoVoteThreshold: new VoteThreshold({
              type: VoteThresholdType.Disabled,
            }),
          },
        },
      } as ProgramAccount<Governance>)
    : governance;
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
