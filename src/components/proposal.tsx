'use client';

import {
  GovernanceAccountType,
  ProgramAccount,
  Proposal,
  ProposalState,
  Realm,
  VoteTypeKind,
} from '@solana/spl-governance';
import {
  ProposalCard,
  ProposalCardHeader,
  ProposalCardContent,
  ProposalCardVote,
} from './ui/proposal-card';
import { ProgressVoteButton } from './voting-progress-button';
import useProposalVotes from '@/app/api/voting/useProposalVotes';
import { useRealmParams } from '@/app/api/realm/hooks';
import { Suspense } from 'react';

import { FC } from 'react';
import ProposalTimeStatus from './ProposalTimeStatus';
import ProposalStateBadge from './ProposalStateBadge';
import { MultiChoiceVotes } from './MultiChoiceVotes';
import { SingleChoiceVote } from './SingleChoiceVote';
import VotePanel from './voting/VotePanel';

interface SingleProposalProps {
  proposal: ProgramAccount<Proposal>;
}

export const SingleProposal: FC<SingleProposalProps> = ({ proposal }) => {
  const { data: realm } = useRealmParams();

  const proposalVotes = useProposalVotes(proposal.account, realm);

  const isMulti = isMultipleChoice(proposal);

  return (
    <ProposalCard>
      <ProposalCardHeader>
        {proposal.account.name} - {proposal.pubkey.toString()}
        <ProposalStateBadge proposal={proposal.account} />
        <ProposalTimeStatus proposal={proposal.account} />
      </ProposalCardHeader>
      <ProposalCardContent>{JSON.stringify(proposalVotes)}</ProposalCardContent>
      <ProposalCardVote>
        {proposal.account.state === ProposalState.Voting &&
          (isMulti ? (
            <MultiChoiceVotes proposal={proposal.account} limit={3} />
          ) : (
            <SingleChoiceVote
              proposal={proposal}
              proposalVotes={proposalVotes}
            />
          ))}
        <VotePanel proposal={proposal} />
      </ProposalCardVote>
    </ProposalCard>
  );
};

export function isMultipleChoice(proposal: ProgramAccount<Proposal>) {
  return (
    proposal.account.voteType.type !== VoteTypeKind.SingleChoice &&
    proposal.account.accountType === GovernanceAccountType.ProposalV2
  );
}
