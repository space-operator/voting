'use client';

import {
  ProgramAccount,
  Proposal,
  ProposalState,
  Realm,
  VoteType,
  VoteTypeKind,
} from '@solana/spl-governance';
import { useMaxVoteRecord } from '../voterWeightPlugins/hooks';
import { useProgramVersion } from '@/app/api/programVersion/hooks';
import { getProposalMaxVoteWeight } from '../voterWeightPlugins/utils';
import { fmtBnMintDecimals, fmtBnMintDecimalsUndelimited } from '@/utils/units';
import { calculatePct } from '@/utils/formatting';
import BN from 'bn.js';
import { useMintInfo } from '../token/hooks';
import { useGovernance } from '../governance/hooks';
import { PublicKey } from '@solana/web3.js';

export interface ProposalVotesResult {
  _programVersion: number | undefined;
  voteThresholdPct: number | undefined;
  yesVotePct: number | undefined;
  yesVoteProgress: number | undefined;
  yesVoteCount: number | undefined;
  noVoteCount: number | undefined;
  relativeYesVotes: number | undefined;
  relativeNoVotes: number | undefined;
  minimumYesVotes: number | undefined;
  yesVotesRequired: number | undefined;
  veto?: {
    votesRequired: string | undefined;
    voteCount: string;
    voteProgress: number | undefined;
  };
}

