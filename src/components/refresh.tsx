'use client';

import { RefreshCwIcon } from 'lucide-react';
import { Button } from './ui/button';
import { revalidateProposals } from '@/app/api/proposals/actions';

export const Refresh = () => {
  return (
    <Button variant='outline' className='border-primary'>
      <RefreshCwIcon
        onClick={() => revalidateProposals()}
        className='cursor-pointer'
      />
    </Button>
  );
};
