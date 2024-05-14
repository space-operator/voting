import { useAsyncCallback } from 'react-async-hook';
import {
  ChatMessageBody,
  ChatMessageBodyType,
  ProgramAccount,
  Proposal,
  RpcContext,
  Vote,
  VoteChoice,
  VoteKind,
  getTokenOwnerRecordAddress,
  withCastVote,
} from '@solana/spl-governance';

import { TransactionInstruction } from '@solana/web3.js';

import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useBatchedVoteDelegators } from '@/app/api/delegators/useDelegators';
import { queryClient } from '@/providers/query';
import {
  useRealmParams,
  useSelectedRealmRegistryEntry,
} from '@/app/api/realm/hooks';
import { getProgramVersionForRealm } from '@/types/realm';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { useVotingClients } from '@/app/api/votingClient/hooks';
import { castVote } from './castVote';
import { useAtom } from 'jotai';
import {
  communityDelegatorAtom,
  councilDelegatorAtom,
} from '../SelectPrimaryDelegators';

export const useSubmitVote = ({
  proposal,
}: {
  proposal: ProgramAccount<Proposal>;
}) => {
  const wallet = useWallet().wallet.adapter as SignerWalletAdapter;
  const { connection } = useConnection();
  const { data: realm } = useRealmParams();

  const realmInfo = useSelectedRealmRegistryEntry();
  const votingClients = useVotingClients(); // TODO this should be passed the role
  // const { closeNftVotingCountingModal } = useNftProposalStore.getState();
  // const { nftClient } = useNftClient();

  // const isNftPlugin = !!nftClient;

  const [selectedCommunityDelegator, __] = useAtom(communityDelegatorAtom);

  const [selectedCouncilDelegator, _] = useAtom(councilDelegatorAtom);

  const communityDelegators = useBatchedVoteDelegators('community');
  const councilDelegators = useBatchedVoteDelegators('council');

  const { error, loading, execute } = useAsyncCallback(
    async ({
      vote,
      comment,
      voteWeights,
    }: {
      vote: VoteKind;
      comment?: string;
      voteWeights?: number[];
    }) => {
      if (!proposal) throw new Error();
      if (!realm) throw new Error();

      const rpcContext = new RpcContext(
        proposal.owner,
        getProgramVersionForRealm(realmInfo!),
        wallet!,
        connection,
        connection.rpcEndpoint
      );

      const msg = comment
        ? new ChatMessageBody({
            type: ChatMessageBodyType.Text,
            value: comment,
          })
        : undefined;

      const confirmationCallback = async () => {
        // TODO
        // await queryClient.invalidateQueries(
        //   voteRecordQueryKeys.all(connection.cluster)
        // );
      };

      const relevantMint =
        vote !== VoteKind.Veto
          ? // if its not a veto, business as usual
            proposal.account.governingTokenMint
          : // if it is a veto, the vetoing mint is the opposite of the governing mint
          realm.account.communityMint.equals(
              proposal.account.governingTokenMint
            )
          ? realm.account.config.councilMint
          : realm.account.communityMint;
      if (relevantMint === undefined) throw new Error();

      const role = relevantMint.equals(realm.account.communityMint)
        ? 'community'
        : 'council';

      const relevantSelectedDelegator =
        role === 'community'
          ? selectedCommunityDelegator
          : selectedCouncilDelegator;

      const actingAsWalletPk =
        relevantSelectedDelegator ?? wallet?.publicKey ?? undefined;
      if (!actingAsWalletPk) throw new Error();

      const tokenOwnerRecordPk = await getTokenOwnerRecordAddress(
        realm.owner,
        realm.pubkey,
        relevantMint,
        actingAsWalletPk
      );

      const relevantDelegators = (
        role === 'community' ? communityDelegators : councilDelegators
      )?.map((x) => x.pubkey);

      const votingClient = votingClients(role);
      try {
        await castVote(
          rpcContext,
          realm,
          proposal,
          tokenOwnerRecordPk,
          vote,
          msg,
          votingClient,
          confirmationCallback,
          voteWeights,
          relevantDelegators
        );

        // TODO
        // queryClient.invalidateQueries({
        //   queryKey: proposalQueryKeys.all(connection.current.rpcEndpoint),
        // });
        msg &&
          queryClient.invalidateQueries({
            queryKey: [connection.rpcEndpoint, 'ChatMessages'],
          });
      } catch (e) {
        console.error(e);
      } finally {
        // if (isNftPlugin) {
        //   closeNftVotingCountingModal(
        //     votingClient.client as NftVoterClient,
        //     proposal!,
        //     wallet!.publicKey!
        //   );
        // }
      }
    }
  );

  return {
    error,
    submitting: loading,
    submitVote: execute,
  };
};

type VoteArgs = {
  voteKind: VoteKind;
  governingBody: 'community' | 'council';
  proposal: ProgramAccount<Proposal>;
  comment?: string;
};
