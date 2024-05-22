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
import { GovernancePowerCard } from '@/components/GovernancePower';
import { ProgramAccount, Proposal } from '@solana/spl-governance';
import { prefetchAllProposalsByRealm } from '@/app/api/proposals/queries';

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
  });

  return (
    <div className='p-4'>
      <Suspense fallback={<div>Loading...</div>}>
        <GovernancePowerCard />
      </Suspense>
      <FilterPopover />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <QueryErrorResetBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            <DisplayProposals />
          </Suspense>
        </QueryErrorResetBoundary>
      </HydrationBoundary>
    </div>
  );
}
