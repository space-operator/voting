import { Governance, Proposal, ProposalState } from '@solana/spl-governance';
import dayjs from 'dayjs';
import { BN } from 'bn.js';


// TODO not a hook
export const isInCoolOffTime = (
  proposal: Proposal | undefined,
  governance: Governance | undefined
) => {
  const mainVotingEndedAt = new BN(proposal?.signingOffAt, 'hex')
    ?.addn(governance?.config.baseVotingTime || 0)
    .toNumber();

  const votingCoolOffTime = governance?.config.votingCoolOffTime || 0;
  const canFinalizeAt = mainVotingEndedAt
    ? mainVotingEndedAt + votingCoolOffTime
    : mainVotingEndedAt;

  const endOfProposalAndCoolOffTime = canFinalizeAt
    ? dayjs(1000 * canFinalizeAt!)
    : undefined;

  const isInCoolOffTime = endOfProposalAndCoolOffTime
    ? dayjs().isBefore(endOfProposalAndCoolOffTime) &&
      mainVotingEndedAt &&
      dayjs().isAfter(mainVotingEndedAt * 1000)
    : undefined;

  return !!isInCoolOffTime && proposal!.state !== ProposalState.Defeated;
};
