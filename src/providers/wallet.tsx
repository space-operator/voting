'use client';

import { WalletError } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { FC, ReactNode, useCallback, useMemo } from 'react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { useRealmSlug } from '@/app/realm/[[...slug]]/slug';

export const WalletContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { cluster } = useRealmSlug();
  // TODO check Squads iFrame
  // https://github.com/solana-labs/governance-ui/blob/f36f7bb95bbeef457f0da4afef904c00768a2bd1/components/App.tsx#L81-L82
  const wallets = useMemo(() => [], []);

  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={cluster.rpcEndpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
