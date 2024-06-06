import { PRIVATE_MAINNET_RPC_ENDPOINT } from '@/constants/endpoints';
import {  getRealm } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const realmPk = searchParams.get('realmPk');

    if (!realmPk) {
      throw { error: 'realmPk query parameter is required' };
    }

    const rpcEndpoint = PRIVATE_MAINNET_RPC_ENDPOINT;
    const connection = new Connection(rpcEndpoint);

    const realmId = new PublicKey(realmPk);

    const result = (
      await getRealm(connection, realmId)
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      status: 400,
      error: `Invalid request ${error}`,
    });
  }
}
