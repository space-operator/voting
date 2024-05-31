"use client";

import {
  Mint,
  TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  getTokenMetadata,
} from "@solana/spl-token";
import { TokenMetadata } from "@solana/spl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  UseQueryResult,
  UseSuspenseQueryResult,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRealmFromParams } from "../realm/hooks";
import { useAsync } from "react-async-hook";

// get the mint info for a token
export function useMintInfo(
  pubkey: PublicKey
): UseSuspenseQueryResult<Mint, Error> {
  const { connection } = useConnection();

  return useSuspenseQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["mintInfo", pubkey, connection.rpcEndpoint],
    queryFn: async () => await getMint(connection, new PublicKey(pubkey)),
    staleTime: Infinity,
  });
}

// get the token info
export function useTokenMetadata(
  pubkey: PublicKey
): UseSuspenseQueryResult<TokenMetadata, Error> {
  const { connection } = useConnection();

  return useSuspenseQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["tokenMetadata", pubkey, connection.rpcEndpoint],
    queryFn: async () =>
      await getTokenMetadata(
        connection,
        new PublicKey(pubkey),
        connection.commitment,
        TOKEN_PROGRAM_ID
      ),
    staleTime: 60 * 1000 * 60, // 1 hour
  });
}

export const useUserGovTokenAccount = (role: "community" | "council") => {
  const realm = useRealmFromParams().data;
  const wallet = useWallet().wallet?.adapter;
  const walletPk = wallet?.publicKey ?? undefined;
  const mint =
    role === "community"
      ? realm?.account.communityMint
      : realm?.account.config.councilMint;
  const { result: userAtaPk } = useAsync(
    async () =>
      walletPk && mint && getAssociatedTokenAddress(mint, walletPk, true),
    [mint, walletPk]
  );
  return useGetAccount(userAtaPk);
};

export const useGetAccount = (pubkey: PublicKey | undefined) => {
  const { connection } = useConnection();

  const query = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["tokenAccount", pubkey, connection.rpcEndpoint],
    queryFn: async () => await getAccount(connection, pubkey),
    staleTime: 60 * 1000 * 60, // 1 hour
  });

  return query;
};

export function useGoverningTokenMint(
  governingTokenRole: "community" | "council"
) {
  const realm = useRealmFromParams().data;
  return governingTokenRole === "community"
    ? realm?.account.communityMint
    : realm?.account.config.councilMint;
}
