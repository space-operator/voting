"use client";

import { DEFAULT_GOVERNANCE_PROGRAM_ID } from "@/constants/programs";
import { ProgramAccount, Proposal } from "@solana/spl-governance";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  UseSuspenseQueryResult,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { getAllProposalsQuery } from "./query";

export const useAllProposalsByRealm = (
  realmPk: string
): UseSuspenseQueryResult<ProgramAccount<Proposal>[], Error> => {
  const { connection } = useConnection();

  const realmId = new PublicKey(realmPk);
  const programId = new PublicKey(DEFAULT_GOVERNANCE_PROGRAM_ID);

  return useSuspenseQuery(
    getAllProposalsQuery(realmPk, connection, programId, realmId)
  );
};
