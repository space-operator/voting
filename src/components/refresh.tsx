'use client';

import { RefreshCwIcon } from 'lucide-react';
import { Button } from './ui/button';
import { revalidateProposals } from '@/app/api/proposals/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const Refresh = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    revalidateProposals().then(() => {
      router.refresh();
      setIsLoading(false);
    });
  };

  return (
    <Button variant='outline' className='border-primary' disabled={isLoading}>
      <RefreshCwIcon
        onClick={handleRefresh}
        className='cursor-pointer'
      />
    </Button>
  );
};
