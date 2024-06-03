'use client';

import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@/constants/programs';
import { useQuery } from '@tanstack/react-query';
import { prefetchRealms } from '@/app/api/realm/queries';
import { realmsJson, splRepo } from '@/constants/other';
import { PublicKey } from '@solana/web3.js';
import { RealmInfo } from '@/types/realm';
import { ProgramAccount, Realm } from '@solana/spl-governance';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRealmsSlug } from '@/app/realms/[[...slug]]/slug';
import { Card, CardContent, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { useRouter } from 'next/navigation';
import { PaginationBar } from './PaginationBar';

interface RealmDisplayInfo {
  name: string;
  pubkey: string;
  image: string;
}

export function Realms() {
  const { cluster } = useRealmsSlug();
  const [searchTerm, setSearchTerm] = useState('');
  const { push, prefetch } = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['realms', DEFAULT_GOVERNANCE_PROGRAM_ID, cluster.rpcEndpoint],
    queryFn: async () =>
      await prefetchRealms(DEFAULT_GOVERNANCE_PROGRAM_ID, cluster.rpcEndpoint),
    staleTime: 3600000, // 1 hour
  });

  // fetch a json file from a public github repo
  const { data: repoData, isLoading: isRepoLoading } = useQuery({
    queryKey: ['githubRepoData'],
    queryFn: async () => {
      const response = await fetch(splRepo + realmsJson);
      if (!response.ok) {
        throw new Error('Could not fetch realms from repo');
      }
      return response.json();
    },
    staleTime: 3600000, // 1 hour
  });

  const combinedData = useMemo(() => {
    if (!data || !repoData) return [];

    return repoData
      .map((realmInfo: RealmInfo) => {
        const onChainMatch: ProgramAccount<Realm> | undefined = JSON.parse(
          data
        ).find((onChain: ProgramAccount<Realm>) =>
          new PublicKey(onChain.pubkey).equals(new PublicKey(realmInfo.realmId))
        ); // Corrected PublicKey comparison using .equals method

        if (!onChainMatch) {
          console.error(
            `No on-chain match found for realm ID: ${realmInfo.realmId}`
          );
          return null;
        }

        return {
          name: onChainMatch.account.name || realmInfo.displayName,
          pubkey: onChainMatch.pubkey.toString(),
          image: realmInfo.bannerImage
            ? `${splRepo}${realmInfo.bannerImage}`
            : realmInfo.ogImage ?? '',
        } as RealmDisplayInfo;
      })
      .filter(Boolean); // Filter out null entries
  }, [data, repoData]);

  const filteredData = useMemo(() => {
    return combinedData.filter((realm) =>
      realm.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [combinedData, searchTerm]);
  // Pagination
  const [paginatedRealms, setPaginatedRealms] = useState<RealmDisplayInfo[]>(
    []
  );

  const [currentPage, setCurrentPage] = useState(0);
  const realmsPerPage = 12;
  const totalPages = Math.ceil(filteredData.length / realmsPerPage);

  const paginateRealms = useCallback(
    (page) => {
      return filteredData.slice(
        page * realmsPerPage,
        (page + 1) * realmsPerPage
      );
    },
    [filteredData]
  );

  useEffect(() => {
    setPaginatedRealms(paginateRealms(currentPage));
  }, [paginateRealms, currentPage, filteredData]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // return to page 0 when search term changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  return (
    <main lang='en'>
      <div
        className='flex h-36 text-6xl items-center justify-center relative'
        style={{
          background:
            'linear-gradient(to right, rgba(255,255,255,0) 1%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 101%)',
        }}
      >
        <div
          className='font-bold italic absolute'
          style={{ filter: 'blur(6px)' }}
        >
          VOTE
        </div>
        <div className='font-bold italic absolute'>VOTE</div>
      </div>
      {isLoading || isRepoLoading ? (
        <div className='flex justify-center items-center'>
          <Input
            className='border-primary animate-pulse-bg'
            type='text'
            placeholder='     ...loading Realms...'
            disabled
            lang='en'
          />
        </div>
      ) : (
        <div className='flex flex-col justify-center items-center gap-6'>
          <Input
            className='border-primary/30'
            autoFocus
            type='text'
            placeholder='Search Realms'
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
          <ul className='grid grid-cols-3 gap-4 pt-8 pb-6'>
            {paginatedRealms
              .filter((realm) => realm.image)
              .map((realm) => (
                <Card
                  key={realm.pubkey}
                  className='h-48 p-2 cursor-pointer hover:bg-gradient-to-br hover:from-primary/10 hover:to-transparent hover:border-primary/30'
                  onClick={() => {
                    push(`/realm/${realm.pubkey}`);
                  }}
                  onMouseEnter={() => {
                    prefetch(`/realm/${realm.pubkey}`);
                  }}
                >
                  <CardTitle className='text-lg'>{realm.name}</CardTitle>
                  <CardContent>
                    <div className='flex m-2 items-center justify-center'>
                      {realm.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={realm.image}
                          src={realm.image}
                          alt={realm.name}
                          style={{ width: '70%', height: '70%' }}
                          onError={(e) => e.currentTarget.remove()}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </ul>
          {totalPages > 1 &&
            PaginationBar(handlePageChange, currentPage, totalPages)}
        </div>
      )}
    </main>
  );
}
