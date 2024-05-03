'use client';

import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@/constants/programs';
import {
  ProgramAccount,
  Proposal,
  getAllProposals,
} from '@solana/spl-governance';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  UseSuspenseQueryResult,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';

export const useProposalsByRealm = (
  realmPk: string
): UseSuspenseQueryResult<ProgramAccount<Proposal>[], Error> => {
  const { connection } = useConnection();

  const realmId = new PublicKey(realmPk);
  const programId = new PublicKey(DEFAULT_GOVERNANCE_PROGRAM_ID);

  return useSuspenseQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['realm-proposals', realmPk, connection.rpcEndpoint],
    queryFn: async () =>
      (await getAllProposals(connection, programId, realmId)).flat(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
