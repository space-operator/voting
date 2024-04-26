'use client';

import { useConnection } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import { getAllProposals, getRealm } from '@solana/spl-governance';
import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@/constants/governance';
import { PublicKey } from '@solana/web3.js';

export const useProposalsByRealm = (pubkey: string) => {
  const { connection } = useConnection();

  const realmId = new PublicKey(pubkey);
  const programId = new PublicKey(DEFAULT_GOVERNANCE_PROGRAM_ID);

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['realm-proposals', pubkey, connection.rpcEndpoint],
    queryFn: async () =>
      (await getAllProposals(connection, programId, realmId)).flat(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
