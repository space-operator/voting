'use client';

import { useRealmFromParams } from '@/app/api/realm/hooks';
import { useRealmConfig } from '@/app/api/realmConfig/hooks';
import { getVotingPowerType } from '@/app/api/voting/query';
import { PluginName } from '@/constants/plugins';
import { GoverningTokenType } from '@solana/spl-governance';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ChevronRightIcon } from 'lucide-react';
import { useAsync } from 'react-async-hook';
import { VotingPowerCards } from './VotingPowerCards';
import VanillaVotingPower from './GovernancePower/VanillaVotingPower';
import { Deposit } from './GovernancePower/Deposit';
import { Suspense } from 'react';
import { useRealmVoterWeightPlugins } from '@/app/api/voterWeightPlugins/hooks';

//   const GovernancePowerTitle = () => {
//     const { symbol } = useRouter().query
//     const { fmtUrlWithCluster } = useQueryContext()
//     const connected = useWalletOnePointOh()?.connected ?? undefined

//     return (
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="mb-0">My governance power</h3>
//         <Link href={fmtUrlWithCluster(`/dao/${symbol}/account/me`)}>
//           <a
//             className={`default-transition flex items-center text-fgd-2 text-sm transition-all hover:text-fgd-3 ${
//               !connected ? 'opacity-50 pointer-events-none' : ''
//             }`}
//           >
//             View
//             <ChevronRightIcon className="flex-shrink-0 w-6 h-6" />
//           </a>
//         </Link>
//       </div>
//     )
//   }

export const GovernancePowerCard = () => {
  const connected = useWallet();

  const { isReady: communityIsReady } = useRealmVoterWeightPlugins('community');
  const { isReady: councilIsReady } = useRealmVoterWeightPlugins('council');
  const isReady = communityIsReady && councilIsReady;

  const { data: realmConfig } = useRealmConfig();

  return (
    <div>
      {/* <GovernancePowerTitle /> */}
      {!connected ? (
        <div className={'text-xs text-white/50 mt-8'}>
          Connect your wallet to see governance power
        </div>
      ) : !isReady ? (
        <>
          <div className='h-12 mb-4 rounded-lg animate-pulse bg-bkg-3' />
          <div className='h-10 rounded-lg animate-pulse bg-bkg-3' />
        </>
      ) : (
        <div className='flex flex-col gap-2'>
          {realmConfig?.account.communityTokenConfig.tokenType ===
          GoverningTokenType.Dormant ? null : (
            <GovernancePowerForRole role='community' />
          )}
          {realmConfig?.account.councilTokenConfig.tokenType ===
          GoverningTokenType.Dormant ? null : (
            <GovernancePowerForRole
              role='council'
              hideIfZero={
                realmConfig?.account.communityTokenConfig.tokenType !==
                GoverningTokenType.Dormant
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

type VotingPowerDisplayType = PluginName | 'composite';

export default function GovernancePowerForRole({
  role,
  ...props
}: {
  role: 'community' | 'council';
  hideIfZero?: boolean;
  className?: string;
}) {
  const { connection } = useConnection();
  const realmPk = useRealmFromParams().data.pubkey;
  const { plugins } = useRealmVoterWeightPlugins(role);
  const wallet = useWallet().wallet?.adapter;
  const connected = !!wallet?.connected;

  const { result: kind } = useAsync<
    VotingPowerDisplayType | undefined
  >(async () => {
    if (realmPk === undefined) return undefined;
    // if there are multiple plugins, show the generic plugin voting power
    if ((plugins?.voterWeight.length ?? 0) > 1) return 'composite';
    return getVotingPowerType(connection, realmPk, role);
  }, [connection, realmPk, role]);

  if (connected && kind === undefined && !props.hideIfZero) {
    return (
      <div className='animate-pulse bg-bkg-1 col-span-1 h-[76px] rounded-lg' />
    );
  }
  console.log(role, kind, props);
  return (
    <>
      {role === 'community' ? (
        <>
          <VotingPowerCards role={role} {...props} />
        </>
      ) : // council
      kind === 'vanilla' ? (
        <div>
          <VanillaVotingPower role='council' {...props} />
          <Deposit role='council' />
        </div>
      ) : null}
    </>
  );
}
