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

export const SingleProposal = (
  proposal: ProgramAccount<Proposal>
  // realm: ProgramAccount<Realm>
) => {
  const { data: realm } = useRealmParams();
  console.log('proposal', proposal, realm);

  const proposalVotes = useProposalVotes(proposal.account, realm);

  return (
    // <Suspense fallback={<div>Loading...</div>}>
      <ProposalCard key={proposal.pubkey.toString()}>
        <ProposalCardHeader>
          {proposal.account.name} - {realm.pubkey.toString()}
        </ProposalCardHeader>
        <ProposalCardContent>
          {JSON.stringify(proposalVotes)}
        </ProposalCardContent>
        <ProposalCardVote>
          <ProgressVoteButton />
        </ProposalCardVote>
      </ProposalCard>
    // </Suspense>
  );
};