// https://github.com/solana-labs/governance-ui/blob/f36f7bb95bbeef457f0da4afef904c00768a2bd1/hooks/useProposalVotes.tsx#L16
export default function useProposalVotes(
  proposal: Proposal,
  realm: ProgramAccount<Realm>
): ProposalVotesResult {
  const { data: mint } = useMintInfo(realm.account.communityMint);
  const { data: councilMint } = useMintInfo(realm.account.config.councilMint);

  // TODO fix delegator
  const maxVoteRecord = useMaxVoteRecord();
  const governance = useGovernance(new PublicKey(proposal.governance)).data
    .account;

  // TODO add pyth - This is always undefined except for Pyth
  const pythScalingFactor: number | undefined = 1; //usePythScalingFactor();

  const programVersion = useProgramVersion();
  const proposalMint =
    new PublicKey(proposal.governingTokenMint).toBase58() ===
    realm.account.communityMint.toBase58()
      ? mint
      : councilMint;

  // TODO: optimize using memo
  if (
    !realm ||
    !proposal ||
    !governance ||
    !proposalMint ||
    !programVersion ||
    proposal.voteType.type != VoteTypeKind.SingleChoice
  )
    return {
      _programVersion: undefined,
      voteThresholdPct: undefined,
      yesVotePct: undefined,
      yesVoteProgress: undefined,
      yesVoteCount: undefined,
      noVoteCount: undefined,
      minimumYesVotes: undefined,
      yesVotesRequired: undefined,
      relativeNoVotes: undefined,
      relativeYesVotes: undefined,
    };

  const isCommunityVote =
    new PublicKey(proposal.governingTokenMint).toBase58() ===
    realm.account.communityMint.toBase58();

  // TODO ??
  const isPluginCommunityVoting = maxVoteRecord && isCommunityVote;

  const voteThresholdPct = isCommunityVote
    ? governance.config.communityVoteThreshold.value
      ? governance.config.communityVoteThreshold.value
      : 0
    : programVersion > 2
    ? governance.config.councilVoteThreshold.value || 0
    : governance.config.communityVoteThreshold.value || 0;

  if (voteThresholdPct === undefined)
    throw new Error(
      'Proposal has no vote threshold (this shouldnt be possible)'
    );

  // note this can be WRONG if the proposal status is vetoed
  const maxVoteWeight = isPluginCommunityVoting
    ? maxVoteRecord.account.maxVoterWeight
    : getProposalMaxVoteWeight(realm.account, proposal, proposalMint);


  const minimumYesVotes =
    parseFloat(
      fmtBnMintDecimalsUndelimited(maxVoteWeight as BN, proposalMint.decimals)
    ) *
    (voteThresholdPct / 100);


  // Needed workarounds to get the correct values and attached methods
  const yesVote = new BN(proposal.getYesVoteCount(), 'hex');
  const noVote = new BN(proposal.getNoVoteCount(), 'hex');

  const yesVotePct = calculatePct(
    yesVote,
    typeof maxVoteWeight === 'bigint'
      ? new BN(maxVoteWeight.toString())
      : typeof maxVoteWeight === 'string'
      ? new BN(maxVoteWeight, 'hex')
      : maxVoteWeight,
    proposal
  );
  const isMultiProposal = proposal?.options?.length > 1;

  const yesVoteCount = !isMultiProposal
    ? parseFloat(fmtBnMintDecimalsUndelimited(yesVote, proposalMint.decimals))
    : 0;

  //
  const noVoteCount = !isMultiProposal
    ? parseFloat(fmtBnMintDecimalsUndelimited(noVote, proposalMint.decimals))
    : 0;

  const totalVoteCount = yesVoteCount + noVoteCount;

  const getRelativeVoteCount = (voteCount: number) =>
    totalVoteCount === 0 ? 0 : (voteCount / totalVoteCount) * 100;

  const relativeYesVotes = getRelativeVoteCount(yesVoteCount);
  const relativeNoVotes = getRelativeVoteCount(noVoteCount);
  const rawYesVotesRequired = minimumYesVotes - yesVoteCount;
  const actualVotesRequired = rawYesVotesRequired < 0 ? 0 : rawYesVotesRequired;
  const yesVoteProgress = actualVotesRequired
    ? 100 - (actualVotesRequired / minimumYesVotes) * 100
    : 100;

  const yesVotesRequired =
    proposalMint.decimals == 0
      ? Math.ceil(actualVotesRequired)
      : actualVotesRequired;

  const results = {
    voteThresholdPct,
    yesVotePct,
    yesVoteProgress,
    yesVoteCount: Math.floor(yesVoteCount * (pythScalingFactor || 1)),
    noVoteCount: Math.floor(noVoteCount * (pythScalingFactor || 1)),
    relativeYesVotes,
    relativeNoVotes,
    minimumYesVotes,
    yesVotesRequired: yesVotesRequired * (pythScalingFactor || 1),
  };

  // @asktree: you may be asking yourself, "is this different from the more succinct way to write this?"
  // the answer is yes, in typescript it is different and this lets us use discriminated unions properly.
  if (programVersion === 1)
    return {
      _programVersion: programVersion,
      ...results,
    };
  if (programVersion === 2)
    return {
      _programVersion: programVersion,
      ...results,
    };

  // VETOS
  const vetoThreshold = isCommunityVote
    ? governance.config.councilVetoVoteThreshold
    : governance.config.communityVetoVoteThreshold;

  if (vetoThreshold.value === undefined)
    return {
      _programVersion: programVersion,
      ...results,
      veto: undefined,
    };

  const vetoMintInfo = isCommunityVote ? councilMint : mint;
  const vetoMintPk = isCommunityVote
    ? realm.account.config.councilMint
    : realm.account.communityMint;

  // This represents an edge case where councilVetoVoteThreshold is defined but there is no councilMint
  if (vetoMintInfo === undefined || vetoMintPk === undefined)
    return {
      _programVersion: programVersion,
      ...results,
      veto: undefined,
    };

  const vetoVoteCount = fmtBnMintDecimals(
    proposal.vetoVoteWeight,
    vetoMintInfo.decimals
  );
  // its impossible to accurately know the veto votes required for a finalized, non-vetoed proposal
  if (proposal.isVoteFinalized() && proposal.state !== ProposalState.Vetoed)
    return {
      _programVersion: programVersion,
      ...results,
      veto: {
        votesRequired: undefined,
        voteCount: vetoVoteCount,
        voteProgress: undefined,
      },
    };

  const isPluginCommunityVeto = maxVoteRecord && !isCommunityVote;

  const vetoMaxVoteWeight = isPluginCommunityVeto
    ? maxVoteRecord.account.maxVoterWeight
    : getProposalMaxVoteWeight(
        realm.account,
        proposal,
        vetoMintInfo,
        vetoMintPk
      );

  const vetoVoteProgress = calculatePct(
    proposal.vetoVoteWeight,
    vetoMaxVoteWeight as BN,
    proposal
  );

  const minimumVetoVotes = new BN(vetoMaxVoteWeight as BN)
    .div(new BN(10).pow(new BN(vetoMintInfo.decimals ?? 0)))
    .muln(vetoThreshold.value / 100);

  const vetoVotesRequired = minimumVetoVotes
    .subn(parseFloat(vetoVoteCount))
    .toString();

  return {
    _programVersion: programVersion,
    ...results,
    veto: {
      votesRequired: vetoVotesRequired,
      voteCount: vetoVoteCount,
      voteProgress: vetoVoteProgress,
    },
  };
}
