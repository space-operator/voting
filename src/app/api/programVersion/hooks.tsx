'use client';

import { getGovernanceProgramVersion } from '@solana/spl-governance';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useRealmParams } from '../governance/realm';

export function useProgramVersionByIdQuery(realmsProgramId: PublicKey) {
  const { connection } = useConnection();
  const query = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      'realm_program_version',
      realmsProgramId,
      connection.rpcEndpoint,
    ],
    queryFn: () => getGovernanceProgramVersion(connection, realmsProgramId),
    enabled: realmsProgramId !== undefined,
    // Staletime is zero by default, so queries get refetched often. Since program version is immutable it should never go stale.
    staleTime: Infinity,
  });

  return query;
}

export const useProgramVersion = () => {
  const { data: realm } = useRealmParams();
  const queriedVersion = useProgramVersionByIdQuery(realm?.owner).data as
    | 1
    | 2
    | 3
    | undefined;
  return queriedVersion;
};
