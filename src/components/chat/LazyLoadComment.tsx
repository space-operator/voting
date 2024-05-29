import React from 'react';
import { useInView } from 'react-intersection-observer';
import Comment from './Comment';
import { ChatMessage, ProgramAccount, Proposal } from '@solana/spl-governance';

const LazyLoadComment = ({
  chatMessage,
  proposal,
}: {
  chatMessage: ChatMessage;
  proposal: ProgramAccount<Proposal>;
}) => {
  const { ref, inView } = useInView({
    /* Optional options */
    triggerOnce: true,
  });

  return (
    <div ref={ref} className='min-h-[40px]'>
      <div>
        {inView && <Comment chatMessage={chatMessage} proposal={proposal} />}
      </div>
    </div>
  );
};

export default LazyLoadComment;
