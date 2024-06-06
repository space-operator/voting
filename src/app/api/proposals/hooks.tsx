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
import { getAllProposalsQuery } from './queries';
import { Cluster } from '@/types/cluster';

export const useAllProposalsByRealm = (
  realmPk: string,
  cluster: Cluster
): UseQueryResult<ProgramAccount<Proposal>[], Error> => {
  const { connection } = useConnection();

  const realmId = new PublicKey(realmPk);
  const programId = new PublicKey(DEFAULT_GOVERNANCE_PROGRAM_ID);

  return useQuery(
    getAllProposalsQuery(realmPk, connection, programId, cluster)
  );
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
