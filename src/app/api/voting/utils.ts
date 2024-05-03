import { getMintMaxVoteWeight } from '@/models/voteWeights';

import { Realm, Proposal } from '@solana/spl-governance';
import { Mint } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

/** Returns max vote weight for a proposal  */

export function getProposalMaxVoteWeight(
  realm: Realm,
  proposal: Proposal,
  governingTokenMint: Mint,
  // For vetos we want to override the proposal.governingTokenMint
  governingTokenMintPk?: PublicKey
) {
  // For finalized proposals the max is stored on the proposal in case it can change in the future
  if (proposal.isVoteFinalized() && proposal.maxVoteWeight) {
    return proposal.maxVoteWeight;
  }

  // Council votes are currently not affected by MaxVoteWeightSource
  if (
    (
      governingTokenMintPk ?? new PublicKey(proposal.governingTokenMint)
    ).toBase58() === realm.config.councilMint?.toBase58()
  ) {
    return governingTokenMint.supply;
  }
  const maxVoteWeight = getMintMaxVoteWeight(
    governingTokenMint,
    realm.config.communityMintMaxVoteWeightSource
  );
  console.log('maxVoteWeight', maxVoteWeight);
  return maxVoteWeight;
}
