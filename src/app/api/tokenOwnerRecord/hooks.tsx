'use client';

import {
  TokenOwnerRecord,
  booleanFilter,
  getGovernanceAccounts,
  getTokenOwnerRecord,
  getTokenOwnerRecordAddress,
  pubkeyFilter,
} from '@solana/spl-governance';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useRealmFromParams } from '../realm/hooks';
import BN from 'bn.js';
import { useAtom, useAtomValue } from 'jotai';
import {
  communityDelegatorAtom,
  councilDelegatorAtom,
} from '@/components/SelectPrimaryDelegators';

export const useUserCommunityTokenOwnerRecord = () => {
  const { data: tokenOwnerRecordPubkey } =
    useAddressQuery_CommunityTokenOwner();
  return useTokenOwnerRecordByPubkey(tokenOwnerRecordPubkey);
};

export const useUserCouncilTokenOwnerRecord = () => {
  const { data: tokenOwnerRecordPubkey } = useAddressQuery_CouncilTokenOwner();
  return useTokenOwnerRecordByPubkey(tokenOwnerRecordPubkey);
};

export const useTokenOwnerRecordByPubkey = (pubkey: PublicKey | undefined) => {
  const { connection } = useConnection();

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['tokenOwnerRecord', pubkey, connection.rpcEndpoint],
    queryFn: async () => await getTokenOwnerRecord(connection, pubkey),
    staleTime: 60 * 1000 * 60, // 1 hour
  });
};

export const useAddressQuery_CouncilTokenOwner = () => {
  const { data: realm } = useRealmFromParams();
  const wallet = useWallet().wallet?.adapter;
  const selectedCouncilDelegator = useAtomValue(councilDelegatorAtom);

  // if we have a council token delegator selected (this is rare), use that. otherwise use user wallet.
  const owner =
    selectedCouncilDelegator !== PublicKey.default
      ? selectedCouncilDelegator
      : wallet?.publicKey ?? undefined;

  return useTokenOwnerRecordAddress(
    realm?.owner,
    realm?.pubkey,
    realm?.account.config.councilMint,
    owner
  );
};

export const useAddressQuery_CommunityTokenOwner = () => {
  const { data: realm } = useRealmFromParams();
  const wallet = useWallet().wallet?.adapter;
  const selectedCommunityDelegator = useAtomValue(communityDelegatorAtom);

  // if we have a community token delegator selected (this is rare), use that. otherwise use user wallet.
  const owner =
    selectedCommunityDelegator !== PublicKey.default
      ? selectedCommunityDelegator
      : // I wanted to eliminate `null` as a possible type
        wallet?.publicKey ?? undefined;

  return useTokenOwnerRecordAddress(
    realm?.owner,
    realm?.pubkey,
    realm?.account.communityMint,
    owner
  );
};

export const useTokenOwnerRecordAddress = (
  programId?: PublicKey,
  realmPk?: PublicKey,
  governingTokenMint?: PublicKey,
  owner?: PublicKey
) => {
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      'tokenOwnerRecordAddress',
      [programId, realmPk, governingTokenMint, owner],
    ],
    queryFn: async () =>
      await getTokenOwnerRecordAddress(
        programId,
        realmPk,
        governingTokenMint,
        owner
      ),
    staleTime: Infinity,
  });
};

export const useVanillaGovpower = (
  tokenOwnerRecordPk: PublicKey | undefined
) => {
  const { data: torAccount } = useTokenOwnerRecordByPubkey(tokenOwnerRecordPk);
  return torAccount
    ? torAccount.account.governingTokenDepositAmount
    : new BN(0);
};
// TODO filter in the gPA (would need rpc to also index)

export const useTokenOwnerRecordsDelegatedToUser = () => {
  const { connection } = useConnection();
  const realm = useRealmFromParams();
  const { wallet } = useWallet();
  const walletPk = wallet?.adapter.publicKey;
  const connected = !!wallet?.adapter.connected;
  // console.log('useTokenOwnerRecordsDelegatedToUser walletPk', walletPk);
  const query = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      'tokenOwnedRecord',
      connection.rpcEndpoint,
      realm.data.pubkey,
      walletPk,
    ],
    queryFn: async () => {
      const realmFilter = pubkeyFilter(1, realm.data.pubkey);
      const hasDelegateFilter = booleanFilter(
        1 + 32 + 32 + 32 + 8 + 4 + 4 + 1 + 1 + 6,
        true
      );
      const delegatedToUserFilter = pubkeyFilter(
        1 + 32 + 32 + 32 + 8 + 4 + 4 + 1 + 1 + 6 + 1,
        walletPk
      );
      console.log('realmFilter', realmFilter);
      console.log('delegatedToUserFilter', delegatedToUserFilter);
      if (!realmFilter || !delegatedToUserFilter) throw new Error(); // unclear why this would ever happen, probably it just cannot

      const results = await getGovernanceAccounts(
        connection,
        realm.data.owner,
        TokenOwnerRecord,
        [realmFilter, hasDelegateFilter, delegatedToUserFilter]
      );

      // This may or may not be resource intensive for big DAOs, and is not too useful
      /*
        results.forEach((x) => {
          queryClient.setQueryData(
            tokenOwnerRecordQueryKeys.byPubkey(connection.cluster, x.pubkey),
            { found: true, result: x }
          )
        }) */
      return results;
    },
    staleTime: 60 * 1000 * 60, // 1 hour

    enabled: connected,
  });

  return query;
};
