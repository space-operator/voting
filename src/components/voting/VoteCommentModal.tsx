import React, { FunctionComponent, useState } from 'react';
import { ProgramAccount, Proposal, VoteKind } from '@solana/spl-governance';
import { useSubmitVote } from '../../app/api/voting/useSubmitVote';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { BanIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';
import { Loading } from '../Loading';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { FlowRunningState } from '@/app/api/_flows/hooks';

interface VoteCommentModalProps {
  vote: VoteKind;
  isMulti?: number[];
  proposal: ProgramAccount<Proposal>;
  disabled: boolean;
}

const VOTE_STRINGS = {
  [VoteKind.Approve]: 'Yes',
  [VoteKind.Deny]: 'No',
  [VoteKind.Veto]: 'Veto',
  [VoteKind.Abstain]: 'Abstain',
};

const VoteCommentModal: FunctionComponent<VoteCommentModalProps> = ({
  vote,
  isMulti,
  proposal,
  disabled,
}) => {
  const [comment, setComment] = useState('');
  const { submitting, submitVote, flowRunningState, errors } = useSubmitVote({
    proposal,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const voteString = VOTE_STRINGS[vote];

  const handleSubmit = async () => {
    await submitVote({
      vote: vote,
      comment,
      voteWeights: isMulti,
    });
    if (flowRunningState.state === FlowRunningState.Success) {
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>Vote</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Vote</DialogTitle>
          <DialogDescription>
            Add an optional on-chain comment to the public discussion
          </DialogDescription>
        </DialogHeader>
        <Input
          className='mt-1.5'
          value={comment}
          type='text'
          onChange={(e) => setComment(e.target.value)}
          placeholder='Leave comment'
          // placeholder={`Let the DAO know why you vote '${voteString}'`}
        />
        {errors.length > 0 && (
          <div className='text-red-500'>
            {errors.map((error) => (
              <div key={error.data.flow_run_id}>
                Flow failed: {error.data.error}
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <div className='flex items-center justify-center mt-8'>
            <Button
              className='w-44 flex items-center justify-center'
              type='submit'
              onClick={handleSubmit}
              disabled={submitting}
            >
              <div className='flex items-center'>
                {!submitting && isMulti ? (
                  ''
                ) : vote === VoteKind.Approve ? (
                  <ThumbsUpIcon className='h-4 w-4 fill-black mr-2' />
                ) : vote === VoteKind.Deny ? (
                  <ThumbsDownIcon className='h-4 w-4 fill-black mr-2' />
                ) : (
                  <BanIcon className='h-4 w-4 fill-black mr-2' />
                )}
                {submitting ? (
                  <Loading />
                ) : (
                  <span>Vote {isMulti ? '' : voteString}</span>
                )}
              </div>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(VoteCommentModal);
