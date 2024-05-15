import { PublicKey } from '@solana/web3.js';

import {
  Governance,
  ProgramAccount,
  Proposal,
  ProposalState,
  VoteThresholdType,
} from '@solana/spl-governance';
import dayjs from 'dayjs';
import { BN } from 'bn.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRealmVoterWeightPlugins } from '../governance/voterWeightPlugins';
import {
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from '../tokenOwnerRecord/hooks';
import { useRealmParams } from '../realm/hooks';
import {
  useHasVoteTimeExpired,
  useProposalVoteRecordQuery,
} from '../voteRecord/hooks';
import { useMemo } from 'react';
import { useGovernanceByPubkeyQuery } from '../governance/hooks';
import { useDelegatorAwareVoterWeight } from '../useDelegatorAwareVoterWeight';

export const useIsVoting = ({
  proposal,
  governance,
}: {
  proposal: ProgramAccount<Proposal>;
  governance: ProgramAccount<Governance>;
}) => {
  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!);

  const isVoting =
    proposal.account.state === ProposalState.Voting && !hasVoteTimeExpired;
  return isVoting;
};

// TODO not a hook
export function isInCoolOffTime(
  proposal: Proposal | undefined,
  governance: Governance | undefined
) {
  const mainVotingEndedAt = new BN(proposal?.signingOffAt, 'hex')
    ?.addn(governance?.config.baseVotingTime || 0)
    .toNumber();

  const votingCoolOffTime = governance?.config.votingCoolOffTime || 0;
  const canFinalizeAt = mainVotingEndedAt
    ? mainVotingEndedAt + votingCoolOffTime
    : mainVotingEndedAt;

  const endOfProposalAndCoolOffTime = canFinalizeAt
    ? dayjs(1000 * canFinalizeAt!)
    : undefined;

  const isInCoolOffTime = endOfProposalAndCoolOffTime
    ? dayjs().isBefore(endOfProposalAndCoolOffTime) &&
      mainVotingEndedAt &&
      dayjs().isAfter(mainVotingEndedAt * 1000)
    : undefined;

  return !!isInCoolOffTime && proposal!.state !== ProposalState.Defeated;
}

const useHasAnyVotingPower = (role: 'community' | 'council' | undefined) => {
  const voterWeight = useDelegatorAwareVoterWeight(role ?? 'community');
  const { isReady } = useRealmVoterWeightPlugins(role);
  console.log('voterWeight', voterWeight);
  console.log('isReady', isReady);
  return (
    isReady && !!voterWeight?.value && voterWeight.value?.isZero() === false
  );
};

export const useCanVote = ({
  proposal,
}: {
  proposal: ProgramAccount<Proposal>;
}) => {
  const { isReady, includesPlugin } = useRealmVoterWeightPlugins();
  const votingPop = useVotingPop(proposal?.account.governingTokenMint);

  const wallet = useWallet().wallet.adapter;
  const connected = !!wallet?.connected;

  const { data: ownVoteRecord } = useProposalVoteRecordQuery({
    quorum: 'electoral',
    proposal,
  });
  console.log('ownVoteRecord', ownVoteRecord);

  const voterTokenRecord = useVoterTokenRecord({ proposal: proposal.account });

  const { plugins } = useRealmVoterWeightPlugins(votingPop);

  const hasAllVoterWeightRecords = (plugins?.voterWeight ?? []).every(
    (plugin) => plugin.weights !== undefined
  );
  const isVoteCast = !!ownVoteRecord;

  const hasMinAmountToVote = useHasAnyVotingPower(votingPop);
  console.log('hasMinAmountToVote', hasMinAmountToVote);

  const canVote =
    connected &&
    !(isReady && includesPlugin('NFT') && !voterTokenRecord) &&
    !(isReady && includesPlugin('HeliumVSR') && !voterTokenRecord) &&
    hasAllVoterWeightRecords &&
    !isVoteCast &&
    hasMinAmountToVote;

  const voteTooltipContent = !connected
    ? 'You need to connect your wallet to be able to vote'
    : isReady && includesPlugin('NFT') && !voterTokenRecord
    ? 'You must join the Realm to be able to vote'
    : !hasMinAmountToVote
    ? 'You don’t have governance power to vote in this dao'
    : '';

  return [canVote, voteTooltipContent] as const;
};

export const useVoterTokenRecord = ({ proposal }: { proposal: Proposal }) => {
  const votingPop = useVotingPop(proposal?.governingTokenMint);

  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data;
  const ownCouncilTokenRecord = useUserCouncilTokenOwnerRecord().data;

  const voterTokenRecord =
    votingPop === 'community' ? ownTokenRecord : ownCouncilTokenRecord;
  return voterTokenRecord;
};

// proposal's governing token mint
export const useVotingPop = (proposalGoverningMint: PublicKey) => {
  const { data: realm } = useRealmParams();

  const role =
    realm === undefined || proposalGoverningMint === undefined
      ? undefined
      : realm.account.communityMint.equals(proposalGoverningMint)
      ? 'community'
      : realm.account.config.councilMint?.equals(proposalGoverningMint)
      ? 'council'
      : 'not found';
  return role !== 'not found' ? role : undefined;
};

/*
  returns: undefined if loading, false if nobody can veto, 'council' if council can veto, 'community' if community can veto
*/
export const useVetoingPop = () => {
  const tokenRole = useVotingPop();
  const governance = useGovernanceByPubkeyQuery();
  const { data: realm } = useRealmParams();
  const vetoingPop = useMemo(() => {
    if (governance === undefined) return undefined;

    return tokenRole === 'community'
      ? governance?.account.config.councilVetoVoteThreshold.type !==
          VoteThresholdType.Disabled &&
        // if there is no council then there's not actually a vetoing population, in my opinion
        realm?.account.config.councilMint !== undefined
        ? 'council'
        : undefined
      : governance?.account.config.communityVetoVoteThreshold.type !==
        VoteThresholdType.Disabled
      ? 'community'
      : undefined;
  }, [governance, tokenRole, realm?.account.config.councilMint]);

  return vetoingPop;
};

export const useUserVetoTokenRecord = () => {
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data;
  const ownCouncilTokenRecord = useUserCouncilTokenOwnerRecord().data;

  const vetoingPop = useVetoingPop();
  const voterTokenRecord =
    vetoingPop === 'community' ? ownTokenRecord : ownCouncilTokenRecord;
  return voterTokenRecord;
};
