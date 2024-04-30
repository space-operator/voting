// 'use client';

import Link from 'next/link';
import { ModeToggle } from './dark-toggle';
import ConnectWallet from './ui/connect';

export default function Nav() {
  return (
    <div className='grid grid-cols-3 gap-4'>
      <Link href='/realms'>
        <div className='w-24 h-24 bg-blue-500 hover:bg-blue-700 cursor-pointer'>
          Realms
        </div>
      </Link>
      <Link href='/page2'>
        <div className='w-24 h-24 bg-green-500 hover:bg-green-700 cursor-pointer'>
          Aggregate
        </div>
      </Link>
      <Link href='/page3'>
        <div className='w-24 h-24 bg-red-500 hover:bg-red-700 cursor-pointer'>
          Single Realm
        </div>
      </Link>
      <div className='w-full items-center justify-between lg:flex'>
        <div className='font-mono text-xl font-semibold'>Space Operator</div>
        <ModeToggle />
        <ConnectWallet />
      </div>
    </div>
  );
}
