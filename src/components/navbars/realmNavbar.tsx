'use client';

import { ModeToggle } from '../dark-toggle';
import ConnectWallet from '../ui/connect';
import { RealmCard } from '../realm/realmCard';
import { usePathname } from 'next/navigation';

export default function RealmNavbar() {

  return (
    <div className='flex w-full items-center justify-between'>
      <RealmCard />
      <ModeToggle />
      <ConnectWallet />
    </div>
  );
}
