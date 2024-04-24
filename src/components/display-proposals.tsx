'use client';

import { useAtom } from 'jotai/react';
import { filterStateAtom } from './filter-popover';
import { ProgramAccount, Proposal } from '@solana/spl-governance';
import { filterProposals } from '@/app/api/filterProposals';
import { useMemo } from 'react';
import { fetchProposalsByRealm } from '@/app/api/getProposalsByRealm';
import { useQuery } from '@tanstack/react-query';

export const DisplayProposals = ({ realmPk }: { realmPk: string }) => {
  const [filterState, _] = useAtom(filterStateAtom);

  const { data, isSuccess } = useQuery({
    queryKey: ['realm-proposals', realmPk],
    queryFn: async () => await fetchProposalsByRealm(realmPk),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const filteredProposals = useMemo(() => {
    if (!isSuccess) return [];
    const proposals = JSON.parse(data) as ProgramAccount<Proposal>[];
    return filterProposals(proposals, filterState);
  }, [filterState, data, isSuccess]);

  return (
    <div>{filteredProposals.map((proposal) => proposal.account.name)}</div>
  );
};
