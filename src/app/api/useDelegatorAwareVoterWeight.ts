import { useWallet } from '@solana/wallet-adapter-react';
import { CalculatedWeight } from '../../../_external/VoterWeightPlugins/lib/types';
import { GovernanceRole } from '@/types/governance';
import { useAtom, useAtomValue } from 'jotai';
import {
  communityDelegatorAtom,
  councilDelegatorAtom,
} from '@/components/SelectPrimaryDelegators';
import { DELEGATOR_BATCH_VOTE_SUPPORT_BY_PLUGIN } from '@/constants/plugins';
import { useRealmVoterWeightPlugins } from './governance/voterWeightPlugins';

export const useDelegatorAwareVoterWeight = (
  role: GovernanceRole
): CalculatedWeight | undefined => {
  const wallet = useWallet().wallet.adapter;
  // these hooks return different results depending on whether batch delegator voting is supported
  // if batch is on, and these are undefined, it means "yourself + all delegators"
  // if batch is off, and these are undefined, it means "yourself only"
  // if batch is on, and yourself only is picked, the selectedDelegator will be the current logged-in wallet
  const selectedCommunityDelegator = useAtomValue(communityDelegatorAtom);
  const selectedCouncilDelegator = useAtomValue(councilDelegatorAtom);

  const selectedDelegatorForRole =
    role === 'community'
      ? selectedCommunityDelegator
      : selectedCouncilDelegator;
      
  const votingWallet =
    (role === 'community'
      ? selectedCommunityDelegator
      : selectedCouncilDelegator) ?? wallet?.publicKey;

  const { plugins, totalCalculatedVoterWeight, voterWeightForWallet } =
    useRealmVoterWeightPlugins(role);

  // if the plugin supports delegator batch voting (or no plugins exist on the dao),
  // and no delegator is selected, we can use totalCalculatedVoterWeight
  // otherwise, use the voterWeightForWallet for the correct delegator or the wallet itself
  const lastPlugin = plugins?.voterWeight[plugins.voterWeight.length - 1];
  const supportsBatchVoting =
    !lastPlugin || DELEGATOR_BATCH_VOTE_SUPPORT_BY_PLUGIN[lastPlugin?.name];

  // the user has selected "yourself + all delegators" and the plugin supports batch voting
  if (supportsBatchVoting && !selectedDelegatorForRole) {
    return totalCalculatedVoterWeight;
  }

  // there is no wallet to calculate voter weight for
  if (!votingWallet) return undefined;

  // the user has selected a specific delegator or "yourself only"
  return voterWeightForWallet(votingWallet);
};
