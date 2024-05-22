import { queryClient } from "@/providers/query";
import { getGovernanceProgramVersion } from "@solana/spl-governance";
import { Connection, PublicKey } from "@solana/web3.js";

export const fetchProgramVersion = (
  connection: Connection,
  programId: PublicKey
) => queryClient.fetchQuery(governanceProgramVersionQuery(programId, connection));


export const governanceProgramVersionQuery = (
  programId: PublicKey,
  connection: Connection
) => {
  return {
    queryKey: [
      "governanceProgramVersion",
      programId.toString(),
      connection.rpcEndpoint,
    ],
    queryFn: async () =>
      await getGovernanceProgramVersion(connection, programId),
    staleTime: Infinity,
  };
}
