'use client';

import { WalletError } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { FC, ReactNode, useCallback, useMemo } from 'react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { useSearchParams } from 'next/navigation';
import { DEVNET_RPC, MAINNET_RPC } from '@/constants';
require('@solana/wallet-adapter-react-ui/styles.css');

export const WalletContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const searchParams = useSearchParams();
  const cluster = searchParams.get('cluster');

  const endpoint = useMemo(
    () => (cluster === 'devnet' ? DEVNET_RPC : MAINNET_RPC),
    [cluster]
  );

  // TODO check Squads iFrame
  // https://github.com/solana-labs/governance-ui/blob/f36f7bb95bbeef457f0da4afef904c00768a2bd1/components/App.tsx#L81-L82
  const wallets = useMemo(() => [], []);

  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
