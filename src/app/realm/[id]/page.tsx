import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  QueryErrorResetBoundary,
} from '@tanstack/react-query';

import React, { Suspense } from 'react';

import { FilterPopover } from '@/components/filter-popover';
import { DisplayProposals } from '@/components/display-proposals';
import {
  CURRENT_RPC_ENDPOINT,
  DEVNET_RPC_ENDPOINT,
  MAINNET_RPC_ENDPOINT,
} from '@/constants/endpoints';
import { ProgramAccount, Proposal } from '@solana/spl-governance';
import { prefetchAllProposalsByRealm } from '@/app/api/proposals/queries';
import { GovernancePowerCard } from '@/components/GovernancePower/GovernancePowerCard';

export default async function RealmPage({
  params,
}: {
  params: { id: string };
}) {
  const realmPk = params.id;
  const queryClient = new QueryClient();

  // TODO fix endpoint
  await queryClient.prefetchQuery({
    queryKey: ['proposals', realmPk, CURRENT_RPC_ENDPOINT],
    queryFn: async () =>
      await prefetchAllProposalsByRealm(realmPk, CURRENT_RPC_ENDPOINT).then(
        JSON.parse
      ),
    staleTime: 60 * 1000 * 60, // 1 hour
  });

  return (
    <div className='p-4'>
      <div className='text-xl font-bold my-4'>Voting Power</div>

      <Suspense fallback={<div>Loading...</div>}>
        <GovernancePowerCard />
      </Suspense>
      <div className='text-xl font-bold my-4'>Proposals</div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <QueryErrorResetBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            <div className='flex justify-end mb-4'>
              <FilterPopover />
            </div>
            <DisplayProposals />
          </Suspense>
        </QueryErrorResetBoundary>
      </HydrationBoundary>
    </div>
  );
}
