'use client';

import { useAtom } from 'jotai/react';
import { filterStateAtom } from './filter-popover';
import { ProgramAccount, Proposal, Realm } from '@solana/spl-governance';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useRealm } from '@/app/api/realm/hooks';
import { useRealmSlug } from '@/app/realm/[[...slug]]/slug';
import {
  InitialSorting,
  SORTING_OPTIONS,
  filterProposals,
} from '@/utils/filterProposals';
import { useAllProposalsByRealm } from '@/app/api/proposals/hooks';
import { SingleProposal } from './proposal/proposal';
import { atomWithStorage } from 'jotai/utils';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { PaginationBar } from './PaginationBar';

export const realmAtom = atomWithStorage('realm', null);

export function DisplayProposals() {
  const { pubkey: realmPk } = useRealmSlug();

  const [filterState] = useAtom(filterStateAtom);

  const { data: realm, isSuccess: isRealmSuccess } = useRealm(realmPk);

  const { data, status } = useAllProposalsByRealm(realmPk);
  const [_, setRealm] = useAtom(realmAtom);

  useEffect(() => {
    if (realm) {
      console.log('setting realm', realm);
      setRealm(realm);
    }
  }, [realm, setRealm, isRealmSuccess]);

  const filteredProposals = useMemo(() => {
    const proposals = data;

    return filterProposals(
      proposals,
      filterState,
      InitialSorting
    ) as ProgramAccount<Proposal>[];
  }, [filterState, data]);

  // Pagination
  const [paginatedProposals, setPaginatedProposals] = useState<
    ProgramAccount<Proposal>[]
  >([]);
  const [currentPage, setCurrentPage] = useState(0);
  const proposalsPerPage = 5;

  const paginateProposals = useCallback(
    (page) => {
      return filteredProposals.slice(
        page * proposalsPerPage,
        (page + 1) * proposalsPerPage
      );
    },
    [filteredProposals]
  );

  useEffect(() => {
    setPaginatedProposals(paginateProposals(currentPage));
  }, [paginateProposals, currentPage, filteredProposals]);

  const totalPages = Math.ceil(filteredProposals.length / proposalsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // return to page 0 when filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [filterState]);

  return (
    <div>
      <div className='flex flex-col mx-auto max-w-3xl gap-8'>
        {paginatedProposals.map((proposal: ProgramAccount<Proposal>) => (
          <SingleProposal
            key={proposal.pubkey.toString()}
            proposal={proposal}
          />
        ))}
        {totalPages > 1 &&
          PaginationBar(handlePageChange, currentPage, totalPages)}
      </div>
    </div>
  );
}
