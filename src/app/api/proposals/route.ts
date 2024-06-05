import { PRIVATE_MAINNET_RPC_ENDPOINT } from '@/constants/endpoints';
import { getAllProposals } from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';
import { NextRequest } from 'next/server';

export default async function handler(req: NextRequest, res) {
  if (req.method === 'GET') {
    try {
      console.log('////////// req', req);
      const pathname = req.nextUrl.pathname;
      const realmPk = pathname.split('/realm/')[1];
      console.log('realm', realmPk);
      if (!realmPk) {
        return res
          .status(400)
          .json({ error: 'realmPk query parameter is required' });
      }

      const rpcEndpoint = PRIVATE_MAINNET_RPC_ENDPOINT;
      const connection = new Connection(rpcEndpoint);

      const programIdStr = process.env.DEFAULT_GOVERNANCE_PROGRAM_ID;
      if (!programIdStr) {
        return res.status(500).json({
          error:
            'DEFAULT_GOVERNANCE_PROGRAM_ID environment variable is not set',
        });
      }
      const programId = new PublicKey(programIdStr);
      const realmId = new PublicKey(realmPk);

      const result = (
        await getAllProposals(connection, programId, realmId)
      ).flat();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
