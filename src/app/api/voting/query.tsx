import { Connection, PublicKey } from '@solana/web3.js';
import { fetchRealmByPubkey } from '../realm/queries';
import { fetchRealmConfigQuery } from '../governance/realmConfig';
import { findPluginName } from '@/constants/plugins';
import { GovernanceRole } from '@/types/governance';

export const getVotingPowerType = async (
  connection: Connection,
  realmPk: PublicKey,
  role: GovernanceRole
) => {
  const realm = await fetchRealmByPubkey(connection, realmPk);
  if (!realm) throw new Error();

  const config = await fetchRealmConfigQuery(connection, realmPk);
  const programId =
    role === 'community'
      ? config.account.communityTokenConfig.voterWeightAddin
      : config.account.councilTokenConfig.voterWeightAddin;

  return findPluginName(programId);
};
