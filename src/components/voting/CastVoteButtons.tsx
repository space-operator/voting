import {
  isInCoolOffTime,
  useCanVote,
  useIsVoting,
  useVotingPop,
} from '@/app/api/voting/hooks';
import { ProgramAccount, Proposal, VoteKind } from '@solana/spl-governance';
import { useState } from 'react';
import { useSubmitVote } from '../../app/api/voting/useSubmitVote';
import { useGovernance } from '@/app/api/governance/hooks';
import { PublicKey } from '@solana/web3.js';
import { useProposalVoteRecordQuery } from '@/app/api/voteRecord/hooks';
import { ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import VoteCommentModal from './VoteCommentModal';
import { useRealmRegistryEntryFromParams } from '@/app/api/realm/hooks';
import { useFlowEvents } from '../../app/api/_flows/hooks';

export const CastVoteButtons = ({
  proposal,
}: {
  proposal: ProgramAccount<Proposal>;
}) => {
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [vote, setVote] = useState<'yes' | 'no' | null>(null);

  const realmInfo = useRealmRegistryEntryFromParams();
  const governance = useGovernance(
    new PublicKey(proposal.account.governance)
  ).data;

  const allowDiscussion = realmInfo?.allowDiscussion ?? true;

  const { submitting, submitVote } = useSubmitVote({ proposal });
  const votingPop = useVotingPop(proposal.account.governingTokenMint);
  const [canVote, tooltipContent] = useCanVote({ proposal });
  const { data: ownVoteRecord } = useProposalVoteRecordQuery({
    quorum: 'electoral',
    proposal: proposal,
  });

  const isVoteCast = !!ownVoteRecord;

  const isVoting = useIsVoting({ proposal, governance });

  const inCoolOffTime = isInCoolOffTime(proposal.account, governance.account);

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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className='w-1/2'
                    onClick={() => handleVote('yes')}
                    disabled={!canVote || submitting}
                  >
                    <div className='flex flex-row items-center justify-center'>
                      <ThumbsUpIcon className='h-4 w-4 mr-2' />
                      Vote Yes
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{tooltipContent}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className='w-1/2'
                  onClick={() => handleVote('no')}
                  disabled={!canVote || submitting}
                >
                  <div className='flex flex-row items-center justify-center'>
                    <ThumbsDownIcon className='h-4 w-4 mr-2' />
                    Vote No
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tooltipContent}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* {showVoteModal && vote ? (
        <VoteCommentModal
          isOpen={showVoteModal}
          onClose={() => setShowVoteModal(false)}
          vote={vote === 'yes' ? VoteKind.Approve : VoteKind.Deny}
          proposal={proposal}
        />
      ) : null} */}
    </div>
  ) : null;
};
