import { BigNumber } from 'bignumber.js';
import BN from 'bn.js';
import {
  CalculatedWeight,
  VoterWeightPlugins,
} from '../../../_external/VoterWeightPlugins/lib/types';
import { useRealmFromParams } from '@/app/api/realm/hooks';
import { useRealmVoterWeightPlugins } from '@/app/api/voterWeightPlugins/hooks';
import { useDelegators } from '@/app/api/delegators/hooks';
import { cn } from '@/lib/utils';
import {
  useGoverningTokenMint,
  useMintInfo,
  useTokenMetadata,
  useUserGovTokenAccount,
} from '@/app/api/token/hooks';
import VSRCommunityVotingPower from './VSRVotingPower';

interface Props {
  className?: string;
}

const findVSRVoterWeight = (
  calculatedVoterWeight: CalculatedWeight | undefined
): BN | undefined =>
  calculatedVoterWeight?.details.find((detail) => detail.pluginName === 'VSR')
    ?.pluginWeight ?? undefined;

const isVSRLastVoterWeightPlugin = (plugins: VoterWeightPlugins | undefined) =>
  plugins?.voterWeight[plugins.voterWeight.length - 1].name === 'VSR';

export default function LockedCommunityVotingPower(props: Props) {
  const { data: realm } = useRealmFromParams();
  const mint = useMintInfo(realm?.account.communityMint).data;

  const realmTokenAccount = useUserGovTokenAccount('community').data;

  const {
    totalCalculatedVoterWeight,
    isReady: votingPowerReady,
    plugins,
  } = useRealmVoterWeightPlugins('community');

  // in case the VSR plugin is the last plugin, this is the final calculated voter weight.
  // however, if it is one in a chain, we are just showing an intermediate calculation here.
  // This affects how it appears in the UI
  const votingPower = findVSRVoterWeight(totalCalculatedVoterWeight);
  const isLastVoterWeightPlugin = isVSRLastVoterWeightPlugin(plugins);

  // TODO check
  // const isLoading = useDepositStore((s) => s.state.isLoading);

  const depositMint = realm?.account.communityMint;
  const depositAmount = realmTokenAccount
    ? new BigNumber(realmTokenAccount.amount.toString())
    : new BigNumber(0);

  const tokenName =
    useTokenMetadata(depositMint).data?.name ?? realm?.account.name ?? '';

  // memoize useAsync inputs to prevent constant refetch
  const relevantDelegators = useDelegators('community');

  if (!votingPowerReady) {
    return (
      <div
        className={cn(
          props.className,
          'rounded-md bg-bkg-1 h-[76px] animate-pulse'
        )}
      />
    );
  }

  return (
    <div className={props.className}>
      {(votingPower === undefined || votingPower.isZero()) &&
      (relevantDelegators?.length ?? 0) < 1 ? (
        <div className={'text-xs text-white/50'}>
          You do not have any voting power in this dao.
        </div>
      ) : (
        <VSRCommunityVotingPower
          votingPower={votingPower}
          votingPowerLoading={!votingPowerReady}
          isLastPlugin={isLastVoterWeightPlugin}
        />
      )}

      {depositAmount.isGreaterThan(0) && (
        <>
          <div className='mt-3 text-xs text-white/50'>
            You have{' '}
            {mint
              ? depositAmount.shiftedBy(-mint.decimals).toFormat()
              : depositAmount.toFormat()}{' '}
            more {tokenName} votes in your wallet. Do you want to deposit them
            to increase your voting power in this Dao?
          </div>
          {/* <DepositCommunityTokensBtn inAccountDetails={false} /> */}
        </>
      )}
    </div>
  );
}
