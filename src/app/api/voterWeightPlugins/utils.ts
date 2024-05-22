import { Realm, Proposal, TokenOwnerRecord, MintMaxVoteWeightSource, MintMaxVoteWeightSourceType } from '@solana/spl-governance';
import { Mint } from '@solana/spl-token';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import BigNumber from "bignumber.js";
import BN from "bn.js";

/** Returns max vote weight for a proposal  */

export function getProposalMaxVoteWeight(
  realm: Realm,
  proposal: Proposal,
  governingTokenMint: Mint,
  // For vetos we want to override the proposal.governingTokenMint
  governingTokenMintPk?: PublicKey
) {
  // const prop = new Proposal(proposal);
  console.log('isVoteFinalized', proposal.isVoteFinalized);
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


/**
 * Select the wallets to determine the voter weights for as follows:
 * - If a delegator is selected, use it only
 * - If delegators are available, use them and the connected wallet (in first position)
 * - If no delegators are available, use the connected wallet only
 * @param selectedDelegator
 * @param delegators
 * @param wallet
 */
export const getWalletList = (
  selectedDelegator: PublicKey | undefined,
  delegators: TokenOwnerRecord[] | undefined,
  wallet: SignerWalletAdapter | undefined
): PublicKey[] => {
  if (!wallet?.publicKey) return [];

  // if selectedDelegator is not set, this means "yourself + all delegators"
  if (selectedDelegator !== PublicKey.default) {
    return [selectedDelegator];
  }

  if (delegators) {
    const delegatorOwners = delegators.map((d) => d.governingTokenOwner);

    return [wallet.publicKey, ...delegatorOwners];
  }

  return [wallet.publicKey];
};


/** Returns max VoteWeight for given mint and max source */
export function getMintMaxVoteWeight(
  mint: Mint,
  maxVoteWeightSource: MintMaxVoteWeightSource
) {
  console.log(
    'getMintMaxVoteWeight',
    mint,
    maxVoteWeightSource,
    maxVoteWeightSource.isFullSupply()
  );
  if (maxVoteWeightSource.isFullSupply()) {
    return mint.supply;
  }

  if (maxVoteWeightSource.type === MintMaxVoteWeightSourceType.SupplyFraction) {
    const supplyFraction = maxVoteWeightSource.getSupplyFraction();

    const maxVoteWeight = new BigNumber(supplyFraction.toString())
      .multipliedBy(mint.supply.toString())
      .shiftedBy(-MintMaxVoteWeightSource.SUPPLY_FRACTION_DECIMALS);

    return new BN(maxVoteWeight.dp(0, BigNumber.ROUND_DOWN).toString());
  } else {
    // absolute value
    return maxVoteWeightSource.value;
  }
}

