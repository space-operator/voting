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
  ProposalCardFooter,
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
import { useChatMessages } from '@/app/api/chat/hooks';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import DiscussionPanel from '../chat/DiscussionPanel';
import {
  ChevronsDownUpIcon,
  MessageCircleIcon,
  MessageSquareIcon,
} from 'lucide-react';

interface SingleProposalProps {
  proposal: ProgramAccount<Proposal>;
}

export const SingleProposal: FC<SingleProposalProps> = ({ proposal }) => {
  const { data: realm } = useRealmFromParams();

  const proposalVotes = useProposalVotes(proposal.account, realm);
  const { data: chatMessages } = useChatMessages(proposal.pubkey);
  console.log('chatMessages', chatMessages);

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

  const [isChatOpen, setIsChatOpen] = useState(false);

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
      <ProposalCardFooter>
        <Collapsible
          className='w-full'
          open={isChatOpen}
          onOpenChange={setIsChatOpen}
        >
          <CollapsibleTrigger className='flex w-full gap-2 justify-end items-center'>
            {isChatOpen ? (
              <div className='flex items-center text-xs gap-2 '>
                <ChevronsDownUpIcon />
                Close Chat
              </div>
            ) : (
              <div className='flex items-center text-xs gap-2'>
                <MessageSquareIcon />
                {chatMessages?.length} Comments
              </div>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <DiscussionPanel proposal={proposal} />
          </CollapsibleContent>
        </Collapsible>
      </ProposalCardFooter>
    </ProposalCard>
  );
};

export function isMultipleChoice(proposal: ProgramAccount<Proposal>) {
  return (
    proposal.account.voteType.type !== VoteTypeKind.SingleChoice &&
    proposal.account.accountType === GovernanceAccountType.ProposalV2
  );
}
