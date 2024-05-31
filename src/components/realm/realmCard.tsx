'use client';

import { useRealm, useRealmFromParams } from '@/app/api/realm/hooks';

export function RealmCard() {
  const { data: realm } = useRealmFromParams();
  return (
    <div>
      <div className='text-3xl font-mono font-bold my-4'>{realm?.account.name}</div>
    </div>
  );
}
