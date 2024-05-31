import {
  Governance,
  GovernanceAccountType,
  ProgramAccount,
  Proposal,
  ProposalState,
  VoteType,
} from '@solana/spl-governance';

import { CastVoteButtons } from './CastVoteButtons';
import { CastMultiVoteButtons } from './CastMultiVoteButtons';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProposalVoteRecordQuery } from '@/app/api/voteRecord/hooks';
import { useIsVoting } from '@/app/api/voting/hooks';
import { BanIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { YouVoted } from './YouVoted';
import VetoButtons from './VetoButtons';
import { useGovernance } from '@/app/api/governance/hooks';

const VotePanel = ({ proposal }: { proposal: ProgramAccount<Proposal> }) => {
  const { wallet } = useWallet();
  const connected = !!wallet?.adapter?.connected;

  const { data: ownVoteRecord } = useProposalVoteRecordQuery({
    quorum: 'electoral',
    proposal,
  });

  const { data: governance } = useGovernance(proposal.account.governance);

  const isVoteCast = ownVoteRecord !== undefined;
  const isVoting = useIsVoting({ proposal, governance });

  const didNotVote =
    connected &&
    !!proposal &&
    !isVoting &&
    proposal.account.state !== ProposalState.Cancelled &&
    proposal.account.state !== ProposalState.Draft &&
    !isVoteCast;

  const isMulti =
    proposal?.account.voteType !== VoteType.SINGLE_CHOICE &&
    proposal?.account.accountType === GovernanceAccountType.ProposalV2;

  return (
    <>
      {didNotVote && (
        <div className='bg-bkg-2 p-4 md:p-6 rounded-lg flex flex-col items-center justify-center'>
          <h3 className='text-center mb-0'>
            {isMulti
              ? 'You did not vote on this proposal'
              : 'You did not vote electorally'}
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <BanIcon className='h-[34px] w-[34px] fill-white/50 mt-2' />
              </TooltipTrigger>
              <TooltipContent>You did not vote on this proposal</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      {/* START: Note that these components control for themselves whether they are displayed and may not be visible */}
      <YouVoted quorum='electoral' proposal={proposal} />
      {proposal && isMulti ? (
        <CastMultiVoteButtons proposal={proposal} />
      ) : (
        <CastVoteButtons proposal={proposal} />
      )}
      <YouVoted quorum='veto' proposal={proposal} />
      {!isMulti && <VetoButtons proposal={proposal} />}
      {/* END */}
    </>
  );
};

export default VotePanel;
