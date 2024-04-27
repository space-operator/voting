'use client';

import { ProgramAccount, Proposal } from '@solana/spl-governance';
import {
  ProposalCard,
  ProposalCardHeader,
  ProposalCardContent,
  ProposalCardVote,
} from './ui/proposal-card';
import { ProgressVoteButton } from './voting-progress-button';
import useProposalVotes from '@/app/api/voting/useProposalVotes';
import { useRealmParams } from '@/app/api/governance/realm';

export const SingleProposal = (proposal: ProgramAccount<Proposal>) => {
  const { data: realm } = useRealmParams();

  const proposalVotes = useProposalVotes(proposal.account, realm);

  return (
    <ProposalCard key={proposal.pubkey.toString()}>
      <ProposalCardHeader>{proposal.account.name}</ProposalCardHeader>
      <ProposalCardContent>{JSON.stringify(proposalVotes)}</ProposalCardContent>
      <ProposalCardVote>
        <ProgressVoteButton />
      </ProposalCardVote>
    </ProposalCard>
  );
};
