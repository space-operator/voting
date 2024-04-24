'use client';

import { useAtom } from 'jotai/react';
import { filterStateAtom } from './filter-popover';
import { ProgramAccount, Proposal } from '@solana/spl-governance';
import { filterProposals } from '@/app/api/filterProposals';
import { Suspense, useMemo } from 'react';
import { fetchProposalsByRealm } from '@/app/api/getProposalsByRealm';
import { useQuery } from '@tanstack/react-query';

export const DisplayProposals = ({ realmPk }: { realmPk: string }) => {
  const [filterState, _] = useAtom(filterStateAtom);

  const { data } = useQuery({
    queryKey: ['realm-proposals', realmPk],
    queryFn: async () => await fetchProposalsByRealm(realmPk),
  });

  const filteredProposals = useMemo(() => {
    const proposals = JSON.parse(data) as ProgramAccount<Proposal>[];
    return filterProposals(proposals, filterState);
  }, [filterState, data]);

  return (
    <div>{filteredProposals.map((proposal) => proposal.account.name)}</div>
  );
};
