import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  ChatMessageBody,
  GovernanceAccountType,
  GOVERNANCE_CHAT_PROGRAM_ID,
  Proposal,
  Realm,
  VoteChoice,
  VoteKind,
  VoteType,
  withPostChatMessage,
  withCreateTokenOwnerRecord,
  getVoteRecordAddress,
} from '@solana/spl-governance';
import { ProgramAccount } from '@solana/spl-governance';
import { RpcContext } from '@solana/spl-governance';

import { Vote } from '@solana/spl-governance';

import { withCastVote } from '@solana/spl-governance';
import { fetchProgramVersion } from '@/app/api/programVersion/queries';
import { fetchRealmByPubkey } from '@/app/api/realm/queries';
import { fetchTokenOwnerRecordByPubkey } from '@/app/api/tokenOwnerRecord/queries';



// const createDelegatorVote = async ({
//   connection,
//   realmPk,
//   proposalPk,
//   tokenOwnerRecordPk,
//   userPk,
//   vote,
//   votingPlugin,
// }: {
//   connection: Connection;
//   realmPk: PublicKey;
//   proposalPk: PublicKey;
//   tokenOwnerRecordPk: PublicKey;
//   userPk: PublicKey;
//   vote: Vote;
//   votingPlugin: VotingClient | undefined;
// }) => {
//   //
//   const realm = (await fetchRealmByPubkey(connection, realmPk)).result;
//   if (!realm) throw new Error();
//   const proposal = (await fetchProposalByPubkeyQuery(connection, proposalPk))
//     .result;
//   if (!proposal) throw new Error();

//   if (
//     !DELEGATOR_BATCH_VOTE_SUPPORT_BY_PLUGIN[
//       findPluginName(votingPlugin?.client?.program.programId)
//     ]
//   )
//     throw new Error();

//   const programVersion = await fetchProgramVersion(connection, realm.owner);

//   const castVoteIxs: TransactionInstruction[] = [];

//   const pluginAddresses = await votingPlugin?.withCastPluginVote(
//     castVoteIxs,
//     proposal,
//     tokenOwnerRecordPk
//     //createCastNftVoteTicketIxs
//   );
//   await withCastVote(
//     castVoteIxs,
//     realm.owner,
//     programVersion,
//     realm.pubkey,
//     proposal.account.governance,
//     proposal.pubkey,
//     proposal.account.tokenOwnerRecord,
//     tokenOwnerRecordPk,
//     userPk,
//     proposal.account.governingTokenMint,
//     vote,
//     userPk,
//     pluginAddresses?.voterWeightPk,
//     pluginAddresses?.maxVoterWeightRecord
//   );

//   return castVoteIxs;
// };

const createTokenOwnerRecordIfNeeded = async ({
  connection,
  realmPk,
  tokenOwnerRecordPk,
  payer,
  governingTokenMint,
}: {
  connection: Connection;
  realmPk: PublicKey;
  tokenOwnerRecordPk: PublicKey;
  payer: PublicKey;
  governingTokenMint: PublicKey;
}) => {
  const realm = await fetchRealmByPubkey(connection, realmPk);
  if (!realm) throw new Error();
  const version = await fetchProgramVersion(connection, realm.owner);

  const tokenOwnerRecord = await fetchTokenOwnerRecordByPubkey(
    connection,
    tokenOwnerRecordPk
  );
  if (tokenOwnerRecord) return [];
  // create token owner record
  const ixs: TransactionInstruction[] = [];
  await withCreateTokenOwnerRecord(
    ixs,
    realm.owner,
    version,
    realmPk,
    payer,
    governingTokenMint,
    payer
  );
  return ixs;
};

// export async function castVote(
//   { connection, wallet, programId, walletPubkey }: RpcContext,
//   realm: ProgramAccount<Realm>,
//   proposal: ProgramAccount<Proposal>,
//   tokenOwnerRecord: PublicKey,
//   voteKind: VoteKind,
//   message?: ChatMessageBody | undefined,
//   votingPlugin?: VotingClient,
//   runAfterConfirmation?: (() => void) | null,
//   voteWeights?: number[],
//   additionalTokenOwnerRecords?: PublicKey[]
// ) {
//   const chatMessageSigners: Keypair[] = [];

//   const createCastNftVoteTicketIxs: TransactionInstruction[] = [];
//   const createPostMessageTicketIxs: TransactionInstruction[] = [];

//   const governanceAuthority = walletPubkey;
//   const payer = walletPubkey;
//   // Explicitly request the version before making RPC calls to work around race conditions in resolving
//   // the version for RealmInfo
//   const programVersion = await fetchProgramVersion(connection, programId);

//   const pluginCastVoteIxs: TransactionInstruction[] = [];
//   //will run only if any plugin is connected with realm
//   const plugin = await votingPlugin?.withCastPluginVote(
//     pluginCastVoteIxs,
//     proposal,
//     tokenOwnerRecord,
//     createCastNftVoteTicketIxs
//   );

