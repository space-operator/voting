'use client';

import { DELEGATOR_BATCH_VOTE_SUPPORT_BY_PLUGIN } from '@/constants/plugins';
import { getVotingPowerType } from '../voting/query';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useAsync } from 'react-async-hook';
// import { useSelectedDelegatorStore } from 'stores/useSelectedDelegatorStore';
import { useRealmFromParams } from '../realm/hooks';
import { useTokenOwnerRecordsDelegatedToUser } from '../tokenOwnerRecord/hooks';
import { communityDelegatorAtom, councilDelegatorAtom } from '@/components/SelectPrimaryDelegators';
import { useAtomValue } from 'jotai';
import { GovernanceRole } from '@/types/governance';
import { PublicKey } from '@solana/web3.js';
import { CalculatedWeight } from '../../../../_external/VoterWeightPlugins/lib/types';
import { useRealmVoterWeightPlugins } from '../voterWeightPlugins/hooks';

export const useDelegators = (role: 'community' | 'council' | undefined) => {
  const { data: realm } = useRealmFromParams();
  const relevantMint =
    role && role === 'community'
      ? realm?.account.communityMint
      : realm?.account.config.councilMint;

  const { data: torsDelegatedToUser } = useTokenOwnerRecordsDelegatedToUser();
  const relevantDelegators =
    relevantMint &&
    torsDelegatedToUser?.filter((x) =>
      x.account.governingTokenMint.equals(relevantMint)
    );
  return relevantDelegators;
};
/* 
const fetchDelegators = async (connection: Connection, walletPk: PublicKey, realmPk: PublicKey, role: 'community' | 'council' | undefined) => {
  const realm = (await fetchRealmByPubkey(connection, realmPk)).result
  if (realm === undefined) {throw new Error('Realm not found')}
  
  const relevantMint =
    role && role === 'community'
      ? realm.account.communityMint
      : realm.account.config.councilMint
  
} */

/**
 * if batched voting is enabled for the plugin, and by the user, then this returns array of delegators.
 * otherwise, returns []
 **/
export const useBatchedVoteDelegators = (
  role: 'community' | 'council' | undefined
) => {
  const { connection } = useConnection();
  const realmPk = useRealmFromParams().data.pubkey;
  const delegators = useDelegators(role);
  const { result: plugin } = useAsync(
    async () =>
      role && realmPk && getVotingPowerType(connection, realmPk, role),
    [connection, realmPk, role]
  );
  const batchVoteSupported =
    plugin && DELEGATOR_BATCH_VOTE_SUPPORT_BY_PLUGIN[plugin];

  // empty array if not supported
  const delegatorsIfSupported =
    batchVoteSupported === undefined
      ? undefined
      : batchVoteSupported === false
      ? []
      : delegators;

  // If the user is selecting a specific delegator, we want to just use that and not count the other delegators
  const selectedDelegator = useAtomValue(
    role === 'community' ? communityDelegatorAtom : councilDelegatorAtom
  );

  return selectedDelegator ? [] : delegatorsIfSupported;
};



export const useDelegatorAwareVoterWeight = (
  role: GovernanceRole
): CalculatedWeight | undefined => {
  const wallet = useWallet()?.wallet?.adapter;
  // these hooks return different results depending on whether batch delegator voting is supported
  // if batch is on, and these are undefined, it means "yourself + all delegators"
  // if batch is off, and these are undefined, it means "yourself only"
  // if batch is on, and yourself only is picked, the selectedDelegator will be the current logged-in wallet
  const selectedDelegatorForRole = useAtomValue(
    role === 'community' ? communityDelegatorAtom : councilDelegatorAtom
  );
  const votingWallet = selectedDelegatorForRole === PublicKey.default
    ? wallet?.publicKey
    : selectedDelegatorForRole;

  const { plugins, totalCalculatedVoterWeight, voterWeightForWallet } = useRealmVoterWeightPlugins(role);

  // if the plugin supports delegator batch voting (or no plugins exist on the dao),
  // and no delegator is selected, we can use totalCalculatedVoterWeight
  // otherwise, use the voterWeightForWallet for the correct delegator or the wallet itself
  const lastPlugin = plugins?.voterWeight[plugins.voterWeight.length - 1];
  const supportsBatchVoting = !lastPlugin || DELEGATOR_BATCH_VOTE_SUPPORT_BY_PLUGIN[lastPlugin?.name];

  // the user has selected "yourself + all delegators" and the plugin supports batch voting
  if (supportsBatchVoting && selectedDelegatorForRole !== PublicKey.default) {
    return totalCalculatedVoterWeight;
  }

  // there is no wallet to calculate voter weight for
  if (!votingWallet) return undefined;

  // the user has selected a specific delegator or "yourself only"
  return voterWeightForWallet(votingWallet);
};

