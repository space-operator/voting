import { queryClient } from '@/providers/query';
import { VoteRecord, booleanFilter, getGovernanceAccounts, getGovernanceProgramVersion, pubkeyFilter } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';

export const fetchProgramVersion = (
  connection: Connection,
  programId: PublicKey
) =>
  queryClient.fetchQuery(governanceProgramVersionQuery(programId, connection));

export const governanceProgramVersionQuery = (
  programId: PublicKey,
  connection: Connection
) => {
  return {
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      'governanceProgramVersion',
      programId.toString(),
      connection.rpcEndpoint,
    ],
    queryFn: async () =>
      await getGovernanceProgramVersion(connection, programId),
    staleTime: Infinity,
  };
};


export async function getUnrelinquishedVoteRecords(
  connection: Connection,
  programId: PublicKey,
  tokenOwnerRecordPk: PublicKey
) {
  return getGovernanceAccounts(connection, programId, VoteRecord, [
    pubkeyFilter(1 + 32, tokenOwnerRecordPk)!,
    booleanFilter(1 + 32 + 32, false),
  ])
}