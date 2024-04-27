'use client';

import { useAtom } from 'jotai/react';
import { filterStateAtom } from './filter-popover';
import { ProgramAccount, Proposal } from '@solana/spl-governance';
import { useMemo } from 'react';

import { useRealm } from '@/app/api/governance/realm';
import { filterProposals } from '@/utils/filterProposals';
import { useProposalsByRealm } from '@/app/api/proposals/hooks';
import { SingleProposal } from './proposal';

export const DisplayProposals = ({ realmPk }: { realmPk: string }) => {
  const [filterState, _] = useAtom(filterStateAtom);

  const { data, isSuccess } = useProposalsByRealm(realmPk);
  const { data: realm, isSuccess: isRealmSuccess } = useRealm(realmPk);

  const filteredProposals = useMemo(() => {
    if (!isSuccess) return [];
    const proposals = data as ProgramAccount<Proposal>[];
    return filterProposals(proposals, filterState);
  }, [filterState, data, isSuccess]);

  return (
    <div>
      <div className=''>{JSON.stringify(realm)}</div>

      {filteredProposals.map((proposal) => SingleProposal(proposal))}
    </div>
  );
};
