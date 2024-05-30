'use client';

import { ModeToggle } from '../dark-toggle';
import ConnectWallet from '../ui/connect';
import { RealmCard } from '../realm/realmCard';
import { usePathname } from 'next/navigation';

export default function RealmNavbar() {
  const realmPk = usePathname().split('/')[2];
  return (
    <div className='flex w-full items-center justify-between'>
      <RealmCard realmPk={realmPk} />
      <ModeToggle />
      <ConnectWallet />
    </div>
  );
}
