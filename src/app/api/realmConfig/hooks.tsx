"use client";

import { useConnection } from "@solana/wallet-adapter-react";
import { useRealmFromParams } from "../realm/hooks";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getRealmConfig, getRealmConfigAddress } from "@solana/spl-governance";

export const useRealmConfig = () => {
  const { connection } = useConnection();
  const { data: realm } = useRealmFromParams();

  const query = useSuspenseQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["realm-config", realm.pubkey, connection.rpcEndpoint],
    queryFn: async () =>
      await getRealmConfigAddress(realm.owner, realm.pubkey).then(
        (realmConfigPk) => getRealmConfig(connection, realmConfigPk)
      ),
    staleTime: 3600000, // 1 hour
  });
  return query;
};
