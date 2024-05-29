import {
  GOVERNANCE_CHAT_PROGRAM_ID,
  getGovernanceChatMessages,
} from '@solana/spl-governance';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';

export const useChatMessages = (proposalPk: PublicKey) => {
  const { connection } = useConnection();

  const enabled = proposalPk !== undefined;
  const query = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: enabled
      ? ['chatMessages', proposalPk, connection.rpcEndpoint]
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error();
      return getGovernanceChatMessages(
        connection,
        GOVERNANCE_CHAT_PROGRAM_ID,
        proposalPk
      );
    },
    enabled,
  });

  return query;
};
