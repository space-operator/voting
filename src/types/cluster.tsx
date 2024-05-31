import {
  DEVNET_RPC_ENDPOINT,
  MAINNET_RPC_ENDPOINT,
  TESTNET_RPC_ENDPOINT,
} from '@/constants/endpoints';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl, Connection } from '@solana/web3.js';

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
