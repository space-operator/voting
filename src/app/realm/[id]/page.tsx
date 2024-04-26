import { fetchProposalsByRealm } from '@/app/api/getProposalsByRealm';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

import React from 'react';

import { FilterPopover } from '@/components/filter-popover';
import { DisplayProposals } from '@/components/display-proposals';
import { MAINNET_RPC_ENDPOINT } from '@/constants';

export default async function RealmPage({
  params,
}: {
  params: { id: string };
}) {
  const realmPk = params.id;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['realm-proposals', realmPk, MAINNET_RPC_ENDPOINT],
    queryFn: async () =>
      await fetchProposalsByRealm(realmPk, MAINNET_RPC_ENDPOINT),
  });

  return (
    <div className='p-4'>
      <FilterPopover />
      {/* <HydrationBoundary state={dehydrate(queryClient)}> */}
      <DisplayProposals realmPk={realmPk} />
      {/* </HydrationBoundary> */}
    </div>
  );
}
