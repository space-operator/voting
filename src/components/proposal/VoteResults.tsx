import { Proposal } from '@solana/spl-governance';
import VoteResultsBar from './VoteResultsBar';

import { useRealmFromParams } from '@/app/api/realm/hooks';
import useProposalVotes from '@/app/api/proposalVotes/hooks';

type VoteResultsProps = {
  isListView?: boolean;
  proposal: Proposal;
};

// TODO make component display well when data is loading
export const VoteResults = ({ isListView, proposal }: VoteResultsProps) => {
  const { data: realm } = useRealmFromParams();
  const { yesVoteCount, noVoteCount, relativeNoVotes, relativeYesVotes } =
    useProposalVotes(proposal, realm);

  return (
    <div className='flex items-center space-x-4'>
      <div className={`${!isListView ? 'bg-bkg-1 p-3' : ''} rounded-md w-full`}>
        <div className='flex'>
          <div className='w-1/2'>
            <p>Yes Votes</p>
            <p
              className={`font-bold text-fgd-1 ${
                !isListView ? 'hero-text' : ''
              }`}
            >
              {(yesVoteCount ?? 0).toLocaleString()}
              {isListView ? (
                <span className='ml-1 text-xs font-normal text-fgd-3'>
                  {relativeYesVotes?.toFixed(1)}%
                </span>
              ) : null}
            </p>
            {!isListView ? (
              <div className='text-sm text-fgd-1'>
                {relativeYesVotes?.toFixed(1)}%
              </div>
            ) : null}
          </div>
          <div className='w-1/2 text-right'>
            <p>No Votes</p>
            <p
              className={`font-bold text-fgd-1 ${
                !isListView ? 'hero-text' : ''
              }`}
            >
              {(noVoteCount ?? 0).toLocaleString()}
              {isListView ? (
                <span className='ml-1 text-xs font-normal text-fgd-3'>
                  {relativeNoVotes?.toFixed(1)}%
                </span>
              ) : null}
            </p>
            {!isListView ? (
              <div className='text-sm text-fgd-1'>
                {relativeNoVotes?.toFixed(1)}%
              </div>
            ) : null}
          </div>
        </div>
        <VoteResultsBar
          approveVotePercentage={relativeYesVotes!}
          denyVotePercentage={relativeNoVotes!}
        />
      </div>
    </div>
  );
};
