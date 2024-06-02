import {
  FilterState,
  VotingTypes,
  mapFromProposal,
} from '@/components/filter-popover';
import { hasInstructions } from '@/components/proposal/ProposalStateBadge';
import {
  ProgramAccount,
  Proposal,
  ProposalOption,
  ProposalState,
  Realm,
  VoteType,
  VoteTypeKind,
} from '@solana/spl-governance';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export enum SORTING_OPTIONS {
  ASC,
  DESC,
  NONE,
}

export type Sorting = {
  completed_at: SORTING_OPTIONS;
  signedOffAt: SORTING_OPTIONS;
};

export const InitialSorting = {
  completed_at: SORTING_OPTIONS.DESC,
  signedOffAt: SORTING_OPTIONS.DESC,
};

export const filterProposals = (
  proposals: ProgramAccount<Proposal>[],
  filters: FilterState,
  sorting: Sorting
  // realm: ProgramAccount<Realm> | undefined,
  // governances: Record<string, ProgramAccount<Governance>>,
  // councilMint: MintInfo | undefined,
  // communityMint: MintInfo | undefined
) => {
  if (!Array.isArray(proposals)) {
    return []; // Return an empty array or handle the error as appropriate
  }
  const sortProposals = (
    proposalA: ProgramAccount<Proposal>,
    proposalB: ProgramAccount<Proposal>
  ) => {
  // TODO finish. only sorts with votingCompletedAt and signingOffAt
  const getTime = (proposal: ProgramAccount<Proposal>, field: 'votingCompletedAt' | 'signingOffAt') => {
    const value = proposal.account[field];
    return value ? new BN(value, 'hex') : null;
  };

  let timeA, timeB;
  let modifier = 0;

  if (sorting.completed_at !== SORTING_OPTIONS.NONE) {
    timeA = getTime(proposalA, 'votingCompletedAt');
    timeB = getTime(proposalB, 'votingCompletedAt');
    modifier = sorting.completed_at === SORTING_OPTIONS.ASC ? 1 : -1;
  } else if (sorting.signedOffAt !== SORTING_OPTIONS.NONE) {
    timeA = getTime(proposalA, 'signingOffAt');
    timeB = getTime(proposalB, 'signingOffAt');
    modifier = sorting.signedOffAt === SORTING_OPTIONS.ASC ? 1 : -1;
  }

  // If either time is null, handle it by defaulting to a large number to ensure it sorts last
  if (!timeA || !timeB) {
    if (!timeA && !timeB) return 0; // Both are null, consider equal
    if (!timeA) return 1 * modifier; // A is null, sort it last
    if (!timeB) return -1 * modifier; // B is null, sort it last
  }

  // Compare the times if both are available
  return modifier * timeA.sub(timeB).toNumber();

    // const getTime = (proposal: ProgramAccount<Proposal>) =>
    //   new BN(proposal.account.votingCompletedAt, 'hex') ||
    //   new BN(proposal.account.signingOffAt, 'hex') ||
    //   new BN(proposal.account.draftAt, 'hex') ||
    //   new BN(0);

    // if (sorting.completed_at !== SORTING_OPTIONS.NONE) {
    //   const modifier = sorting.completed_at === SORTING_OPTIONS.ASC ? 1 : -1;
    //   return modifier * getTime(proposalA).sub(getTime(proposalB)).toNumber();
    // }

    // if (sorting.signedOffAt !== SORTING_OPTIONS.NONE) {
    //   const modifier = sorting.signedOffAt === SORTING_OPTIONS.ASC ? 1 : -1;
    //   return (
    //     modifier *
    //     (new BN(proposalA.account.signingOffAt, 'hex') || new BN(0))
    //       .sub(new BN(proposalB.account.signingOffAt, 'hex') || new BN(0))
    //       .toNumber()
    //   );
    // }

    // return 0;
  };

  const filterProposal = (proposal: ProgramAccount<Proposal>) => {
    const state = mapFromProposal(
      proposal.account.state
    ) as unknown as ProposalState;

    if (!filters[state]) {
      return false;
    }

    if (
      state === ProposalState.Succeeded &&
      !filters.Completed &&
      !hasInstructions(proposal.account)
    ) {
      return false;
    }

    if (state === ProposalState.Executing && !filters.Executable) {
      return false;
    }

    //   if (state === ProposalState.Voting && filters.withoutQuorum) {
    //     const proposalMint = proposal.account.governingTokenMint.toBase58() === realm?.account.communityMint.toBase58() ? communityMint : councilMint;
    //     const isCommunityVote = proposal.account.governingTokenMint.toBase58() === realm?.account.communityMint.toBase58();
    //     const governance = governances[proposal.account.governance.toBase58()].account;
    //     const voteThresholdPct = isCommunityVote ? governance.config.communityVoteThreshold.value : governance.config.councilVoteThreshold.value;
    //     const minimumYesVotes = fmtTokenAmount(proposalMint!.supply, proposalMint!.decimals) * (voteThresholdPct / 100);

    //     return fmtTokenAmount(proposal.account.getYesVoteCount(), proposalMint!.decimals) < minimumYesVotes && !proposal.account.hasVoteTimeEnded(governance);
    //   }

    return true;
  };

  return proposals
    .filter(filterProposal)
    .sort((proposalA, proposalB) => sortProposals(proposalA, proposalB))
    .map((p) => {
      // rebuild
      const pubkey = new PublicKey(p.pubkey);
      const rebuilt: ProgramAccount<Proposal> = {
        ...p,
        pubkey,
        account: new Proposal({
          ...p.account,
          accountType: p.account.accountType,
          governance: new PublicKey(p.account.governance),
          governingTokenMint: new PublicKey(p.account.governingTokenMint),
          state: p.account.state,
          tokenOwnerRecord: new PublicKey(p.account.tokenOwnerRecord),
          signatoriesCount: p.account.signatoriesCount,
          signatoriesSignedOffCount: p.account.signatoriesSignedOffCount,
          descriptionLink: p.account.descriptionLink,
          name: p.account.name,
          yesVotesCount: new BN(p.account.yesVotesCount, 'hex'),
          noVotesCount: new BN(p.account.noVotesCount, 'hex'),
          instructionsExecutedCount: p.account.instructionsExecutedCount,
          instructionsCount: p.account.instructionsCount,
          instructionsNextIndex: p.account.instructionsNextIndex,
          voteType: new VoteType({
            type: p.account.voteType.type,
            choiceType: p.account.voteType.choiceType,
            minVoterOptions: p.account.voteType.minVoterOptions,
            maxVoterOptions: p.account.voteType.maxVoterOptions,
            maxWinningOptions: p.account.voteType.maxWinningOptions,
          }),
          options: p.account.options.map(
            (option) =>
              new ProposalOption({
                label: option.label,
                voteWeight: new BN(option.voteWeight, 'hex'),
                voteResult: option.voteResult,
                instructionsExecutedCount: option.instructionsExecutedCount,
                instructionsCount: option.instructionsCount,
                instructionsNextIndex: option.instructionsNextIndex,
              })
          ),
          denyVoteWeight: p.account.denyVoteWeight
            ? new BN(p.account.denyVoteWeight, 'hex')
            : undefined,
          reserved1: p.account.reserved1,
          abstainVoteWeight: p.account.abstainVoteWeight
            ? new BN(p.account.abstainVoteWeight, 'hex')
            : undefined,
          startVotingAt: p.account.startVotingAt
            ? new BN(p.account.startVotingAt, 'hex')
            : null,
          maxVotingTime: p.account.maxVotingTime,
          draftAt: new BN(p.account.draftAt, 'hex'),
          signingOffAt: p.account.signingOffAt
            ? new BN(p.account.signingOffAt, 'hex')
            : null,
          votingAt: p.account.votingAt
            ? new BN(p.account.votingAt, 'hex')
            : null,
          votingAtSlot: p.account.votingAtSlot
            ? new BN(p.account.votingAtSlot, 'hex')
            : null,
          votingCompletedAt: p.account.votingCompletedAt
            ? new BN(p.account.votingCompletedAt, 'hex')
            : null,
          executingAt: p.account.executingAt
            ? new BN(p.account.executingAt, 'hex')
            : null,
          closedAt: p.account.closedAt
            ? new BN(p.account.closedAt, 'hex')
            : null,
          executionFlags: p.account.executionFlags,
          maxVoteWeight: p.account.maxVoteWeight
            ? new BN(p.account.maxVoteWeight, 'hex')
            : null,
          voteThreshold: p.account.voteThreshold,
          vetoVoteWeight: new BN(p.account.vetoVoteWeight, 'hex'),
        }),
        owner: new PublicKey(p.owner),
      };
      return rebuilt;
    });
};
