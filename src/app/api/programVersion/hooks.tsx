"use client";

import { getGovernanceProgramVersion } from "@solana/spl-governance";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useRealmFromParams } from "../realm/hooks";
import { governanceProgramVersionQuery } from "./queries";

export function useProgramVersionById(realmsProgramId: PublicKey) {
  const { connection } = useConnection();
  const query = useSuspenseQuery(
    governanceProgramVersionQuery(realmsProgramId, connection)
  );

  return query;
}

export function useProgramVersion() {
  const { data: realm } = useRealmFromParams();
  const queriedVersion = useProgramVersionById(realm?.owner).data as
    | 1
    | 2
    | 3
    | undefined;
  return queriedVersion;
}
