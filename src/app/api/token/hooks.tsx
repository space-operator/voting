'use client';

import { Mint, getMint } from '@solana/spl-token';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

// get the mint info for a token
export function useMintInfo(pubkey: PublicKey): UseQueryResult<Mint, Error> {
  const { connection } = useConnection();

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['mint_info', pubkey, connection.rpcEndpoint],
    queryFn: async () => await getMint(connection, new PublicKey(pubkey)),
  });
}
