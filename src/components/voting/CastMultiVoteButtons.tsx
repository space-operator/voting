import { ProgramAccount, Proposal, VoteKind } from '@solana/spl-governance';
import { useState } from 'react';
import { useCanVote, useIsVoting, useVotingPop } from '@/app/api/voting/hooks';
import { useGovernance } from '@/app/api/governance/hooks';
import { PublicKey } from '@solana/web3.js';
import { useSubmitVote } from '../../app/api/voting/useSubmitVote';
import { useProposalVoteRecordQuery } from '@/app/api/voteRecord/hooks';
import { CheckCircleIcon } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import VoteCommentModal from './VoteCommentModal';
import { useRealmRegistryEntryFromParams } from '@/app/api/realm/hooks';

export const CastMultiVoteButtons = ({
  proposal,
}: {
  proposal: ProgramAccount<Proposal>;
}) => {
  const [vote, setVote] = useState<'yes' | 'no' | null>(null);
  const realmInfo = useRealmRegistryEntryFromParams();
  // TODO changed default to false for testing
  const allowDiscussion = realmInfo?.allowDiscussion ?? false;
  console.log('allowDiscussion', allowDiscussion);

  const { submitting, submitVote, logs, flowComplete, errors, flowSuccess } =
    useSubmitVote({
      proposal,
    });
  const { data: governance } = useGovernance(
    new PublicKey(proposal.account.governance)
  );
  const votingPop = useVotingPop(proposal.account.governingTokenMint);
  const [canVote, tooltipContent] = useCanVote({ proposal });
  console.log('canVote', canVote);
  const { data: ownVoteRecord } = useProposalVoteRecordQuery({
    quorum: 'electoral',
    proposal,
  });
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [optionStatus, setOptionStatus] = useState<boolean[]>(
    new Array(proposal.account.options.length).fill(false)
  );
  const isVoteCast = !!ownVoteRecord;
  const isVoting = useIsVoting({ proposal, governance });

  const nota = '$$_NOTA_$$';
  const last = proposal.account.options.length - 1;

  const handleVote = async (vote: 'yes' | 'no') => {
    setVote(vote);

    await submitVote({
      vote: vote === 'yes' ? VoteKind.Approve : VoteKind.Deny,
      voteWeights: selectedOptions,
    });
  };

  const handleOption = (index: number) => {
    let options = [...selectedOptions];
    let status = [...optionStatus];
    const isNota = proposal.account.options[last].label === nota;

    const selected = status[index];

    if (selected) {
      options = options.filter((option) => option !== index);
      status[index] = false;
    } else {
      if (isNota) {
        if (index === last) {
          // if nota is clicked, unselect all other options
          status = status.map(() => false);
          status[index] = true;
          options = [index];
        } else {
          // remove nota from the selected if any other option is clicked
          status[last] = false;
          options = options.filter((option) => option !== last);
          if (!options.includes(index)) {
            options.push(index);
          }
          status[index] = true;
        }
      } else {
        if (!options.includes(index)) {
          options.push(index);
        }
        status[index] = true;
      }
    }

    setSelectedOptions(options);
    setOptionStatus(status);
  };

  console.log('logs', logs);
  console.log('flowComplete', flowComplete);
  console.log('errors', errors);
  return isVoting && !isVoteCast ? (
    <div className='bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4'>
      <div className='flex flex-col items-center justify-center'>
        <h3 className='text-center'>Cast your {votingPop} vote</h3>
      </div>

      <div className='items-center justify-center flex w-full gap-5'>
        <div
          className={`w-full flex flex-col justify-between items-center gap-3`}
        >
          {proposal.account.options.map((option, index) => {
            return (
              <div className='w-full' key={index}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className={`
                    ${
                      optionStatus[index]
                        ? 'bg-primary text-bkg-2 hover:text-bkg-2 hover:border-primary'
                        : ''
                    }
                    rounded-lg w-full
                  `}
                        onClick={() => handleOption(index)}
                        disabled={!canVote || submitting}
                      >
                        {optionStatus[index] && (
                          <CheckCircleIcon className='inline w-4 mr-1' />
                        )}
                        {option.label === nota && index === last
                          ? 'None of the Above'
                          : option.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{tooltipContent}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          })}
          <div className='text-xs'>
            Note: You can select one or more options
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {allowDiscussion ? (
                  <Button
                    className='w-full'
                    onClick={() => handleVote('yes')}
                    disabled={
                      !canVote ||
                      submitting ||
                      !selectedOptions.length ||
                      !flowComplete
                    }
                  >
                    <div className='flex flex-row items-center justify-center'>
                      Vote
                    </div>
                  </Button>
                ) : (
                  <VoteCommentModal
                    vote={VoteKind.Approve}
                    isMulti={selectedOptions}
                    proposal={proposal}
                    disabled={!canVote || submitting || !selectedOptions.length}
                  />
                )}
              </TooltipTrigger>
              <TooltipContent>
                {tooltipContent === '' && !selectedOptions.length
                  ? `Select at least one option to vote`
                  : tooltipContent}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  ) : null;
};
