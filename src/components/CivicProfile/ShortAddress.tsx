import { shortenAddress } from '@/utils/formatting';
import { PublicKey } from '@solana/web3.js';
import React, { FC } from 'react';

export const ShortAddress: FC<{ address: PublicKey | undefined }> = ({
  address,
}) => {
  if (!address) return <></>;
  return (
    <a
      href={`https://explorer.solana.com/address/${address.toString()}`}
      target='_blank'
      rel='noShortAddressrer'
    >
      {shortenAddress(address.toString())}
    </a>
  );
};
