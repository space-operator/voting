// Exposes a 'realms-friendly' version of the generic useVoterWeightPlugins hook,
// which knows how to get the current realm, governance mint, and wallet public keys
// this simplifies usage across the realms codebase
import { useVoterWeightPlugins } from '../../../../_external/VoterWeightPlugins';
// import { useSelectedDelegatorStore } from '../stores/useSelectedDelegatorStore';
import { UseVoterWeightPluginsReturnType } from '../../../../_external/VoterWeightPlugins/useVoterWeightPlugins';
import { PublicKey } from '@solana/web3.js';
import { CalculatedWeight } from '../../../../_external/VoterWeightPlugins/lib/types';
import { useDelegators } from '@/app/api/delegators/hooks';
import { BN_ZERO, getMaxVoterWeightRecord } from '@solana/spl-governance';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { useRealmFromParams } from '../realm/hooks';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { GovernanceRole } from '@/types/governance';
import { useAtomValue } from 'jotai';
import {
  communityDelegatorAtom,
  councilDelegatorAtom,
} from '@/components/SelectPrimaryDelegators';
import { useAsync } from 'react-async-hook';
import { getWalletList } from './utils';

export type UseRealmVoterWeightPluginsReturnType =
  UseVoterWeightPluginsReturnType & {
    totalCalculatedVoterWeight: CalculatedWeight | undefined;
    voterWeightForWallet: (
      walletPublicKey: PublicKey
    ) => CalculatedWeight | undefined;
    voterWeightPkForWallet: (
      walletPublicKey: PublicKey
    ) => PublicKey | undefined;
  };

export const useRealmVoterWeightPlugins = (
  role: GovernanceRole = 'community'
): UseRealmVoterWeightPluginsReturnType => {
  const { data: realm } = useRealmFromParams();
  const { wallet } = useWallet();
  const walletAdapter = wallet?.adapter as SignerWalletAdapter;

  const governanceMintPublicKey =
    role === 'community'
      ? realm?.account.communityMint
      : realm?.account.config.councilMint;

  const selectedDelegator = useAtomValue(
    role === 'community' ? communityDelegatorAtom : councilDelegatorAtom
  );

  const delegators = useDelegators(role);

  const walletPublicKeys = getWalletList(
    selectedDelegator,
    delegators?.map((programAccount) => programAccount.account),
    walletAdapter
  );

  // if a delegator is selected, use it, otherwise use the currently connected wallet
  const nonAggregatedResult = useVoterWeightPlugins({
    realmPublicKey: realm?.pubkey,
    governanceMintPublicKey,
    walletPublicKeys,
  });

  const totalCalculatedVoterWeight = nonAggregatedResult.calculatedVoterWeights
    ?.length
    ? nonAggregatedResult.calculatedVoterWeights?.reduce((acc, weight) => {
        if (!acc) return weight;

        const initialValue =
          weight.initialValue === null
            ? acc.initialValue === null
              ? null
              : acc.initialValue
            : weight.initialValue.add(acc.initialValue ?? BN_ZERO);
        const value =
          weight.value === null
            ? acc.value === null
              ? null
              : acc.value
            : weight.value.add(acc.value ?? BN_ZERO);
        // Note - voter-specific details (e.g. plugin weights) are not aggregated and just use the first one
        const details = acc.details;

        return {
          details,
          initialValue,
          value,
        };
      })
    : undefined;
  // console.log('totalCalculatedVoterWeight', totalCalculatedVoterWeight);

  // This requires that the index of the wallet in the list of wallets remains consistent with the output voter weights,
  // while not ideal, this is simpler than the alternative, which would be to return a map of wallet public keys to voter weights
  // or something similar.
  const voterWeightForWallet = (
    walletPublicKey: PublicKey
  ): CalculatedWeight | undefined => {
    const walletIndex = walletPublicKeys.findIndex((pk) =>
      pk.equals(walletPublicKey)
    );
    if (walletIndex === -1) return undefined; // the wallet is not one of the ones passed in
    return nonAggregatedResult.calculatedVoterWeights?.[walletIndex];
  };

  const voterWeightPkForWallet = (
    walletPublicKey: PublicKey
  ): PublicKey | undefined => {
    const walletIndex = walletPublicKeys.findIndex((pk) =>
      pk.equals(walletPublicKey)
    );
    if (walletIndex === -1) return undefined; // the wallet is not one of the ones passed in
    return nonAggregatedResult.voterWeightPks?.[walletIndex];
  };

  // console.log(
  //   'useRealmVoterWeightPlugins',
  //   nonAggregatedResult,
  //   totalCalculatedVoterWeight
  // );
  return {
    ...nonAggregatedResult,
    totalCalculatedVoterWeight,
    voterWeightForWallet,
    voterWeightPkForWallet,
  };
};

// Get the current weights for the community and council governances - should be used in cases where the realm is known but the choice of governance is not,
// e.g. when creating a proposal
export const useRealmVoterWeights = () => {
  const {
    calculatedMaxVoterWeight: communityMaxWeight,
    totalCalculatedVoterWeight: communityWeight,
  } = useRealmVoterWeightPlugins('community');

  const {
    calculatedMaxVoterWeight: councilMaxWeight,
    totalCalculatedVoterWeight: councilWeight,
  } = useRealmVoterWeightPlugins('council');

  return {
    communityMaxWeight,
    communityWeight,
    councilMaxWeight,
    councilWeight,
  };
};

export const useMaxVoteRecord = () => {
  const { connection } = useConnection();
  const { maxVoterWeightPk } = useRealmVoterWeightPlugins();

  const maxVoteWeightRecord = useAsync(
    async () => maxVoterWeightPk && getMaxVoterWeightRecord(connection, maxVoterWeightPk),
    [maxVoterWeightPk?.toBase58()]
  );
  return maxVoteWeightRecord.result;
};

