export const DEFAULT_GOVERNANCE_PROGRAM_ID =
  'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw';

export const DEVNET_RPC = 'https://api.devnet.solana.com';

export const MAINNET_RPC =
  process.env.NEXT_PUBLIC_HELIUS_URL || 'https://api.mainnet-beta.solana.com';

export const DEVNET_RPC_ENDPOINT =
  process.env.DEVNET_RPC || 'https://api.dao.devnet.solana.com/';

export const MAINNET_RPC_ENDPOINT =
  process.env.MAINNET_RPC ||
  'http://realms-realms-c335.mainnet.rpcpool.com/258d3727-bb96-409d-abea-0b1b4c48af29/';

export const TESTNET_RPC_ENDPOINT = 'http://127.0.0.1:8899';