//   const isMulti =
//     proposal.account.voteType !== VoteType.SINGLE_CHOICE &&
//     proposal.account.accountType === GovernanceAccountType.ProposalV2;

//   // It is not clear that defining these extraneous fields, `deny` and `veto`, is actually necessary.
//   // See:  https://discord.com/channels/910194960941338677/910630743510777926/1044741454175674378
//   const vote = isMulti
//     ? new Vote({
//         voteType: VoteKind.Approve,
//         approveChoices: proposal.account.options.map((_o, index) => {
//           if (voteWeights?.includes(index)) {
//             return new VoteChoice({ rank: 0, weightPercentage: 100 });
//           } else {
//             return new VoteChoice({ rank: 0, weightPercentage: 0 });
//           }
//         }),
//         deny: undefined,
//         veto: undefined,
//       })
//     : voteKind === VoteKind.Approve
//     ? new Vote({
//         voteType: VoteKind.Approve,
//         approveChoices: [new VoteChoice({ rank: 0, weightPercentage: 100 })],
//         deny: undefined,
//         veto: undefined,
//       })
//     : voteKind === VoteKind.Deny
//     ? new Vote({
//         voteType: VoteKind.Deny,
//         approveChoices: undefined,
//         deny: true,
//         veto: undefined,
//       })
//     : voteKind == VoteKind.Veto
//     ? new Vote({
//         voteType: VoteKind.Veto,
//         veto: true,
//         deny: undefined,
//         approveChoices: undefined,
//       })
//     : new Vote({
//         voteType: VoteKind.Abstain,
//         veto: undefined,
//         deny: undefined,
//         approveChoices: undefined,
//       });

//   const tokenMint =
//     voteKind === VoteKind.Veto
//       ? getVetoTokenMint(proposal, realm)
//       : proposal.account.governingTokenMint;

//   const castVoteIxs: TransactionInstruction[] = [];
//   await withCastVote(
//     castVoteIxs,
//     programId,
//     programVersion,
//     realm.pubkey,
//     proposal.account.governance,
//     proposal.pubkey,
//     proposal.account.tokenOwnerRecord,
//     tokenOwnerRecord,
//     governanceAuthority,
//     tokenMint,
//     vote,
//     payer,
//     plugin?.voterWeightPk,
//     plugin?.maxVoterWeightRecord
//   );

//   const delegatorCastVoteAtoms =
//     additionalTokenOwnerRecords &&
//     DELEGATOR_BATCH_VOTE_SUPPORT_BY_PLUGIN[
//       findPluginName(votingPlugin?.client?.program.programId)
//     ]
//       ? (
//           await Promise.all(
//             additionalTokenOwnerRecords.map(async (tokenOwnerRecordPk) => {
//               // Skip vote if already voted
//               const voteRecordPk = await getVoteRecordAddress(
//                 realm.owner,
//                 proposal.pubkey,
//                 tokenOwnerRecordPk
//               );
//               const voteRecord = await fetchVoteRecordByPubkey(
//                 connection,
//                 voteRecordPk
//               );
//               if (voteRecord.found) return undefined;

//               return createDelegatorVote({
//                 connection,
//                 realmPk: realm.pubkey,
//                 proposalPk: proposal.pubkey,
//                 tokenOwnerRecordPk,
//                 userPk: walletPubkey,
//                 vote,
//                 votingPlugin: votingPlugin,
//               });
//             })
//           )
//         ).filter((x): x is NonNullable<typeof x> => x !== undefined)
//       : [];

//   const pluginPostMessageIxs: TransactionInstruction[] = [];
//   const postMessageIxs: TransactionInstruction[] = [];

//   if (message) {
//     const plugin = await votingPlugin?.withUpdateVoterWeightRecord(
//       pluginPostMessageIxs,
//       'commentProposal',
//       createPostMessageTicketIxs
//     );

//     await withPostChatMessage(
//       postMessageIxs,
//       chatMessageSigners,
//       GOVERNANCE_CHAT_PROGRAM_ID,
//       programId,
//       realm.pubkey,
//       proposal.account.governance,
//       proposal.pubkey,
//       tokenOwnerRecord,
//       governanceAuthority,
//       payer,
//       undefined,
//       message,
//       plugin?.voterWeightPk
//     );
//   }

//   const isNftVoter = votingPlugin?.client instanceof NftVoterClient;
//   const isHeliumVoter = votingPlugin?.client instanceof HeliumVsrClient;
  
//   const tokenOwnerRecordIxs = await createTokenOwnerRecordIfNeeded({
//     connection,
//     realmPk: realm.pubkey,
//     tokenOwnerRecordPk: tokenOwnerRecord,
//     payer,
//     governingTokenMint: tokenMint,
//   });

