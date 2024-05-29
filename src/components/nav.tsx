// 'use client';

import Link from 'next/link';
import { ModeToggle } from './dark-toggle';
import ConnectWallet from './ui/connect';

export default function Nav() {
  return (
    <div className='flex w-full items-center justify-between'>
      <div className='font-mono text-xl font-semibold'>Space Operator</div>
      <ModeToggle />
      <ConnectWallet />
    </div>
  );
}
