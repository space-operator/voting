import { queryClient } from '@/providers/query';
import { getGovernanceProgramVersion } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';

export const fetchProgramVersion = (
  connection: Connection,
  programId: PublicKey
) =>
  queryClient.fetchQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      'realm_program_version',
      PublicKey.toString(),
      connection.rpcEndpoint,
    ],
    queryFn: async () =>
      await getGovernanceProgramVersion(connection, programId),
    staleTime: Infinity,
  });
