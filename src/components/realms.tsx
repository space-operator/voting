'use client';

import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@/constants';
import { useRealms } from '@/app/api/getRealms';
import { Suspense } from 'react';

export function Realms() {
  const [data] = useRealms({
    pubkey: DEFAULT_GOVERNANCE_PROGRAM_ID,
  });

  return (
    <Suspense fallback={<div>loading...</div>}>
      <main>{JSON.stringify(data)}</main>
    </Suspense>
  );
}
