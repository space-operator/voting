import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  QueryErrorResetBoundary,
} from '@tanstack/react-query';

import React, { Suspense } from 'react';

import { FilterPopover } from '@/components/filter-popover';
import { DisplayProposals } from '@/components/display-proposals';

import { prefetchAllProposalsByRealm } from '@/app/api/proposals/queries';
import { GovernancePowerCard } from '@/components/GovernancePower/GovernancePowerCard';
import { extractPubkeyAndCluster } from './slugHelper';

export default async function RealmPage({
  params,
}: {
  params: { slug?: string[] };
}) {
  const { pubkey: realmPk, cluster } = extractPubkeyAndCluster(params.slug);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['allProposals', realmPk, cluster.rpcEndpoint],
    queryFn: async () =>
      await prefetchAllProposalsByRealm(realmPk, cluster.rpcEndpoint).then(
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
