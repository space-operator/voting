'use client';

import React from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from './ui/pagination';

export function PaginationBar(
  handlePageChange: (newPage: any) => void,
  currentPage: number,
  totalPages: number
): React.ReactNode {
  return (
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
  );
}
