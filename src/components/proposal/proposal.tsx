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
} from '../ui/proposal-card';
import { ProgressVoteButton } from '../voting-progress-button';
import { useRealmFromParams } from '@/app/api/realm/hooks';
import { Suspense, useEffect, useState } from 'react';

import { FC } from 'react';
import ProposalTimeStatus from './ProposalTimeStatus';
import ProposalStateBadge from './ProposalStateBadge';
import { MultiChoiceVotes } from '../voting/MultiChoiceVotes';
import { SingleChoiceVote } from '../voting/SingleChoiceVote';
import VotePanel from '../voting/VotePanel';
import useProposalVotes from '@/app/api/proposalVotes/hooks';
import { resolveProposalDescription } from '@/utils/proposal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeExternalLinks from 'rehype-external-links';
import { shortenAddress } from '@/utils/formatting';

interface SingleProposalProps {
  proposal: ProgramAccount<Proposal>;
}

export const SingleProposal: FC<SingleProposalProps> = ({ proposal }) => {
  const { data: realm } = useRealmFromParams();

  const proposalVotes = useProposalVotes(proposal.account, realm);

  const isMulti = isMultipleChoice(proposal);

  const [description, setDescription] = useState(
    proposal?.account.descriptionLink
  );

  useEffect(() => {
    const handleResolveDescription = async () => {
      const resolvedDescription = await resolveProposalDescription(description);
      setDescription(resolvedDescription);
    };
    if (description) {
      handleResolveDescription();
    } else {
      setDescription('');
    }
  }, [description]);

  return (
    <ProposalCard className='border-gray-400'>
      <ProposalCardHeader className='flex items-center justify-between'>
        <div className='flex-1'>
          <div className='flex flex-col'>
            <div className='text-lg font-bold'>{proposal.account.name}</div>
            <div className='text-xs text-gray-400'>
              {shortenAddress(proposal.pubkey.toString())}
            </div>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <ProposalTimeStatus proposal={proposal.account} />
          <ProposalStateBadge proposal={proposal.account} />
        </div>
      </ProposalCardHeader>
      {description && (
        <ProposalCardContent className='break-words'>
          <ReactMarkdown
            className='markdown'
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[[rehypeExternalLinks, { target: '_blank' }]]}
          >
            {description}
          </ReactMarkdown>
        </ProposalCardContent>
      )}
      <ProposalCardVote>
        {proposal.account.state === ProposalState.Voting &&
          (isMulti ? (
            <MultiChoiceVotes proposal={proposal.account} limit={3} />
          ) : (
            <SingleChoiceVote
              proposal={proposal}
              proposalVotes={proposalVotes}
            />
          ))}
        <VotePanel proposal={proposal} />
      </ProposalCardVote>
    </ProposalCard>
  );
};

export function isMultipleChoice(proposal: ProgramAccount<Proposal>) {
  return (
    proposal.account.voteType.type !== VoteTypeKind.SingleChoice &&
    proposal.account.accountType === GovernanceAccountType.ProposalV2
  );
}
