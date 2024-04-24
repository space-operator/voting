import {
  FilterState,
  VotingTypes,
  mapFromProposal,
} from '@/components/filter-popover';
import { ProgramAccount, Proposal, Realm } from '@solana/spl-governance';

export const filterProposals = (
  proposals: ProgramAccount<Proposal>[],
  filters: FilterState
  // sorting: Sorting,
  // realm: ProgramAccount<Realm> | undefined,
  // governances: Record<string, ProgramAccount<Governance>>,
  // councilMint: MintInfo | undefined,
  // communityMint: MintInfo | undefined
) => {
  // const sortProposals = (proposalA: ProgramAccount<Proposal>, proposalB: ProgramAccount<Proposal>) => {
  //   const getTime = (proposal: ProgramAccount<Proposal>) =>
  //     proposal.account.votingCompletedAt ||
  //     proposal.account.signingOffAt ||
  //     proposal.account.draftAt ||
  //     new BN(0);

  //   if (sorting.completed_at) {
  //     const modifier = sorting.completed_at === SORTING_OPTIONS.ASC ? 1 : -1;
  //     return modifier * getTime(proposalA).sub(getTime(proposalB)).toNumber();
  //   }

  //   if (sorting.signedOffAt) {
  //     const modifier = sorting.signedOffAt === SORTING_OPTIONS.ASC ? 1 : -1;
  //     return modifier * (proposalA.account.signingOffAt || new BN(0)).sub(proposalB.account.signingOffAt || new BN(0)).toNumber();
  //   }

  //   return 0;
  // };

  const filterProposal = (proposal: ProgramAccount<Proposal>) => {
    if (!proposal.account?.state) return;

    const state = mapFromProposal(proposal.account.state);
    console.log(state, filters[state]);
    if (!filters[state]) {
      return false;
    }

    //   if (state === ProposalState.Succeeded && !filters.Completed && !hasInstructions(proposal.account)) {
    //     return false;
    //   }

    //   if (state === ProposalState.Executing && !filters.Executable) {
    //     return false;
    //   }

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

  return (
    proposals
      //   .sort(([, proposalA], [, proposalB]) => sortProposals(proposalA, proposalB))
      .filter(filterProposal)
  );
};
