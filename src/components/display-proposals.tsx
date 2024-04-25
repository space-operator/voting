'use client';

import { useAtom } from 'jotai/react';
import { filterStateAtom } from './filter-popover';
import { ProgramAccount, Proposal } from '@solana/spl-governance';
import { filterProposals } from '@/app/api/filterProposals';
import { useMemo } from 'react';
import { fetchProposalsByRealm } from '@/app/api/getProposalsByRealm';
import { useQuery } from '@tanstack/react-query';
import {
  ProposalCard,
  ProposalCardContent,
  ProposalCardHeader,
  ProposalCardVote,
} from './ui/proposal-card';
import { ProgressVoteButton } from './voting-progress-button';

export const DisplayProposals = ({ realmPk }: { realmPk: string }) => {
  const [filterState, _] = useAtom(filterStateAtom);

  const { data, isSuccess } = useQuery({
    queryKey: ['realm-proposals', realmPk],
    queryFn: async () => await fetchProposalsByRealm(realmPk),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const filteredProposals = useMemo(() => {
    if (!isSuccess) return [];
    const proposals = JSON.parse(data) as ProgramAccount<Proposal>[];
    return filterProposals(proposals, filterState);
  }, [filterState, data, isSuccess]);

  return (
    <div>
      {filteredProposals.map((proposal) => (
        <ProposalCard key={proposal.pubkey.toString()}>
          <ProposalCardHeader>{proposal.account.name}</ProposalCardHeader>
          <ProposalCardContent>
            {proposal.account.descriptionLink}
          </ProposalCardContent>
          <ProposalCardVote>
            <ProgressVoteButton />
          </ProposalCardVote>
        </ProposalCard>
      ))}
    </div>
  );
};
