import { Realms } from '@/components/realms';
import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@/constants/programs';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { prefetchRealms } from '../api/realm/queries';

export default async function Page() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['realm', DEFAULT_GOVERNANCE_PROGRAM_ID],
    queryFn: async () => await prefetchRealms(DEFAULT_GOVERNANCE_PROGRAM_ID),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Realms />
    </HydrationBoundary>
  );
}
