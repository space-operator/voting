import { NEXT_PUBLIC_API_URL } from '@/constants/endpoints';
import { getRealms } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';

// prefetch all Realms

export async function prefetchRealms() {
  // const connection = new Connection(rpcEndpoint, 'confirmed');

  // todo
  // const governanceProgramID = new PublicKey(pubkey);

  const data = (await fetch(`${NEXT_PUBLIC_API_URL}/api/realms`)).json();
  // const data = await getRealms(connection, governanceProgramID);

  // stringify for server
  // return JSON.stringify(data);
  return data;
}
