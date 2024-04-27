'use client';

import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@/constants/programs';
import { useQuery } from '@tanstack/react-query';
import { fetchRealms } from '@/app/api/governance/realms';

export function Realms() {
  const { data, isLoading } = useQuery({
    queryKey: ['realms', DEFAULT_GOVERNANCE_PROGRAM_ID],
    queryFn: async () => await fetchRealms(DEFAULT_GOVERNANCE_PROGRAM_ID),
    staleTime: 3600000, // 1 hour
  });

  return <main>{isLoading ? <div>loading...</div> : <div>{data}</div>}</main>;
}
