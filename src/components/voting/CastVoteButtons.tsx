import {
  isInCoolOffTime,
  useCanVote,
  useIsVoting,
  useVotingPop,
} from '@/app/api/voting/hooks';
import { ProgramAccount, Proposal, VoteKind } from '@solana/spl-governance';
import { useState } from 'react';
import { useSubmitVote } from './useSubmitVote';
import { useGovernanceByPubkeyQuery } from '@/app/api/governance/hooks';
import { PublicKey } from '@solana/web3.js';
import { useProposalVoteRecordQuery } from '@/app/api/voteRecord/hooks';
import { ThumbsUpIcon } from 'lucide-react';

export const CastVoteButtons = ({
  proposal,
}: {
  proposal: ProgramAccount<Proposal>;
}) => {
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [vote, setVote] = useState<'yes' | 'no' | null>(null);

  const realmInfo = useSelectedRealmInfo();
  const governance = useGovernanceByPubkeyQuery(
    new PublicKey(proposal.account.governance)
  ).data;

  const allowDiscussion = realmInfo?.allowDiscussion ?? true;
  const { submitting, submitVote } = useSubmitVote();
  const votingPop = useVotingPop(proposal.account.governingTokenMint);
  const [canVote, tooltipContent] = useCanVote({ proposal });
  const { data: ownVoteRecord } = useProposalVoteRecordQuery({
    quorum: 'electoral',
    proposal: proposal,
  });

  const isVoteCast = !!ownVoteRecord?.found;

  const isVoting = useIsVoting({ proposal, governance });

  const inCoolOffTime = isInCoolOffTime(proposal, governance);

  const handleVote = async (vote: 'yes' | 'no') => {
    setVote(vote);

    if (allowDiscussion) {
      setShowVoteModal(true);
    } else {
      await submitVote({
        vote: vote === 'yes' ? VoteKind.Approve : VoteKind.Deny,
      });
    }
  };

  return (isVoting && !isVoteCast) || (inCoolOffTime && !isVoteCast) ? (
    <div className='bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4'>
      <div className='flex flex-col items-center justify-center'>
        <h3 className='text-center'>Cast your {votingPop} vote</h3>
      </div>

      <div className='items-center justify-center flex w-full gap-5'>
        <div
          className={`w-full flex ${
            !inCoolOffTime ? 'justify-between' : 'justify-center'
          } items-center gap-5`}
        >
          {(isVoting || !inCoolOffTime) && (
            <Button
              tooltipMessage={tooltipContent}
              className='w-1/2'
              onClick={() => handleVote('yes')}
              disabled={!canVote || submitting}
              isLoading={submitting}
            >
              <div className='flex flex-row items-center justify-center'>
                <ThumbsUpIcon className='h-4 w-4 mr-2' />
                Vote Yes
              </div>
            </Button>
          )}

          <Button
            tooltipMessage={tooltipContent}
            className='w-1/2'
            onClick={() => handleVote('no')}
            disabled={!canVote || submitting}
            isLoading={submitting}
          >
            <div className='flex flex-row items-center justify-center'>
              <ThumbDownIcon className='h-4 w-4 mr-2' />
              Vote No
            </div>
          </Button>
        </div>
      </div>

      {showVoteModal && vote ? (
        <VoteCommentModal
          isOpen={showVoteModal}
          onClose={() => setShowVoteModal(false)}
          vote={vote === 'yes' ? VoteKind.Approve : VoteKind.Deny}
        />
      ) : null}
    </div>
  ) : null;
};
