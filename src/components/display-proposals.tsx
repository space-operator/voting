'use client';

import { useAtom } from 'jotai/react';
import { filterStateAtom } from './filter-popover';
import { ProgramAccount, Proposal } from '@solana/spl-governance';
import { filterProposals } from '@/app/api/filterProposals';
import { useMemo } from 'react';

import {
  ProposalCard,
  ProposalCardContent,
  ProposalCardHeader,
  ProposalCardVote,
} from './ui/proposal-card';
import { ProgressVoteButton } from './voting-progress-button';
import { useProposalsByRealm } from '@/app/api/queries/proposals/hooks';
import { useRealm } from '@/app/api/queries/realm';

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

      {filteredProposals.map((proposal) => newFunction(proposal))}
    </div>
  );
};
function newFunction(proposal: ProgramAccount<Proposal>) {
  return (
    <ProposalCard key={proposal.pubkey.toString()}>
      <ProposalCardHeader>{proposal.account.name}</ProposalCardHeader>
      <ProposalCardContent>
        {proposal.account.descriptionLink}
      </ProposalCardContent>
      <ProposalCardVote>
        <ProgressVoteButton />
      </ProposalCardVote>
    </ProposalCard>
  );
}
