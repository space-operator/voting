import { Realms } from '@/components/realms';
import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@/constants/programs';
import {
  HydrationBoundary,
  QueryClient,
  QueryErrorResetBoundary,
  dehydrate,
} from '@tanstack/react-query';
import { prefetchRealms } from '@/app/api/realms/queries';
import { extractCluster } from '@/app/realms/[[...slug]]/slugHelper';
import { Suspense } from 'react';

export default async function Page({ params }: { params: { slug: string[] } }) {
  const { cluster } = extractCluster(params.slug);

  const queryClient = new QueryClient();

  queryClient.prefetchQuery({
    queryKey: ['realms', DEFAULT_GOVERNANCE_PROGRAM_ID, cluster.rpcEndpoint],
    queryFn: () => prefetchRealms(),
    staleTime: 60 * 1000 * 60, // 1 hour
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QueryErrorResetBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <Realms />
        </Suspense>
      </QueryErrorResetBoundary>
    </HydrationBoundary>
  );
}
