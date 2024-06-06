import { PRIVATE_MAINNET_RPC_ENDPOINT } from '@/constants/endpoints';
import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@solana/governance-program-library';
import { getRealm, getRealms } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET(req: NextRequest) {
  try {
    const rpcEndpoint = PRIVATE_MAINNET_RPC_ENDPOINT;
    const connection = new Connection(rpcEndpoint);

    const result = await getRealms(connection, DEFAULT_GOVERNANCE_PROGRAM_ID);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      status: 400,
      error: `Invalid request ${error}`,
    });
  }
}
