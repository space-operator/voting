'use client';

import { useAtom } from 'jotai/react';
import { filterStateAtom } from './filter-popover';
import { ProgramAccount, Proposal, Realm } from '@solana/spl-governance';
import { useEffect, useMemo } from 'react';

import { useRealm } from '@/app/api/governance/realm';
import { filterProposals } from '@/utils/filterProposals';
import { useProposalsByRealm } from '@/app/api/proposals/hooks';
import { SingleProposal } from './proposal';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useParams } from 'next/navigation';

export const realmAtom = atomWithStorage('realm', null);

export function DisplayProposals() {
  const { id: realmPk } = useParams<{ id: string }>();
  const [filterState] = useAtom(filterStateAtom);

  const { data: realm, isSuccess: isRealmSuccess } = useRealm(realmPk);

  const { data, status } = useProposalsByRealm(realmPk);
  const [_, setRealm] = useAtom(realmAtom);

  useEffect(() => {
    if (realm) {
      console.log('setting realm', realm);
      setRealm(realm);
    }
  }, [realm, setRealm, isRealmSuccess]);

  const filteredProposals = useMemo(() => {
    const proposals = data ? (data as ProgramAccount<Proposal>[]) : [];
    console.log('proposals', proposals.length);
    return filterProposals(proposals, filterState);
  }, [filterState, data, status]);

  return (
    <div>
      <div className=''>{JSON.stringify(realm)}</div>

      {filteredProposals.map((proposal) => SingleProposal(proposal))}
    </div>
  );
}