//   if (!isNftVoter && !isHeliumVoter) {
//     const batch1 = [
//       ...tokenOwnerRecordIxs,
//       ...pluginCastVoteIxs,
//       ...castVoteIxs,
//       ...pluginPostMessageIxs,
//       ...postMessageIxs,
//     ];
//     // chunk size chosen conservatively. "Atoms" refers to atomic clusters of instructions (namely, updatevoterweight? + vote)
//     const delegatorBatches = chunks(delegatorCastVoteAtoms, 2).map((x) =>
//       x.flat()
//     );
//     const actions = [batch1, ...delegatorBatches].map((ixs) => ({
//       instructionsSet: ixs.map((ix) => ({
//         transactionInstruction: ix,
//         signers: chatMessageSigners.filter((kp) =>
//           ix.keys.find((key) => key.isSigner && key.pubkey.equals(kp.publicKey))
//         ),
//       })),
//       sequenceType: SequenceType.Parallel,
//     }));

//     await sendTransactionsV3({
//       connection,
//       wallet,
//       transactionInstructions: actions,
//       callbacks: {
//         afterAllTxConfirmed: () => {
//           if (runAfterConfirmation) {
//             runAfterConfirmation();
//           }
//         },
//       },
//     });
//   }

//   // we need to chunk instructions
//   if (isHeliumVoter) {
//     // @asktree: I'm aware of no rationale for chunking in this particular manner
//     const chunkerz = chunks(
//       [
//         ...pluginCastVoteIxs,
//         ...castVoteIxs,
//         ...pluginPostMessageIxs,
//         ...postMessageIxs,
//       ],
//       2
//     );

//     const ixsChunks = chunkerz.map((txBatch, batchIdx) => {
//       return {
//         instructionsSet: txBatchesToInstructionSetWithSigners(
//           txBatch,
//           message ? [[], chatMessageSigners] : [], // seeing signer related bugs when posting chat? This is likely culprit
//           batchIdx
//         ),
//         sequenceType: SequenceType.Sequential,
//       };
//     });

//     await sendTransactionsV3({
//       connection,
//       wallet,
//       transactionInstructions: ixsChunks,
//       callbacks: {
//         afterAllTxConfirmed: () => {
//           if (runAfterConfirmation) {
//             runAfterConfirmation();
//           }
//         },
//       },
//     });
//   }

//   // we need to chunk instructions
//   if (isNftVoter) {
//     const { openNftVotingCountingModal, closeNftVotingCountingModal } =
//       useNftProposalStore.getState();

//     const createNftVoteTicketsChunks = chunks(
//       [...createCastNftVoteTicketIxs, ...createPostMessageTicketIxs],
//       1
//     );

//     // last element of pluginCastVoteIxs
//     const last = pluginCastVoteIxs[pluginCastVoteIxs.length - 1];
//     // everything except last element of pluginCastVoteIxs
//     const nftCountingChunks = pluginCastVoteIxs.slice(0, -1);
//     const voteChunk = [last, ...castVoteIxs]; // the final nft-voter.CastNftVote instruction has to in same tx as the vote
//     const chunkedIxs = [...chunks(nftCountingChunks, 2), voteChunk].filter(
//       (x) => x.length > 0
//     );

//     // note that we are not chunking postMessageIxs, not yet supported (somehow)

//     const instructionsChunks = [
//       ...createNftVoteTicketsChunks.map((txBatch, batchIdx) => {
//         return {
//           instructionsSet: txBatchesToInstructionSetWithSigners(
//             txBatch,
//             [],
//             batchIdx
//           ),
//           sequenceType: SequenceType.Parallel,
//         };
//       }),
//       ...chunkedIxs.map((txBatch, batchIdx) => {
//         return {
//           instructionsSet: txBatchesToInstructionSetWithSigners(
//             txBatch,
//             message ? [[], chatMessageSigners] : [], // seeing signer related bugs when posting chat? This is likely culprit
//             batchIdx
//           ),
//           sequenceType: SequenceType.Sequential,
//         };
//       }),
//     ];
//     const totalVoteCost = await calcCostOfNftVote(
//       connection,
//       message,
//       instructionsChunks.length,
//       proposal.pubkey,
//       votingPlugin,
//       realm.pubkey,
//       walletPubkey
//     );
//     const hasEnoughSol = await checkHasEnoughSolToVote(
//       totalVoteCost,
//       walletPubkey,
//       connection
//     );
//     if (!hasEnoughSol) {
//       return;
//     }

//     await sendTransactionsV3({
//       connection,
//       wallet,
//       transactionInstructions: instructionsChunks,
//       callbacks: {
//         afterFirstBatchSign: () => {
//           instructionsChunks.length > 2 ? openNftVotingCountingModal() : null;
//         },
//         afterAllTxConfirmed: () => {
//           if (runAfterConfirmation) {
//             runAfterConfirmation();
//           }
//           closeNftVotingCountingModal(
//             votingPlugin.client as NftVoterClient,
//             proposal,
//             wallet.publicKey!
//           );
//         },
//       },
//     });
//   }
// }
