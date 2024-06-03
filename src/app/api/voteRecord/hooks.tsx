import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Governance, Proposal } from '@solana/spl-governance';
import { ProgramAccount } from '@solana/spl-governance';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  useAddressQuery_CommunityTokenOwner,
  useAddressQuery_CouncilTokenOwner,
} from '../tokenOwnerRecord/hooks';
import { useQuery } from '@tanstack/react-query';
import { getVoteRecord, getVoteRecordAddress } from '@solana/spl-governance';
import { useRealmFromParams } from '../realm/hooks';
import { useVotingPop } from '../voting/hooks';
import BN from 'bn.js';

export const useProposalVoteRecordQuery = ({
  quorum,
  proposal,
}: {
  quorum: 'electoral' | 'veto';
  proposal: ProgramAccount<Proposal>;
}) => {
  const tokenRole = useVotingPop(proposal.account.governingTokenMint);
  const community = useAddressQuery_CommunityTokenOwner().data;
  const council = useAddressQuery_CouncilTokenOwner().data;

  const electoral =
    tokenRole === undefined
      ? undefined
      : tokenRole === 'community'
      ? community
      : council;

  const veto =
    tokenRole === undefined
      ? undefined
      : tokenRole === 'community'
      ? council
      : community;

  const selectedTokenRecord = quorum === 'electoral' ? electoral : veto;

  const { data: voteRecordAddress } = useVoteRecordAddress(
    proposal.pubkey,
    selectedTokenRecord
  );

  const voteRecord = useVoteRecord(voteRecordAddress);
  console.log('voteRecord', voteRecord.data);

  return voteRecord;
};

export const useVoteRecord = (pubkey: PublicKey | undefined) => {
  const { connection } = useConnection();

  const enabled = pubkey !== undefined;
  // const pk = pubkey ? new PublicKey(pubkey) : undefined;
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['voteRecord', pubkey, connection.rpcEndpoint],
    queryFn: async () => await getVoteRecord(connection, pubkey),
    enabled,
    staleTime: 60 * 1000 * 60, // 1 hour
  });
};

export const useVoteRecordAddress = (
  proposal: PublicKey,
  tokenOwnerRecordAddress: PublicKey
) => {
  const { connection } = useConnection();

  const { data: realm } = useRealmFromParams();
  const programId = realm.owner;

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      'voteRecordAddress',
      proposal,
      tokenOwnerRecordAddress,
      connection.rpcEndpoint,
    ],
    queryFn: async () =>
      await getVoteRecordAddress(programId, proposal, tokenOwnerRecordAddress),
    staleTime: Infinity, // 1 hour
  });
};

export const useHasVoteTimeExpired = (
  governance: ProgramAccount<Governance>,
  proposal: ProgramAccount<Proposal>
) => {
  return useIsBeyondTimestamp(
    proposal
      ? proposal.account.isVoteFinalized()
        ? 0 // If vote is finalized then set the timestamp to 0 to make it expired
        : proposal.account.votingAt && governance
        ? new BN(proposal.account.votingAt, 'hex').toNumber() +
          governance.account.config.baseVotingTime
        : undefined
      : undefined
  );
};

export const useIsBeyondTimestamp = (timestamp: number | undefined) => {
  const [isBeyondTimestamp, setIsBeyondTimestamp] = useState<
    boolean | undefined
  >();

  useEffect(() => {
    if (!timestamp) {
      return;
    }

    const sub = (async () => {
      const now = dayjs().unix();

      if (now > timestamp) {
        setIsBeyondTimestamp(true);
        return;
      }

      setIsBeyondTimestamp(false);

      const id = setInterval(() => {
        const now = dayjs().unix();
        if (now > timestamp) {
          setIsBeyondTimestamp(true);
          clearInterval(id);
        }
      }, 5000); // TODO: Use actual timestamp to calculate the interval

      return id;
    })();

    return () => {
      sub.then((id) => id && clearInterval(id));
    };
  }, [timestamp]);

  return isBeyondTimestamp;
};
