'use client';

import { useAtom } from 'jotai/react';
import { filterStateAtom } from './filter-popover';
import { ProgramAccount, Proposal, Realm } from '@solana/spl-governance';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useRealm } from '@/app/api/realm/hooks';
import { useRealmSlug } from '@/app/realm/[[...slug]]/slug';
import { InitialSorting, SORTING_OPTIONS, filterProposals } from '@/utils/filterProposals';
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
  const proposalsPerPage = 6;

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
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href='#'
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 0 ? 'hidden' : ''}
                />
              </PaginationItem>
              {totalPages > 3 ? (
                <>
                  <PaginationItem>
                    <PaginationLink
                      href='#'
                      onClick={() => handlePageChange(0)}
                      isActive={currentPage === 0}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {currentPage > 2 && currentPage < totalPages - 1 ? (
                    <>
                      <PaginationEllipsis />
                      <PaginationItem>
                        <PaginationLink
                          href='#'
                          onClick={() => handlePageChange(currentPage)}
                          isActive={true}
                        >
                          {currentPage + 1}
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationEllipsis />
                    </>
                  ) : (
                    <>
                      {Array.from({ length: 2 }, (_, index) => (
                        <PaginationItem key={index + 1}>
                          <PaginationLink
                            href='#'
                            onClick={() => handlePageChange(index + 1)}
                            isActive={currentPage === index + 1}
                          >
                            {index + 2}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationEllipsis />
                    </>
                  )}
                  <PaginationItem>
                    <PaginationLink
                      href='#'
                      onClick={() => handlePageChange(totalPages - 1)}
                      isActive={currentPage === totalPages - 1}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              ) : (
                Array.from({ length: totalPages }, (_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href='#'
                      onClick={() => handlePageChange(index)}
                      isActive={currentPage === index}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))
              )}
              <PaginationItem>
                <PaginationNext
                  href='#'
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages - 1 ? 'hidden' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
