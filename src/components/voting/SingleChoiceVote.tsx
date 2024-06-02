'use client';

import { ProgramAccount, Proposal } from '@solana/spl-governance';
import { VoteResults } from '../proposal/VoteResults';
import { ApprovalProgress, VetoProgress } from '../proposal/QuorumProgress';
import { ProposalVotesResult } from '@/app/api/proposalVotes/hooks';

export const SingleChoiceVote = ({
  proposal,
  proposalVotes,
}: {
  proposal: ProgramAccount<Proposal>;
  proposalVotes: ProposalVotesResult;
}) => {
  return (
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
          <div className='border-r border hidden lg:block' />

          <div className='w-full lg:w-auto flex-1'>
            <VetoProgress
              progress={proposalVotes.veto.voteProgress}
              votesRequired={proposalVotes.veto.votesRequired}
            />
          </div>
        </>
      ) : undefined}
    </div>
  );
};
