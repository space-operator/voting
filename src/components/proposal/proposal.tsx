'use client';

import {
  GovernanceAccountType,
  ProgramAccount,
  Proposal,
  ProposalState,
  VoteTypeKind,
} from '@solana/spl-governance';
import {
  ProposalCard,
  ProposalCardHeader,
  ProposalCardContent,
  ProposalCardVote,
  ProposalCardFooter,
} from '../ui/proposal-card';
import { useRealmFromParams } from '@/app/api/realm/hooks';
import { useEffect, useRef, useState } from 'react';

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
import { ChevronsDownUpIcon, MessageSquareIcon } from 'lucide-react';
import { ProfileImage, ProfilePopup } from '../CivicProfile';
import { useTokenOwnerRecordsForRealm } from '@/app/api/tokenOwnerRecord/hooks';
import { useProposal } from '@/app/api/proposals/hooks';

interface SingleProposalProps {
  proposal: ProgramAccount<Proposal>;
}

export const SingleProposal: FC<SingleProposalProps> = ({
  proposal: proposalProp,
}) => {
  const [proposal, setProposal] =
    useState<ProgramAccount<Proposal>>(proposalProp);

  const { data: refreshedProposal } = useProposal(proposal.pubkey);

  useEffect(() => {
    if (refreshedProposal && refreshedProposal !== proposal) {
      setProposal(refreshedProposal);
    }
  }, [proposal, refreshedProposal]);

  const { data: realm } = useRealmFromParams();

  const proposalVotes = useProposalVotes(proposal.account, realm);

  const { data: chatMessages } = useChatMessages(proposal.pubkey);

  const isMulti = isMultipleChoice(proposal);

  const [description, setDescription] = useState('');

  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [hasOverflowed, setHasOverflowed] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchDescription = async () => {
      if (proposal.account.descriptionLink) {
        try {
          const resolvedDescription = await resolveProposalDescription(
            proposal.account.descriptionLink,
            controller.signal
          );
          setDescription(resolvedDescription);
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Failed to fetch description:', error);
          }
        }
      } else {
        setDescription('');
      }
    };

    fetchDescription();

    return () => {
      controller.abort();
    };
  }, [proposal.account.descriptionLink]);

  useEffect(() => {
    if (descriptionRef.current) {
      const isContentOverflowing =
        descriptionRef.current.scrollHeight >
        descriptionRef.current.clientHeight;
      if (isContentOverflowing) setHasOverflowed(true);

      setShowToggle(isContentOverflowing);
    }
  }, [description, isExpanded]);

  const [isChatOpen, setIsChatOpen] = useState(false);

  const proposedBy = useTokenOwnerRecordsForRealm().data?.find((x) =>
    x.pubkey.equals(proposal.account.tokenOwnerRecord)
  )?.account.governingTokenOwner;

  return (
    <ProposalCard className='border-gray-400'>
      <ProposalCardHeader className='flex justify-between'>
        <div className='flex-1'>
          <div className='flex flex-col'>
            <div className='flex gap-2'>
              <div className='bg-secondary flex flex-shrink-0 items-center justify-center h-10 rounded-full w-10'>
                {proposedBy && (
                  <ProfilePopup publicKey={proposedBy} expanded={true}>
                    <ProfileImage
                      publicKey={proposedBy}
                      className='h-8 text-fgd-3 w-8'
                    />
                  </ProfilePopup>
                )}
              </div>
              <div className='flex flex-col items-start gap-2'>
                <div className='text-lg font-bold'>{proposal.account.name}</div>
                <div className='text-xs text-gray-400'>
                  {shortenAddress(proposal.pubkey.toString())}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex gap-4 items-center'>
          <ProposalTimeStatus proposal={proposal.account} />
          <ProposalStateBadge proposal={proposal.account} />
        </div>
      </ProposalCardHeader>
      {description && (
        <ProposalCardContent className='break-words'>
          <div
            ref={descriptionRef}
            className={isExpanded ? '' : 'line-clamp-3'}
          >
            <ReactMarkdown
              className='markdown'
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[[rehypeExternalLinks, { target: '_blank' }]]}
            >
              {description}
            </ReactMarkdown>
          </div>
          {(showToggle || hasOverflowed) && (
            <div className='flex justify-end'>
              <button
                className='mt-2 text-primary/50 hover:text-primary/75'
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show Less' : 'Show More'}
              </button>
            </div>
          )}
        </ProposalCardContent>
      )}
      <ProposalCardVote>
        {proposal.account.state === ProposalState.Voting &&
          (isMulti ? (
            <MultiChoiceVotes proposal={proposal.account} />
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
