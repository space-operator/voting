import { Connection, PublicKey } from '@solana/web3.js';
import { MemcmpFilter, Proposal, getGovernance, getGovernanceAccounts, pubkeyFilter } from '@solana/spl-governance';
import { queryClient } from '@/providers/query';
import { governanceWithDefaults } from './hooks';

export const fetchGovernanceByPubkey = (
  connection: Connection,
  pubkey: PublicKey
) => {
  return queryClient.fetchQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['governance', pubkey, connection.rpcEndpoint],
    queryFn: async () =>
      await getGovernance(connection, pubkey).then(governanceWithDefaults),
  });
};



export async function getProposalsAtVotingStateByTOR(
  connection: Connection,
  programId: PublicKey,
  tokenOwnerRecordPk: PublicKey
) {

  const enumFilter: MemcmpFilter = new MemcmpFilter(65, Buffer.from(Uint8Array.from([2])))

  return getGovernanceAccounts(connection, programId, Proposal, [
    enumFilter,
    pubkeyFilter(1 + 32 + 32 + 1, tokenOwnerRecordPk)!
  ])
}