'use client';

import {
  getTokenOwnerRecord,
  getTokenOwnerRecordAddress,
} from '@solana/spl-governance';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useRealmParams } from '../realm/hooks';
import BN from 'bn.js';

export const useUserCommunityTokenOwnerRecord = () => {
  const { data: tokenOwnerRecordPubkey } =
    useAddressQuery_CommunityTokenOwner();
  return useTokenOwnerRecordByPubkeyQuery(tokenOwnerRecordPubkey);
};

export const useUserCouncilTokenOwnerRecord = () => {
  const { data: tokenOwnerRecordPubkey } = useAddressQuery_CouncilTokenOwner();
  return useTokenOwnerRecordByPubkeyQuery(tokenOwnerRecordPubkey);
};

export const useTokenOwnerRecordByPubkeyQuery = (
  pubkey: PublicKey | undefined
) => {
  const { connection } = useConnection();

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['token_owner_record', pubkey, connection.rpcEndpoint],
    queryFn: async () => await getTokenOwnerRecord(connection, pubkey),
  });
};

export const useAddressQuery_CouncilTokenOwner = () => {
  const { data: realm } = useRealmParams();
  const wallet = useWallet().wallet?.adapter;
  const selectedCouncilDelegator = undefined; // FIXME useSelectedDelegatorStore(
  // (s) => s.councilDelegator
  // );

  // if we have a council token delegator selected (this is rare), use that. otherwise use user wallet.
  const owner =
    selectedCouncilDelegator !== undefined
      ? selectedCouncilDelegator
      : wallet?.publicKey ?? undefined;

  return useAddressQuery_TokenOwnerRecord(
    realm?.owner,
    realm?.pubkey,
    realm?.account.config.councilMint,
    owner
  );
};

export const useAddressQuery_CommunityTokenOwner = () => {
  const { data: realm } = useRealmParams();
  const wallet = useWallet().wallet?.adapter;
  const selectedCommunityDelegator = undefined; // FIXME useSelectedDelegatorStore(
  // (s) => s.communityDelegator
  // );

  // if we have a community token delegator selected (this is rare), use that. otherwise use user wallet.
  const owner =
    selectedCommunityDelegator !== undefined
      ? selectedCommunityDelegator
      : // I wanted to eliminate `null` as a possible type
        wallet?.publicKey ?? undefined;

  return useAddressQuery_TokenOwnerRecord(
    realm?.owner,
    realm?.pubkey,
    realm?.account.communityMint,
    owner
  );
};

export const useAddressQuery_TokenOwnerRecord = (
  programId?: PublicKey,
  realmPk?: PublicKey,
  governingTokenMint?: PublicKey,
  owner?: PublicKey
) => {
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      'TokenOwnerAddress',
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
  const { data: torAccount } =
    useTokenOwnerRecordByPubkeyQuery(tokenOwnerRecordPk);
  return torAccount
    ? torAccount.account.governingTokenDepositAmount
    : new BN(0);
};
