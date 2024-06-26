import BN from 'bn.js';
import dayjs from 'dayjs';
import type { BigNumber } from 'bignumber.js';
import { PublicKey } from '@solana/web3.js';
import { Proposal } from '@solana/spl-governance';
const relativeTime = require('dayjs/plugin/relativeTime');

export function abbreviateAddress(address: PublicKey | string, size = 5) {
  const base58 = typeof address === 'string' ? address : address.toBase58();
  return base58.slice(0, size) + '…' + base58.slice(-size);
}

export const calculatePct = (c = new BN(0), total: BN, proposal: Proposal) => {
  try {
    const newTotal = new BN(total);
    if (newTotal.isZero()) {
      return 0;
    }
    const newC = new BN(c);
    const pct = new BN(100).mul(newC).div(newTotal).toNumber();
    return pct;
  } catch (error) {
    console.error(
      'Error calculating percentage:',
      proposal.name,
      c,
      total,
      error
    );
    return 0; // or handle the error appropriately
  }
};

export const getPct = (amount: BigNumber, total: BigNumber) => {
  if (amount.isZero()) {
    return '0';
  }

  const pct = amount.shiftedBy(2).dividedBy(total);

  if (pct.isLessThan(0.01)) {
    return '<0.01';
  }

  return pct.toFixed(2);
};

/**
 * @deprecated
 * you shouldn't cast a BN to a number
 * use fmtBnMintDecimals
 */
export const fmtTokenAmount = (c: BN, decimals?: number) =>
  c?.div(new BN(10).pow(new BN(decimals ?? 0))).toNumber() || 0;

dayjs.extend(relativeTime);

export const fmtUnixTime = (d: BN | BigNumber | number) =>
  dayjs(
    typeof d === 'number'
      ? d * 1000
      : new BN(d as unknown as string, 'hex').toNumber() * 1000
    // @ts-ignore
  ).fromNow();

export function precision(a) {
  if (!isFinite(a)) return 0;
  let e = 1,
    p = 0;
  while (Math.round(a * e) / e !== a) {
    e *= 10;
    p++;
  }
  return p;
}

const fmtMsToTime = (milliseconds: number) => {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  seconds = seconds % 60;
  minutes = minutes % 60;

  hours = hours % 24;

  return {
    days,
    hours,
    minutes,
    seconds,
  };
};

export const fmtSecsToTime = (secs: number) => {
  return fmtMsToTime(secs * 1000);
};

export const fmtTimeToString = ({
  days,
  hours,
  minutes,
  seconds,
}: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}) => {
  const daysStr = days > 0 ? `${days}d : ` : '';
  const hoursStr = hours > 0 ? `${hours}h : ` : '';
  const minutesStr = minutes > 0 ? `${minutes}m` : '';

  return `${daysStr}${hoursStr}${minutesStr}${seconds}s`;
};

export const shortenAddress = (address: string, chars = 5): string =>
  `${address.substring(0, chars)}...${address.substring(
    address.length - chars
  )}`;
