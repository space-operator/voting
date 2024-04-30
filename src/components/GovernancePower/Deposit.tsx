'use client';

import { BigNumber } from 'bignumber.js';
import { useRealmParams } from '@/app/api/governance/realm';
import {
  useMintInfo,
  useTokenMetadata,
  useUserGovTokenAccountQuery,
} from '@/app/api/token/hooks';

/** Contextual deposit, shows only if relevant */
export const Deposit = ({ role }: { role: 'community' | 'council' }) => {
  const realm = useRealmParams().data;
  const mint =
    role === 'community'
      ? realm?.account.communityMint
      : realm?.account.config.councilMint;

  const mintInfo = useMintInfo(mint).data;
  const userAta = useUserGovTokenAccountQuery(role).data;

  const depositAmount = userAta?.amount
    ? new BigNumber(userAta.amount.toString())
    : new BigNumber(0);
  //TODO get token name from Jupiter
  const tokenName = realm?.account.name ?? '';

  return !depositAmount.isGreaterThan(0) ? null : (
    <>
      <div className='mt-3 text-xs text-white/50'>
        You have{' '}
        {mintInfo
          ? depositAmount.shiftedBy(-mintInfo.decimals).toFormat()
          : depositAmount.toFormat()}{' '}
        more {tokenName} tokens in your wallet. Do you want to deposit them to
        increase your voting power in this Dao?
      </div>
      {/* TODO */}
      {/* <DepositTokensButton className='mt-4 w-48' role={role} as='secondary' /> */}
    </>
  );
};
