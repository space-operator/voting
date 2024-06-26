import { useUserCommunityTokenOwnerRecord } from '@/app/api/tokenOwnerRecord/hooks';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { FC } from 'react';
import { VotingCardProps } from './VotingPowerCards';
import VanillaVotingPower from './VanillaVotingPower';
import LockedCommunityVotingPower from './LockedCommunityVotingPower';
import VanillaWithdrawTokensButton from './VanillaWithdrawTokensButton';

export const VSRCard: FC<VotingCardProps> = ({ role, ...props }) => {
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data;

  //VSR if dao transited to use plugin and some users have still deposited tokens they should withdraw before
  //depositing to plugin
  const didWithdrawFromVanillaSetup =
    !ownTokenRecord ||
    ownTokenRecord.account.governingTokenDepositAmount.isZero();

  return didWithdrawFromVanillaSetup ? (
    <LockedCommunityVotingPower />
  ) : (
    //TODO make a better generic little prompt for when a plugin is used but there are still tokens in vanilla
    <>
      <VanillaVotingPower role='community' {...props} />
      {/* TODO */}
      {/* <div className='flex flex-col gap-2'>
        <div>
          <small className='flex items-center mt-3 text-xs'>
            <ExclamationTriangleIcon className='w-5 h-5 mr-2'></ExclamationTriangleIcon>
            Please withdraw your tokens and deposit again to get governance
            power
          </small>
        </div>
        <div>
          <VanillaWithdrawTokensButton role={role} />
        </div>
      </div> */}
    </>
  );
};
