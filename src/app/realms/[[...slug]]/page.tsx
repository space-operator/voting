import { Realms } from '@/components/realms';
import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@/constants/programs';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { prefetchRealms } from '../../api/realm/queries';
import { extractCluster } from '@/app/realms/[[...slug]]/slugHelper';

export default async function Page({ params }: { params: { slug: string[] } }) {
  const { cluster } = extractCluster(params.slug);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['realms', DEFAULT_GOVERNANCE_PROGRAM_ID, cluster],
    queryFn: async () =>
      await prefetchRealms(DEFAULT_GOVERNANCE_PROGRAM_ID, cluster),
    staleTime: 60 * 1000 * 60, // 1 hour
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Realms />
    </HydrationBoundary>
  );
}
