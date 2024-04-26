import { Realms } from '@/components/realms';
import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@/constants/governance';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { fetchRealms } from '../api/queries/realms';

export default async function Page() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['realms', DEFAULT_GOVERNANCE_PROGRAM_ID],
    queryFn: async () => await fetchRealms(DEFAULT_GOVERNANCE_PROGRAM_ID),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Realms />
    </HydrationBoundary>
  );
}
