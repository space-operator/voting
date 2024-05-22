import { useProposalVoteRecordQuery } from '@/app/api/voteRecord/hooks';
import {
  isInCoolOffTime,
  useIsVoting,
  useUserVetoTokenRecord,
  useVetoingPop,
} from '@/app/api/voting/hooks';
import { ProgramAccount, Proposal, VoteKind } from '@solana/spl-governance';
import { useState } from 'react';
import { useSubmitVote } from './useSubmitVote';
import VoteCommentModal from './VoteCommentModal';
import { useRealmRegistryEntryFromParams } from '@/app/api/realm/hooks';
import { Button } from '../ui/button';
import { BanIcon } from 'lucide-react';
import { useRealmVoterWeightPlugins } from '@/app/api/voterWeightPlugins/hooks';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGovernance } from '@/app/api/governance/hooks';

const useIsVetoable = (
  proposal: ProgramAccount<Proposal>
): undefined | boolean => {
  const { data: governance } = useGovernance(proposal.account.governance);
  const vetoingPop = useVetoingPop(proposal);
  const isVoting = useIsVoting({ proposal, governance });
  const inCoolOffTime = isInCoolOffTime(proposal.account, governance.account);
  // TODO is this accurate?
  if (isVoting === false && inCoolOffTime === false) return false;
  if (vetoingPop === undefined) return undefined;
  return !!vetoingPop;
};

const useCanVeto = ({
  proposal,
}: {
  proposal: ProgramAccount<Proposal>;
}): undefined | { canVeto: true } | { canVeto: false; message: string } => {
  const wallet = useWallet().wallet.adapter;
  const connected = !!wallet?.connected;

  const vetoPop = useVetoingPop(proposal);
  const { calculatedMaxVoterWeight, isReady } =
    useRealmVoterWeightPlugins(vetoPop);

  const isVetoable = useIsVetoable(proposal);
  const { data: userVetoRecord } = useProposalVoteRecordQuery({
    quorum: 'veto',
    proposal,
  });
  const voterTokenRecord = useUserVetoTokenRecord({ proposal });

  if (isVetoable === false)
    return {
      canVeto: false,
      // (Note that users should never actually see this)
      message: 'This proposal is not vetoable',
    };

  // Are you connected?
  if (connected === false)
    return { canVeto: false, message: 'You must connect your wallet' };

  // Did you already veto?
  if (userVetoRecord) return { canVeto: false, message: 'You already voted' };

  // Do you have any voting power?
  const hasMinAmountToVote =
    voterTokenRecord && isReady && calculatedMaxVoterWeight?.value?.gtn(0);
  if (hasMinAmountToVote === undefined) return undefined;
  if (hasMinAmountToVote === false)
    return {
      canVeto: false,
      message: 'You don’t have governance power to vote in this dao',
    };

  return { canVeto: true };
};

const VetoButtons = ({ proposal }: { proposal: ProgramAccount<Proposal> }) => {
  const realmInfo = useRealmRegistryEntryFromParams();
  const allowDiscussion = realmInfo?.allowDiscussion ?? true;
  const vetoable = useIsVetoable(proposal);
  const vetoingPop = useVetoingPop(proposal);
  const canVeto = useCanVeto({ proposal });
  const [openModal, setOpenModal] = useState(false);
  const { data: userVetoRecord } = useProposalVoteRecordQuery({
    quorum: 'veto',
    proposal,
  });
  const { submitting, submitVote } = useSubmitVote({ proposal });

  const handleVeto = async () => {
    if (allowDiscussion) {
      setOpenModal(true);
    } else {
      submitVote({
        vote: VoteKind.Veto,
      });
    }
  };

  return vetoable && vetoingPop && !userVetoRecord ? (
    <>
      <div className='bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4'>
        <div className='flex flex-col items-center justify-center'>
          <h3 className='text-center'>Cast your {vetoingPop} veto vote</h3>
        </div>
        <div className='flex flex-col items-center justify-center'>
          <Button
            // tooltipMessage={
            //   canVeto?.canVeto === false ? canVeto.message : undefined
            // }
            className='w-full'
            onClick={handleVeto}
            disabled={!canVeto?.canVeto || submitting}
            // isLoading={submitting}
          >
            <div className='flex flex-row items-center justify-center'>
              <BanIcon className='h-4 w-4 mr-2' />
              Veto
            </div>
          </Button>
        </div>
      </div>
      {openModal ? (
        <VoteCommentModal
          onClose={() => setOpenModal(false)}
          isOpen={openModal}
          vote={VoteKind.Veto}
          proposal={proposal}
        />
      ) : null}
    </>
  ) : null;
};

export default VetoButtons;
