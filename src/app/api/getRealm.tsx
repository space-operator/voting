import { queryClient } from '@/providers/query';
import { getRealm } from '@solana/spl-governance';
import { useConnection } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

const connection = new Connection(process.env.HELIUS_MAINNET_URL, 'confirmed');

export async function fetchRealm(pubkey: string) {
  const realmId = new PublicKey(pubkey);

  const data = await getRealm(connection, realmId);

  return JSON.stringify(data);
}

export const fetchRealmByPubkey = async (
  connection: Connection,
  pubkey: PublicKey
) => {
  try {
    const data = await queryClient.fetchQuery({
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
      queryKey: ['realm', pubkey, connection.rpcEndpoint],
      queryFn: async () => await getRealm(connection, pubkey),
      staleTime: 1000 * 60 * 60, // 1 hour
    });

    return data;
  } catch (error) {
    console.error(error);
  }
};

export const useRealm = (pubkey: string) => {
  const { connection } = useConnection();

  const realmId = new PublicKey(pubkey);

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['realm', pubkey, connection.rpcEndpoint],
    queryFn: async () => await getRealm(connection, realmId),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useRealmParams = () => {
  const { connection } = useConnection();
  const pubkey = useParams<{ id: string }>().id;

  const realmId = new PublicKey(pubkey);

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['realm', pubkey, connection.rpcEndpoint],
    queryFn: async () => await getRealm(connection, realmId),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
