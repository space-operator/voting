import {
  GovernanceAccountType,
  ProgramAccount,
  Proposal,
  VoteKind,
  VoteType,
  withFinalizeVote,
} from '@solana/spl-governance';
import { TransactionInstruction } from '@solana/web3.js';
import { useState } from 'react';

import { ProposalState } from '@solana/spl-governance';
import { RpcContext } from '@solana/spl-governance';
import { useRealmParams } from '@/app/api/governance/realm';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  isInCoolOffTime,
  useIsVoting,
  useUserVetoTokenRecord,
  useVoterTokenRecord,
} from '@/app/api/voting/hooks';
import {
  useHasVoteTimeExpired,
  useProposalVoteRecordQuery,
} from '@/app/api/voteRecord/hooks';
import { useMaxVoteRecord } from '@/app/api/voting/useMaxVoteRecord';
import { useGovernanceByPubkeyQuery } from '@/app/api/governance/hooks';
import { Button } from '../ui/button';
import { useSelectedRealmRegistryEntry } from '@/app/api/realm/hooks';
import { useVotingClientForGoverningTokenMint } from '@/app/api/votingClient/hooks';
import assertUnreachable from '@/utils/errors';
import {
  BanIcon,
  CheckCircleIcon,
  MinusCircleIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from 'lucide-react';

export const YouVoted = ({
  quorum,
  proposal,
}: {
  quorum: 'electoral' | 'veto';
  proposal: ProgramAccount<Proposal>;
}) => {
  const { data: realm } = useRealmParams();
  const realmInfo = useSelectedRealmRegistryEntry();
  const wallet = useWallet().wallet.adapter;
  const { connection } = useConnection();
  const connected = !!wallet?.connected;

  const governance = useGovernanceByPubkeyQuery(
    proposal.account.governance
  ).data;
  const maxVoterWeight = useMaxVoteRecord()?.pubkey || undefined;
  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!);
  const isVoting = useIsVoting({ proposal, governance });
  const inCoolOffTime = isInCoolOffTime(proposal.account, governance.account);
  const [isLoading, setIsLoading] = useState(false);

  const { data: proposalVoteRecord } = useProposalVoteRecordQuery({
    quorum,
    proposal,
  });
  const ownVoteRecord = proposalVoteRecord;
  const electoralVoterTokenRecord = useVoterTokenRecord({
    proposal: proposal.account,
  });
  const vetoVotertokenRecord = useUserVetoTokenRecord();
  const voterTokenRecord =
    quorum === 'electoral' ? electoralVoterTokenRecord : vetoVotertokenRecord;
  const votingClient = useVotingClientForGoverningTokenMint(
    proposal?.account.governingTokenMint
  );

  const isWithdrawEnabled =
    connected &&
    ownVoteRecord &&
    !ownVoteRecord?.account.isRelinquished &&
    proposal &&
    (proposal!.account.state === ProposalState.Voting ||
      proposal!.account.state === ProposalState.Completed ||
      proposal!.account.state === ProposalState.Cancelled ||
      proposal!.account.state === ProposalState.Succeeded ||
      proposal!.account.state === ProposalState.Executing ||
      proposal!.account.state === ProposalState.Defeated);

  const withdrawTooltipContent = !connected
    ? 'You need to connect your wallet'
    : !isWithdrawEnabled
    ? !ownVoteRecord?.account.isRelinquished
      ? 'Owner vote record is not relinquished'
      : 'The proposal is not in a valid state to execute this action.'
    : '';

  // TODO add withdraw vote
  const submitRelinquishVote = async () => {
    // if (
    //   realm === undefined ||
    //   proposal === undefined ||
    //   voterTokenRecord === undefined ||
    //   ownVoteRecord === undefined ||
    //   ownVoteRecord === null
    // )
    //   return;
    // const rpcContext = new RpcContext(
    //   proposal!.owner,
    //   getProgramVersionForRealm(realmInfo!),
    //   wallet!,
    //   connection.current,
    //   connection.endpoint
    // );
    // try {
    //   setIsLoading(true);
    //   const instructions: TransactionInstruction[] = [];
    //   //we want to finalize only if someone try to withdraw after voting time ended
    //   //but its before finalize state
    //   if (
    //     proposal !== undefined &&
    //     proposal?.account.state === ProposalState.Voting &&
    //     hasVoteTimeExpired &&
    //     !inCoolOffTime
    //   ) {
    //     await withFinalizeVote(
    //       instructions,
    //       realmInfo!.programId,
    //       getProgramVersionForRealm(realmInfo!),
    //       realm!.pubkey,
    //       proposal.account.governance,
    //       proposal.pubkey,
    //       proposal.account.tokenOwnerRecord,
    //       proposal.account.governingTokenMint,
    //       maxVoterWeight
    //     );
    //   }
    //   await relinquishVote(
    //     rpcContext,
    //     realm.pubkey,
    //     proposal,
    //     voterTokenRecord.pubkey,
    //     ownVoteRecord.pubkey,
    //     instructions,
    //     votingClient
    //   );
    //   queryClient.invalidateQueries({
    //     queryKey: proposalQueryKeys.all(connection.endpoint),
    //   });
    // } catch (ex) {
    //   console.error("Can't relinquish vote", ex);
    // }
    // setIsLoading(false);
  };

  const vote = ownVoteRecord?.account.vote;

  const isMulti =
    proposal?.account.voteType !== VoteType.SINGLE_CHOICE &&
    proposal?.account.accountType === GovernanceAccountType.ProposalV2;

  const nota = '$$_NOTA_$$';

  return vote !== undefined ? (
    <div className='bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4'>
      <div className='flex flex-col items-center justify-center'>
        <h3 className='text-center'>
          {quorum === 'electoral' ? 'Your vote' : 'You voted to veto'}
        </h3>
        {vote.voteType === VoteKind.Approve ? (
          isMulti ? (
            vote.approveChoices?.map((choice, index) =>
              choice.weightPercentage ? (
                <div className='p-1 w-full' key={index}>
                  <Button
                    className='w-full border border-primary-light text-primary-light bg-transparent'
                    disabled={true}
                  >
                    <div className='flex flex-row gap-2 justify-center'>
                      <div>
                        <CheckCircleIcon />
                      </div>
                      <div>
                        {proposal?.account.options[index].label === nota
                          ? 'None of the Above'
                          : proposal?.account.options[index].label}
                      </div>
                    </div>
                  </Button>
                </div>
              ) : null
            )
          ) : (
            // <Tooltip content={`You voted "Yes"`}>
            <div className='flex flex-row items-center justify-center rounded-full border border-[#8EFFDD] p-2 mt-2'>
              <ThumbsUpIcon className='h-4 w-4 fill-[#8EFFDD]' />
            </div>
            // </Tooltip>
          )
        ) : vote.voteType === VoteKind.Deny ? (
          // <Tooltip content={`You voted "No"`}>
          <div className='flex flex-row items-center justify-center rounded-full border border-[#FF7C7C] p-2 mt-2'>
            <ThumbsDownIcon className='h-4 w-4 fill-[#FF7C7C]' />
          </div>
        ) : // </Tooltip>
        vote.voteType === VoteKind.Veto ? (
          // <Tooltip content={`You voted "Veto"`}>
          <div className='flex flex-row items-center justify-center rounded-full border border-[#FF7C7C] p-2 mt-2'>
            <BanIcon className='h-4 w-4 fill-[#FF7C7C]' />
          </div>
        ) : // </Tooltip>
        vote.voteType === VoteKind.Abstain ? (
          // <Tooltip content={`You voted "Abstain"`}>
          <div className='flex flex-row items-center justify-center rounded-full border border-gray-400 p-2 mt-2'>
            <MinusCircleIcon className='h-4 w-4 fill-gray-400' />
          </div>
        ) : (
          // </Tooltip>
          assertUnreachable(vote.voteType as never)
        )}
      </div>
      {(isVoting || inCoolOffTime) && (
        <div className='items-center justify-center flex w-full gap-5'>
          <div className='flex flex-col gap-6 items-center'>
            <Button
              className='min-w-[200px]'
              // isLoading={isLoading}
              // tooltipMessage={withdrawTooltipContent}
              onClick={() => submitRelinquishVote()}
              disabled={!isWithdrawEnabled || isLoading}
            >
              Withdraw Vote
            </Button>

            {inCoolOffTime && (
              <div className='text-xs'>
                Warning: If you withdraw your vote now you can only deny the
                proposal its not possible to vote yes during cool off time
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  ) : null;
};
