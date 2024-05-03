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
import { useRealmParams } from '@/app/api/governance/realm';
import { Suspense } from 'react';

import { FC } from 'react';
import ProposalTimeStatus from './ProposalTimeStatus';
import ProposalStateBadge from './ProposalStateBadge';
import MultiChoiceVotes from './MultiChoiceVotes';
import VoteResults from './VoteResults';
import { ApprovalProgress, VetoProgress } from './QuorumProgress';

interface SingleProposalProps {
  proposal: ProgramAccount<Proposal>;
}

export const SingleProposal: FC<SingleProposalProps> = ({ proposal }) => {
  const { data: realm } = useRealmParams();

  const proposalVotes = useProposalVotes(proposal.account, realm);

  const isMulti =
    proposal.account.voteType.type !== VoteTypeKind.SingleChoice &&
    proposal.account.accountType === GovernanceAccountType.ProposalV2;

  return (
    <ProposalCard>
      <ProposalCardHeader>
        {proposal.account.name} - {realm.pubkey.toString()}
        <ProposalStateBadge proposal={proposal.account} />
        <ProposalTimeStatus proposal={proposal.account} />
      </ProposalCardHeader>
      <ProposalCardContent>
        {JSON.stringify(proposalVotes)}
        {proposal.account.state === ProposalState.Voting ? (
          isMulti ? (
            <div className='pb-4 px-6'>
              <MultiChoiceVotes proposal={proposal.account} limit={3} />
            </div>
          ) : (
            <div className='border-t border-fgd-4 flex flex-col lg:flex-row mt-2 p-4 gap-x-4 gap-y-3'>
              <div className='w-full lg:w-auto flex-1'>
                <VoteResults isListView proposal={proposal.account} />
              </div>
              <div className='border-r border-fgd-4 hidden lg:block' />
              <div className='w-full lg:w-auto flex-1'>
                <ApprovalProgress
                  progress={proposalVotes.yesVoteProgress}
                  votesRequired={proposalVotes.yesVotesRequired}
                />
              </div>
              {proposalVotes._programVersion !== undefined &&
              // @asktree: here is some typescript gore because typescript doesn't know that a number being > 3 means it isn't 1 or 2
              proposalVotes._programVersion !== 1 &&
              proposalVotes._programVersion !== 2 &&
              proposalVotes.veto !== undefined &&
              (proposalVotes.veto.voteProgress ?? 0) > 0 ? (
                <>
                  <div className='border-r border-fgd-4 hidden lg:block' />

                  <div className='w-full lg:w-auto flex-1'>
                    <VetoProgress
                      progress={proposalVotes.veto.voteProgress}
                      votesRequired={proposalVotes.veto.votesRequired}
                    />
                  </div>
                </>
              ) : undefined}
            </div>
          )
        ) : (
          ''
        )}
      </ProposalCardContent>
      <ProposalCardVote>
        <ProgressVoteButton />
      </ProposalCardVote>
    </ProposalCard>
  );
};
