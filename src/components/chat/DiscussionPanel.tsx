import { useMemo } from 'react';
import DiscussionForm from './DiscussionForm';

import LazyLoadComment from './LazyLoadComment';
import { useChatMessages } from '@/app/api/chat/hooks';
import { PublicKey } from '@solana/web3.js';
import { ProgramAccount, Proposal } from '@solana/spl-governance';

const DiscussionPanel = ({
  proposal,
}: {
  proposal: ProgramAccount<Proposal>;
}) => {
  const { data: chatMessages } = useChatMessages(proposal.pubkey);

  const sortedMessages = useMemo(
    () =>
      chatMessages?.sort(
        (m1, m2) =>
          m2.account.postedAt.toNumber() - m1.account.postedAt.toNumber()
      ),
    [chatMessages]
  );

  return (
    <div className='border border-secondary p-4 md:p-6 rounded-lg'>
      <h2 className='mb-4'>
        Discussion{' '}
        {chatMessages !== undefined && (
          <span className='text-base text-fgd-3'>({chatMessages.length})</span>
        )}
      </h2>
      <div className='pb-4'>{/* <DiscussionForm proposal={proposal} /> */}</div>

      {sortedMessages?.map((cm) => (
        <LazyLoadComment
          key={cm.pubkey.toBase58()}
          chatMessage={cm.account}
          proposal={proposal}
        />
      ))}
    </div>
  );
};

export default DiscussionPanel;
