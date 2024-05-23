"use client";

import { PublicKey } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  Governance,
  ProgramAccount,
  VoteThreshold,
  VoteThresholdType,
  getGovernance,
} from "@solana/spl-governance";

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

export const useGovernance = (pubkey: PublicKey) => {
  const { connection } = useConnection();

  const query = useSuspenseQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["governance", pubkey, connection.rpcEndpoint],
    queryFn: async () => {
      const governance = await getGovernance(connection, pubkey);
      return governanceWithDefaults(governance);
    },
    staleTime: 60 * 1000 * 60, // 1 hour
  });

  return query;
};
