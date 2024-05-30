'use client';

import { useRealm } from '@/app/api/realm/hooks';

export function RealmCard({ realmPk }: { realmPk: string }) {
  const { data: realm } = useRealm(realmPk);
  return (
    <div>
      <div className='text-3xl font-mono font-bold my-4'>{realm?.account.name}</div>
    </div>
  );
}
