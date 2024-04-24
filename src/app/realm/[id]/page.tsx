'use client';

import { useProposalsByRealm } from '@/app/api/getProposalsByRealm';
import { useRealm } from '@/app/api/getRealm';

import React from 'react';

import { FilterPopover } from '@/components/filter-popover';
import { DisplayProposals } from '@/components/display-proposals';

const RealmPage = ({ params }: { params: { id: string } }) => {
  //   const [realm] = useRealm({ pubkey: params.id });

  const [proposals] = useProposalsByRealm({ pubkey: params.id });

  return (
    <div className='p-4'>
      <FilterPopover />
      {proposals.data && <DisplayProposals proposals={proposals.data[0]} />}
      {/* <div>
        hello {realm.data?.account.name}
        {JSON.stringify(realm)}
      </div> */}
      {/* <div className='pt-10'>Proposals:{JSON.stringify(proposals)}</div> */}
    </div>
  );
};

export default RealmPage;
