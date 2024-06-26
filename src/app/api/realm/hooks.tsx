'use client';

import { ProgramAccount, Realm } from '@solana/spl-governance';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  UseSuspenseQueryResult,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import DEVNET_REALMS_JSON from '../../../../public/realms/devnet.json';
import MAINNET_REALMS_JSON from '../../../../public/realms/mainnet-beta.json';
import { parseCertifiedRealms } from '@/types/realm';
import { getRealmQuery } from './queries';
import { useRealmSlug } from '@/app/realm/[[...slug]]/slug';

export function useRealm(
  pubkey: string
): UseSuspenseQueryResult<ProgramAccount<Realm>, Error> {
  const { connection } = useConnection();

  const realmId = new PublicKey(pubkey);

  const query = useSuspenseQuery(getRealmQuery(realmId, connection));

  return query;
}

export function useRealmFromParams() {
  const { pubkey } = useRealmSlug();
  return useRealm(pubkey);
}

export const useRealmRegistryEntryFromParams = () => {
  const { pubkey, cluster } = useRealmSlug();

  const { connection } = useConnection();

  // if we cant just parse the realm pk from the url, look it up.
  // this happens a lot and might be slightly expensive so i decided to use react-query
  const { data: lookup } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['realmRegistry', pubkey, connection.rpcEndpoint],
    queryFn: () => {
      // url symbol can either be pubkey or the DAO's "symbol", eg 'MNGO'
      const MAINNET_REALMS_PARSED = parseCertifiedRealms(MAINNET_REALMS_JSON);
      const DEVNET_REALMS_PARSED = parseCertifiedRealms(DEVNET_REALMS_JSON);

      const realms =
        cluster.network === 'devnet'
          ? DEVNET_REALMS_PARSED
          : MAINNET_REALMS_PARSED;

      return realms.find((x) => x.realmId.equals(new PublicKey(pubkey)));
    },
    staleTime: Infinity,
  });

  return lookup;
};
