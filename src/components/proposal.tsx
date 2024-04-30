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

export const SingleProposal = (
  proposal: ProgramAccount<Proposal>,
  realm: ProgramAccount<Realm>
) => {
  console.log('proposal', proposal, realm);
  // const { data: realm } = useRealmParams();

  const proposalVotes = useProposalVotes(proposal.account, realm);
  console.log(proposalVotes, 'proposalVotes');

  return (
    <ProposalCard key={proposal.pubkey.toString()}>
      <ProposalCardHeader>
        {proposal.account.name} - {realm.pubkey.toString()}
      </ProposalCardHeader>
      {/* <ProposalCardContent>{JSON.stringify(proposalVotes)}</ProposalCardContent> */}
      <ProposalCardVote>
        <ProgressVoteButton />
      </ProposalCardVote>
    </ProposalCard>
  );
};
