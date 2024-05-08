import { ProgramAccount, Proposal, VoteKind } from '@solana/spl-governance';
import { useState } from 'react';
import { useCanVote, useIsVoting, useVotingPop } from '@/app/api/voting/hooks';
import { useGovernanceByPubkeyQuery } from '@/app/api/governance/hooks';
import { PublicKey } from '@solana/web3.js';
import { useSubmitVote } from './useSubmitVote';
import { useProposalVoteRecordQuery } from '@/app/api/voteRecord/hooks';
import { CheckCircleIcon } from 'lucide-react';

export const CastMultiVoteButtons = ({
  proposal,
}: {
  proposal: ProgramAccount<Proposal>;
}) => {
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [vote, setVote] = useState<'yes' | 'no' | null>(null);
  const realmInfo = useSelectedRealmInfo();
  const allowDiscussion = realmInfo?.allowDiscussion ?? true;
  const { submitting, submitVote } = useSubmitVote();
  const { data: governance } = useGovernanceByPubkeyQuery(
    new PublicKey(proposal.account.governance)
  );
  const votingPop = useVotingPop(proposal.account.governingTokenMint);
  const [canVote, tooltipContent] = useCanVote({ proposal });
  const { data: ownVoteRecord } = useProposalVoteRecordQuery({
    quorum: 'electoral',
    proposal,
  });
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [optionStatus, setOptionStatus] = useState<boolean[]>(
    new Array(proposal.account.options.length).fill(false)
  );
  const isVoteCast = !!ownVoteRecord?.found;
  const isVoting = useIsVoting({ proposal, governance });

  const nota = '$$_NOTA_$$';
  const last = proposal.account.options.length - 1;

  const handleVote = async (vote: 'yes' | 'no') => {
    setVote(vote);

    if (allowDiscussion) {
      setShowVoteModal(true);
    } else {
      await submitVote({
        vote: vote === 'yes' ? VoteKind.Approve : VoteKind.Deny,
        voteWeights: selectedOptions,
      });
    }
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
                <SecondaryButton
                  tooltipMessage={tooltipContent}
                  className={`
                    ${
                      optionStatus[index]
                        ? 'bg-primary-light text-bkg-2 hover:text-bkg-2 hover:border-primary-light'
                        : 'bg-transparent'
                    }
                    rounded-lg w-full
                  `}
                  onClick={() => handleOption(index)}
                  disabled={!canVote || submitting}
                  isLoading={submitting}
                >
                  {optionStatus[index] && (
                    <CheckCircleIcon className='inline w-4 mr-1' />
                  )}
                  {option.label === nota && index === last
                    ? 'None of the Above'
                    : option.label}
                </SecondaryButton>
              </div>
            );
          })}
          <div className='text-xs'>
            Note: You can select one or more options
          </div>
          <Button
            tooltipMessage={
              tooltipContent === '' && !selectedOptions.length
                ? `Select at least one option to vote`
                : tooltipContent
            }
            className='w-full'
            onClick={() => handleVote('yes')}
            disabled={!canVote || submitting || !selectedOptions.length}
            isLoading={submitting}
          >
            <div className='flex flex-row items-center justify-center'>
              Vote
            </div>
          </Button>
        </div>
      </div>

      {showVoteModal && vote ? (
        <VoteCommentModal
          isOpen={showVoteModal}
          onClose={() => setShowVoteModal(false)}
          vote={VoteKind.Approve}
          isMulti={selectedOptions}
        />
      ) : null}
    </div>
  ) : null;
};
