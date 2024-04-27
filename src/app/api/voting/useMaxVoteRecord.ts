import { getMaxVoterWeightRecord } from '@solana/spl-governance';
import { useConnection } from '@solana/wallet-adapter-react';
import { useAsync } from 'react-async-hook';
import { useRealmVoterWeightPlugins } from '@/app/api/governance/voterWeightPlugins';

export const useMaxVoteRecord = () => {
  const { connection } = useConnection();
  const { maxVoterWeightPk } = useRealmVoterWeightPlugins();

  const maxVoteWeightRecord = useAsync(
    async () =>
      maxVoterWeightPk && getMaxVoterWeightRecord(connection, maxVoterWeightPk),
    [maxVoterWeightPk?.toBase58()]
  );

  return maxVoteWeightRecord.result;
};
