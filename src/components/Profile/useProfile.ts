import { PublicKey } from '@solana/web3.js';
import { CivicProfile, Profile as BaseProfile } from '@civic/profile';
import { useQuery } from '@tanstack/react-query';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

type Profile = BaseProfile & {
  exists: boolean;
};

const profileIsSet = (profile: BaseProfile): boolean =>
  !!profile.name || !!profile.image || !!profile.headline;

export const useProfile = (
  publicKey?: PublicKey
): { profile: Profile | undefined; loading: boolean } => {
  const { connection } = useConnection();
  const connectedWallet = useWallet().wallet.adapter;

  const profileWalletPublicKey = publicKey || connectedWallet?.publicKey;
  const options = connection ? { solana: { connection } } : undefined;

  const { data: profile, isLoading } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['Civic Profile', profileWalletPublicKey?.toString() + 'Civic'],
    queryFn: () =>
      CivicProfile.get(profileWalletPublicKey?.toBase58(), options),
    enabled: !!profileWalletPublicKey, // Only run query if profileWalletPublicKey is available
    select: (data) => ({
      ...data,
      exists: profileIsSet(data),
    }),
  });

  return { profile, loading: isLoading };
};
