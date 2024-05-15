'use client';

import { DELEGATOR_BATCH_VOTE_SUPPORT_BY_PLUGIN } from '@/constants/plugins';
import { getVotingPowerType } from '../voting/query';
import { useConnection } from '@solana/wallet-adapter-react';
import { useAsync } from 'react-async-hook';
// import { useSelectedDelegatorStore } from 'stores/useSelectedDelegatorStore';
import { useRealmParams } from '../realm/hooks';
import { useTokenOwnerRecordsDelegatedToUser } from '../tokenOwnerRecord/tokenOwnerRecord';
import { communityDelegatorAtom, councilDelegatorAtom } from '@/components/SelectPrimaryDelegators';
import { useAtomValue } from 'jotai';

export const useDelegators = (role: 'community' | 'council' | undefined) => {
  const { data: realm } = useRealmParams();
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
  console.log('useDelegators', relevantDelegators);
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
  const realmPk = useRealmParams().data.pubkey;
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
