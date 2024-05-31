'use client';

import { useAtom } from 'jotai/react';
import { filterStateAtom } from './filter-popover';
import { ProgramAccount, Proposal, Realm } from '@solana/spl-governance';
import { useEffect, useMemo } from 'react';

import { useRealm } from '@/app/api/realm/hooks';
import { useRealmSlug } from '@/app/realm/[[...slug]]/slug';
import { filterProposals } from '@/utils/filterProposals';
import { useAllProposalsByRealm } from '@/app/api/proposals/hooks';
import { SingleProposal } from './proposal/proposal';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useParams } from 'next/navigation';

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
      filterState
    ) as ProgramAccount<Proposal>[];
  }, [filterState, data]);

  return (
    <div>
      <div className='flex flex-col mx-auto max-w-3xl gap-8'>
        {filteredProposals.map((proposal: ProgramAccount<Proposal>) => (
          <SingleProposal
            key={proposal.pubkey.toString()}
            proposal={proposal}
          />
        ))}
      </div>
    </div>
  );
}
