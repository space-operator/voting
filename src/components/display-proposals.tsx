'use client';

import { useAtom } from 'jotai/react';
import { filterStateAtom } from './filter-popover';
import { ProgramAccount, Proposal } from '@solana/spl-governance';
import { filterProposals } from '@/app/api/filterProposals';
import { Suspense, useMemo } from 'react';

export const DisplayProposals = ({
  proposals,
}: {
  proposals: ProgramAccount<Proposal>[];
}) => {
  const [filterState, _] = useAtom(filterStateAtom);

  const filteredProposals = useMemo(() => {
    return filterProposals(proposals, filterState);
  }, [filterState, proposals]);

  return (
    <Suspense>
      <div>{filteredProposals.map((proposal) => proposal.account.name)}</div>
    </Suspense>
  );
};
