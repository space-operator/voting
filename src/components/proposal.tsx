'use client';

import { ProgramAccount, Proposal, Realm } from '@solana/spl-governance';
import {
  ProposalCard,
  ProposalCardHeader,
  ProposalCardContent,
  ProposalCardVote,
} from './ui/proposal-card';
import { ProgressVoteButton } from './voting-progress-button';
import useProposalVotes from '@/app/api/voting/useProposalVotes';
import { useRealmParams } from '@/app/api/governance/realm';
import { Suspense } from 'react';

import { FC } from 'react';

interface SingleProposalProps {
  proposal: ProgramAccount<Proposal>;
}

export const SingleProposal: FC<SingleProposalProps> = ({ proposal }) => {
  const { data: realm } = useRealmParams();

  const proposalVotes = useProposalVotes(proposal.account, realm);

  return (
    <ProposalCard>
      <ProposalCardHeader>
        {proposal.account.name} - {realm.pubkey.toString()}
      </ProposalCardHeader>
      <ProposalCardContent>{JSON.stringify(proposalVotes)}</ProposalCardContent>
      <ProposalCardVote>
        <ProgressVoteButton />
      </ProposalCardVote>
    </ProposalCard>
  );
};
