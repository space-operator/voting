import { PublicKey } from '@solana/web3.js';

export function prepFlowInputs(inputs: any, wallet: PublicKey) {
  const walletBase58 = wallet.toBase58();
  const jsonStr = JSON.stringify(inputs).replace(/WALLET_ADAPTER/g, walletBase58);
  return JSON.parse(jsonStr);
}
