import { Proposal, ProposalState } from '@solana/spl-governance';

import { BN } from '@coral-xyz/anchor';

import BigNumber from 'bignumber.js';
import { useRealmFromParams } from '@/app/api/realm/hooks';
import { fmtBnMintDecimals } from '@/utils/units';
import { CheckCircleIcon, ChevronRight } from 'lucide-react';
import { useMintInfo } from '@/app/api/token/hooks';

export const MultiChoiceVotes = ({
  proposal,
  limit,
}: {
  proposal: Proposal;
  limit: number;
}) => {
  const { data: realm } = useRealmFromParams();
  const { data: mint } = useMintInfo(realm?.account.communityMint);
  const { data: councilMint } = useMintInfo(realm?.account.config.councilMint);

  const proposalMint =
    proposal.governingTokenMint.toBase58() ===
    realm?.account.communityMint.toBase58()
      ? mint
      : councilMint;

  const totalVoteWeight = proposal.options.reduce(
    (a, b) => new BN(a).add(new BN(b.voteWeight, 'hex')),
    new BN(0)
  );

  const isComplete = proposal.state === ProposalState.Completed;

  let highestWeight = new BN(0);

  for (const option of proposal.options) {
    highestWeight = new BN(option.voteWeight, 'hex').gt(highestWeight)
      ? option.voteWeight
      : highestWeight;
  }

  const nota = '$$_NOTA_$$';
  const last = proposal.options.length - 1;

  return (
    <div className='pb-4 px-6 border rounded-md'>
      {proposal.options.slice(0, limit).map((option, index) => {
        const optionVotes = option.voteWeight;
        const optionWeightPct = totalVoteWeight.isZero() // dont divide by zero
          ? new BN(0)
          : new BN(optionVotes, 'hex').muln(1000).div(totalVoteWeight);

        return (
          <div className='border-b border p-5' key={index}>
            <div className='flex flex-row justify-between gap-2'>
              <div className='flex flex-row justify-start'>
                <div>
                  {option.label === nota && index === last
                    ? 'None of the Above'
                    : option.label}
                </div>
                {proposalMint === undefined ? null : (
                  <div>
                    {new BigNumber(optionVotes.toString())
                      .shiftedBy(-proposalMint.decimals)
                      .toFormat(0)}{' '}
                    votes
                  </div>
                )}
              </div>
              <div className='text-sm'>
                {isComplete &&
                  !highestWeight.eq(new BN(0)) &&
                  option.voteWeight.eq(highestWeight) && (
                    <CheckCircleIcon className='inline w-4 mr-1' />
                  )}
                {fmtBnMintDecimals(optionWeightPct, 1)}%
              </div>
            </div>
            <div className='bg-bkg-4 h-1 flex flex-grow mt-1.5 rounded w-full'>
              <div
                style={{
                  width: `${optionWeightPct.divn(10)}%`,
                }}
                className={`bg-primary-light flex rounded-l ${
                  0 < 0.01 && 'rounded'
                }`}
              ></div>
            </div>
          </div>
        );
      })}
      {limit < proposal.options.length && (
        <div className='border border-fgd-4 rounded-lg p-4'>
          <div className='flex flex-row gap-2'>
            <div className=''>
              {proposal.options.length - limit} more choice
              {proposal.options.length - limit !== 1 && 's'}{' '}
            </div>
            <ChevronRight />
          </div>
        </div>
      )}
    </div>
  );
};
