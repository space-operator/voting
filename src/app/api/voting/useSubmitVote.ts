import { useAsyncCallback } from 'react-async-hook';
import {
  ChatMessageBody,
  ChatMessageBodyType,
  GovernanceAccountType,
  ProgramAccount,
  Proposal,
  RpcContext,
  Vote,
  VoteChoice,
  VoteKind,
  VoteType,
  getTokenOwnerRecordAddress,
  withCastVote,
} from '@solana/spl-governance';

import { TransactionInstruction } from '@solana/web3.js';

import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { queryClient } from '@/providers/query';
import {
  useRealmFromParams,
  useRealmRegistryEntryFromParams,
} from '@/app/api/realm/hooks';
import { getProgramVersionForRealm } from '@/types/realm';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';

import { useAtom, useAtomValue } from 'jotai';
import {
  communityDelegatorAtom,
  councilDelegatorAtom,
} from '../../../components/SelectPrimaryDelegators';
import { useFlowEvents } from '../_flows/hooks';
import { getVetoTokenMint } from '@/utils/helpers';
import { prepFlowInputs } from '../../../components/_flow/helpers';
import { Value } from '@space-operator/client';
import { fetchProgramVersion } from '@/app/api/programVersion/queries';
import { PublicKey } from '@solana/web3.js';
import { useBatchedVoteDelegators } from '@/app/api/delegators/hooks';

export const useSubmitVote = ({
  proposal,
}: {
  proposal: ProgramAccount<Proposal>;
}) => {
  const wallet = useWallet()?.wallet?.adapter as SignerWalletAdapter;
  const { connection } = useConnection();
  const { data: realm } = useRealmFromParams();

  const realmInfo = useRealmRegistryEntryFromParams();
  // const votingClients = useVotingClients(); // TODO this should be passed the role
  // const { closeNftVotingCountingModal } = useNftProposalStore.getState();
  // const { nftClient } = useNftClient();

  // const isNftPlugin = !!nftClient;

  const selectedCommunityDelegator = useAtomValue(communityDelegatorAtom);

  const selectedCouncilDelegator = useAtomValue(councilDelegatorAtom);

  const communityDelegators = useBatchedVoteDelegators('community');
  const councilDelegators = useBatchedVoteDelegators('council');

  const { logs, startFlow, flowComplete, errors, flowSuccess } =
    useFlowEvents();

  const { error, loading, execute } = useAsyncCallback(
    async ({
      vote: voteKind,
      comment,
      voteWeights,
    }: {
      vote: VoteKind;
      comment?: string;
      voteWeights?: number[];
    }) => {
      if (!proposal) throw new Error();
      if (!realm) throw new Error();

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
        voteKind !== VoteKind.Veto
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
        relevantSelectedDelegator === PublicKey.default
          ? wallet?.publicKey
          : relevantSelectedDelegator ?? undefined;
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

      // const votingClient = votingClients(role);

      const isMulti =
        proposal.account.voteType !== VoteType.SINGLE_CHOICE &&
        proposal.account.accountType === GovernanceAccountType.ProposalV2;

      // It is not clear that defining these extraneous fields, `deny` and `veto`, is actually necessary.
      // See:  https://discord.com/channels/910194960941338677/910630743510777926/1044741454175674378
      const formattedVote = isMulti
        ? new Vote({
            voteType: VoteKind.Approve,
            approveChoices: proposal.account.options.map((_o, index) => {
              if (voteWeights?.includes(index)) {
                return new VoteChoice({ rank: 0, weightPercentage: 100 });
              } else {
                return new VoteChoice({ rank: 0, weightPercentage: 0 });
              }
            }),
            deny: undefined,
            veto: undefined,
          })
        : voteKind === VoteKind.Approve
        ? new Vote({
            voteType: VoteKind.Approve,
            approveChoices: [
              new VoteChoice({ rank: 0, weightPercentage: 100 }),
            ],
            deny: undefined,
            veto: undefined,
          })
        : voteKind === VoteKind.Deny
        ? new Vote({
            voteType: VoteKind.Deny,
            approveChoices: undefined,
            deny: true,
            veto: undefined,
          })
        : voteKind == VoteKind.Veto
        ? new Vote({
            voteType: VoteKind.Veto,
            veto: true,
            deny: undefined,
            approveChoices: undefined,
          })
        : new Vote({
            voteType: VoteKind.Abstain,
            veto: undefined,
            deny: undefined,
            approveChoices: undefined,
          });

      function convertVoteToRust(vote: Vote): any {
        switch (vote.voteType) {
          case VoteKind.Approve:
            if (vote.approveChoices) {
              const choices = vote.approveChoices.map((choice) => ({
                rank: choice.rank,
                weight_percentage: choice.weightPercentage,
              }));
              return { Approve: choices };
            }
            break;
          case VoteKind.Deny:
            return { Deny: null };
          case VoteKind.Abstain:
            return { Abstain: null };
          case VoteKind.Veto:
            return { Veto: null };
        }
        throw new Error('Invalid vote type');
      }
      const tokenMint =
        voteKind === VoteKind.Veto
          ? getVetoTokenMint(proposal, realm)
          : proposal.account.governingTokenMint;

      const programVersion = await fetchProgramVersion(
        connection,
        proposal.owner
      );
      // TODO plugin
      // const pluginCastVoteIxs: TransactionInstruction[] = [];
      // //will run only if any plugin is connected with realm
      // const plugin = await votingPlugin?.withCastPluginVote(
      //   pluginCastVoteIxs,
      //   proposal,
      //   tokenOwnerRecord,
      //   createCastNftVoteTicketIxs
      // );

      try {
        const flowId = 2140;

        // if comment is not empty, add add comment instruction
        const addComment = !!comment ? { Text: comment } : "";

        const inputBody = new Value({
          private_key: 'WALLET',
          realm: realm.pubkey,
          governance: proposal.account.governance,
          proposal: proposal.pubkey,
          proposal_owner_record: proposal.account.tokenOwnerRecord,
          voter_token_owner_record: tokenOwnerRecordPk,
          governance_authority: 'WALLET',
          vote_governing_token_mint: tokenMint,
          voter_weight_record: null, //plugin?.voterWeightPk,
          max_voter_weight_record: null, //plugin?.maxVoterWeightRecord,
          vote: convertVoteToRust(formattedVote),
          body: addComment,
          reply_to: null,
        }).M;

        console.log('inputBody', inputBody);

        await startFlow(flowId, prepFlowInputs(inputBody, wallet.publicKey));

        // await castVote(
        //   rpcContext,
        //   realm,
        //   proposal,
        //   tokenOwnerRecordPk,
        //   vote,
        //   msg,
        //   votingClient,
        //   confirmationCallback,
        //   voteWeights,
        //   relevantDelegators
        // );
        queryClient.invalidateQueries({
          queryKey: ['voteRecordAddress'],
        });
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
    logs,
    flowComplete,
    errors,
    flowSuccess,
  };
};

type VoteArgs = {
  voteKind: VoteKind;
  governingBody: 'community' | 'council';
  proposal: ProgramAccount<Proposal>;
  comment?: string;
};
