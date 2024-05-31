'use client';

import { useRealmSlug } from '@/app/realm/[[...slug]]/slug';
import {
  DEVNET_RPC_ENDPOINT,
  MAINNET_RPC_ENDPOINT,
  TESTNET_RPC_ENDPOINT,
} from '@/constants/endpoints';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useSearchParams } from 'next/navigation';

import { createContext, useContext, useEffect, useState } from 'react';

export enum ClusterType {
  Devnet,
  Mainnet,
  Testnet,
}

interface Cluster {
  type: ClusterType;
  connection: Connection;
  endpoint: string;
  network: WalletAdapterNetwork;
  rpcEndpoint: string;
}

export const DevnetCluster: Cluster = {
  type: ClusterType.Devnet,
  connection: new Connection(DEVNET_RPC_ENDPOINT, 'confirmed'),
  endpoint: DEVNET_RPC_ENDPOINT, //clusterApiUrl('devnet'),
  network: WalletAdapterNetwork.Devnet,
  rpcEndpoint: DEVNET_RPC_ENDPOINT,
};

export const MainnetCluster: Cluster = {
  type: ClusterType.Mainnet,
  connection: new Connection(MAINNET_RPC_ENDPOINT, 'confirmed'),
  endpoint: MAINNET_RPC_ENDPOINT, //clusterApiUrl('mainnet-beta'),
  network: WalletAdapterNetwork.Mainnet,
  rpcEndpoint: MAINNET_RPC_ENDPOINT,
};
``;
export const TestnetCluster: Cluster = {
  type: ClusterType.Testnet,
  connection: new Connection(TESTNET_RPC_ENDPOINT, 'recent'),
  endpoint: clusterApiUrl('testnet'),
  network: WalletAdapterNetwork.Testnet,
  rpcEndpoint: TESTNET_RPC_ENDPOINT,
};

interface Value {
  cluster: Cluster;
  type: ClusterType;
  setType(type: ClusterType): void;
}

export const DEFAULT: Value = {
  cluster: DevnetCluster,
  type: ClusterType.Devnet,
  setType: () => {
    throw new Error('Not implemented');
  },
};

export const context = createContext(DEFAULT);

interface Props {
  children: React.ReactNode;
}

export function ClusterProvider(props: Props) {
  const { cluster } = useRealmSlug();
  // const params = useSearchParams();
  // const urlCluster = params.get('cluster');

  // const [clusterState, setClusterState] = useAtom(clusterStateAtom);

  const [type, setType] = useState(
    cluster === 'devnet' ? ClusterType.Devnet : ClusterType.Mainnet
  );

  useEffect(() => {
    if (cluster === 'devnet') {
      setType(ClusterType.Devnet);
      // setClusterState(DevnetCluster);
    } else {
      setType(ClusterType.Mainnet);
      // setClusterState(MainnetCluster);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster]);

  const rpcEndpoint =
    type === ClusterType.Devnet
      ? DevnetCluster
      : type === ClusterType.Testnet
      ? TestnetCluster
      : MainnetCluster;

  return (
    <context.Provider value={{ cluster: rpcEndpoint, type, setType }}>
      {props.children}
    </context.Provider>
  );
}

export function useCluster() {
  const value = useContext(context);
  return [value.cluster, value.setType, value.type] as const;
}

// export const clusterStateAtom = atomWithStorage<Cluster>(
//   'cluster',
//   DevnetCluster
// );
