import { queryClient } from '@/providers/query';
import { getTokenOwnerRecord } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export const getVanillaGovpower = async (
  connection: Connection,
  tokenOwnerRecord: PublicKey
) => {
  const torAccount = await fetchTokenOwnerRecordByPubkey(
    connection,
    tokenOwnerRecord
  );
  return torAccount
    ? torAccount.account.governingTokenDepositAmount
    : new BN(0);
};

export const fetchTokenOwnerRecordByPubkey = (
  connection: Connection,
  pubkey: PublicKey
) =>
  queryClient.fetchQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['tokenOwnerRecord', pubkey, connection.rpcEndpoint],
    queryFn: async () => await getTokenOwnerRecord(connection, pubkey),
    staleTime: 60 * 1000 * 60, // 1 hour
  });
