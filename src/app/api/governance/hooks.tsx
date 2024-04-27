import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import {
  Governance,
  ProgramAccount,
  VoteThreshold,
  VoteThresholdType,
  getGovernance,
} from '@solana/spl-governance';

export const governanceWithDefaults = (
  governance: ProgramAccount<Governance>
) => {
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
