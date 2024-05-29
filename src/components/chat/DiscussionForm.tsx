'use client';

import {
  useRealmFromParams,
  useRealmRegistryEntryFromParams,
} from '@/app/api/realm/hooks';
import {
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from '@/app/api/tokenOwnerRecord/hooks';
import { getProgramVersionForRealm } from '@/types/realm';
import { ProgramAccount, Proposal, RpcContext } from '@solana/spl-governance';
import { ChatMessageBody, ChatMessageBodyType } from '@solana/spl-governance';
import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Loading } from '../Loading';
import { useVotingPop } from '@/app/api/voting/hooks';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useRealmVoterWeightPlugins } from '@/app/api/voterWeightPlugins/hooks';

const DiscussionForm = ({
  proposal,
}: {
  proposal: ProgramAccount<Proposal>;
}) => {
  const [comment, setComment] = useState('');
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data;
  const ownCouncilTokenRecord = useUserCouncilTokenOwnerRecord().data;
  const realm = useRealmFromParams();

  const {  } = useRealmVoterWeightPlugins();

  const realmInfo = useRealmRegistryEntryFromParams();
  // const votingClients = useVotingClients();
  const [submitting, setSubmitting] = useState(false);

  const wallet = useWallet()?.wallet?.adapter;
  const connected = !!wallet?.connected;
  const { connection } = useConnection();

  const tokenRole = useVotingPop(proposal.account.governingTokenMint);
  const commenterVoterTokenRecord =
    tokenRole === 'community' ? ownTokenRecord : ownCouncilTokenRecord;

  const votingClient = votingClients(tokenRole ?? 'community'); // default to community if no role is provided

  const submitComment = async () => {
    setSubmitting(true);
    if (
      !realm ||
      !proposal ||
      !commenterVoterTokenRecord ||
      !wallet ||
      !realmInfo
    )
      throw new Error();

    const rpcContext = new RpcContext(
      proposal.owner,
      getProgramVersionForRealm(realmInfo),
      wallet,
      connection.current,
      connection.endpoint
    );

    const msg = new ChatMessageBody({
      type: ChatMessageBodyType.Text,
      value: comment,
    });

    try {
      await postChatMessage(
        rpcContext,
        realm,
        proposal,
        commenterVoterTokenRecord,
        msg,
        undefined,
        votingClient
      );

      setComment('');
    } catch (ex) {
      console.error("Can't post chat message", ex);
      //TODO: How do we present transaction errors to users? Just the notification?
    } finally {
      setSubmitting(false);
    }
  };

  const postEnabled =
    proposal && connected && ownVoterWeight?.hasAnyWeight() && comment;

  const tooltipContent = !connected
    ? 'Connect your wallet to send a comment'
    : !ownVoterWeight?.hasAnyWeight()
    ? 'You need to have deposited some tokens to submit your comment.'
    : !comment
    ? 'Write a comment to submit'
    : !commenterVoterTokenRecord
    ? 'You need to have voting power for this community to submit your comment.'
    : '';

  return (
    <>
      <div className='flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0'>
        <Input
          value={comment}
          type='text'
          onChange={(e) => setComment(e.target.value)}
          placeholder='Thoughts?...'
        />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                className='flex-shrink-0'
                onClick={() => submitComment()}
                disabled={
                  !postEnabled || !comment || !commenterVoterTokenRecord
                }
              >
                {submitting ? <Loading /> : <span>Send It</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{tooltipContent}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
};

export default DiscussionForm;
