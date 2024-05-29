'use client';

import React, { FC, useState } from 'react';

import { PublicKey } from '@solana/web3.js';
import { CivicIcon } from '@/app/icons';
import { Profile } from './Profile';
import { abbreviateAddress } from '@/utils/formatting';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';

type Props = {
  publicKey: PublicKey;
  expanded?: boolean;
  children?: React.ReactNode;
};

export const ProfilePopup: FC<Props> = ({ publicKey, expanded, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const Icon: FC = () =>
    children ? (
      <>{children}</>
    ) : (
      <CivicIcon className={`flex-shrink-0 h-3 w-3 ml-1.5 mr-1.5`} />
    );

  return (
    <span className='flex'>
      {isOpen && (
        <Dialog>
          <DialogTrigger asChild>
            <Icon />
          </DialogTrigger>
          <DialogContent className='sm:max-w-sm'>
            <h2>Civic Profile for {abbreviateAddress(publicKey)}</h2>
            <Profile publicKey={publicKey} expanded={expanded} />
          </DialogContent>
        </Dialog>
      )}
    </span>
  );
};
