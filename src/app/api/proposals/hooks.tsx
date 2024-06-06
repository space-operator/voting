'use client';

import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@/constants/programs';
import { ProgramAccount, Proposal, getProposal } from '@solana/spl-governance';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  UseQueryResult,
  UseSuspenseQueryResult,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { getAllProposalsClientQuery, getAllProposalsQuery } from './queries';
import { Cluster } from '@/types/cluster';
import { API_URL, NEXT_PUBLIC_API_URL } from '@/constants/endpoints';

export const useAllProposalsByRealm = (
  realmPk: string,
  cluster: Cluster
): UseSuspenseQueryResult<ProgramAccount<Proposal>[]> => {
  const { connection } = useConnection();

  const realmId = new PublicKey(realmPk);
  const programId = new PublicKey(DEFAULT_GOVERNANCE_PROGRAM_ID);

  return useSuspenseQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['allProposals', realmPk, cluster?.type ?? 'mainnet'],
    queryFn: async () => getAllProposalsQuery(realmPk, cluster),
    staleTime: 60 * 1000 * 60, // 1 hour
  });
};

export const useProposal = (pubkey: PublicKey | undefined) => {
  const { connection } = useConnection();

  const enabled = pubkey !== undefined;
  const query = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: enabled
      ? ['proposal', pubkey?.toString(), connection.rpcEndpoint]
      : undefined,
    queryFn: async () => await getProposal(connection, pubkey),
    enabled,
    staleTime: 1000 * 60 * 60,
  });
  return query;
};
