'use client';

import Link from 'next/link';
import { ModeToggle } from '../dark-toggle';
import ConnectWallet from '../ui/connect';
import { RealmCard } from '../realm/realmCard';

export default function Nav() {
  return (
    <div className='flex w-full items-center justify-between'>
      <div className='font-mono text-xl font-semibold'>Space Operator</div>
      {/* <RealmCard realmPk={realmPk} /> */}
      <ModeToggle />
      <ConnectWallet />
    </div>
  );
}
