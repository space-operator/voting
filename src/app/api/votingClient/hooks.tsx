import { useWallet } from '@solana/wallet-adapter-react';
import { useRealmVoterWeightPlugins } from '../voterWeightPlugins/hooks';
import { useRealmFromParams } from '../realm/hooks';
import { GovernanceRole } from '@/types/governance';
import { PublicKey } from '@solana/web3.js';
import {
  communityDelegatorAtom,
  councilDelegatorAtom,
} from '@/components/SelectPrimaryDelegators';
import { useAtom } from 'jotai';

/**
 * The Voting Client encapsulates plugin-specific voting logic not currently encapsulated in the individual plugins, and exposed by the
 * useVoterWeightPlugins hook.
 * As such, it should be used only if the useVoterWeightPlugins hook is insufficient, or in places where access to hooks is not available.
 * Since in the latter cases, it is not always clear which governance role to use, it exposes a callback to get the correct client for a given role.
 */
// export const useVotingClients = () => {
//   const voterWeightPluginDetailsForCommunity =
//     useRealmVoterWeightPlugins('community');
//   const voterWeightPluginDetailsForCouncil =
//     useRealmVoterWeightPlugins('council');
//   const { data: realm } = useRealmFromParams();
//   const wallet = useWallet().wallet.adapter;

//   const [selectedCommunityDelegator, __] = useAtom(communityDelegatorAtom);

//   const [selectedCouncilDelegator, _] = useAtom(councilDelegatorAtom);

//   const councilWallet = selectedCouncilDelegator ?? wallet?.publicKey;
//   const communityWallet = selectedCommunityDelegator ?? wallet?.publicKey;

//   // This is not cached at present, but should be efficient, as the contents (plugins) are cached.
//   // If this becomes a performance issue, we should add react-query here.
//   return (kind: GovernanceRole) => {
//     // messy logic to get the "legacy" client out of the plugins.
//     // if there's more than one, use the first one.
//     // this only works if the legacy plugins don't support chaining anyway.
//     // if they did, then we would have to call relinquish on whichever plugin supported it
//     const voterWeightPluginDetails =
//       kind === 'community'
//         ? voterWeightPluginDetailsForCommunity
//         : voterWeightPluginDetailsForCouncil;
//     const client = voterWeightPluginDetails.plugins?.voterWeight.length
//       ? voterWeightPluginDetails.plugins.voterWeight[0].client
//       : undefined;
//     const wallet = kind === 'community' ? communityWallet : councilWallet;

//     return new VotingClient({
//       client: client,
//       realm: realm,
//       walletPk: wallet,
//       voterWeightPluginDetails,
//     });
//   };
// };

// If we know the governingTokenMint, we can deduce the role.
// This is a little convoluted, but necessary in places, until we decommission the voting client.
// export const useVotingClientForGoverningTokenMint = (
//   governingTokenMint: PublicKey | undefined
// ) => {
//   const clients = useVotingClients();
//   const { data: realm } = useRealmFromParams();
//   // default to community if there is no council or the realm or governingTokenMint are not yet loaded
//   const kind =
//     governingTokenMint &&
//     realm?.account.config.councilMint?.equals(governingTokenMint)
//       ? 'council'
//       : 'community';

//   return clients(kind);
// };
