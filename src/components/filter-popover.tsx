'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FilterIcon, FilterXIcon } from 'lucide-react';
import { Switch } from './ui/switch';
import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai/react';
import { ProposalState } from '@solana/spl-governance';
import { useAllProposalsByRealm } from '@/app/api/proposals/hooks';
import { useRealmSlug } from '@/app/realm/[[...slug]]/slug';
import { API_URL } from '@/constants/endpoints';

export const VotingTypes = {
  Draft: 'Draft',
  SigningOff: 'Signing Off',
  Voting: 'Voting',
  withoutQuorum: 'Voting w/out Quorum',
  Executable: 'Executable',
  ExecutingWithErrors: 'Executing w/ Errors',
  Completed: 'Completed',
  Vetoed: 'Vetoed',
  Defeated: 'Defeated',
  Cancelled: 'Cancelled',
};

export function mapFromProposal(proposalState: ProposalState) {
  return (
    MapProposalStateToVotingTypes[proposalState] ||
    new Error('unsupported voting type ' + proposalState)
  );
}

// TODO check succeeded is completed?
const MapProposalStateToVotingTypes = {
  [ProposalState.Draft]: VotingTypes.Draft,
  [ProposalState.SigningOff]: VotingTypes.SigningOff,
  [ProposalState.Voting]: VotingTypes.Voting,
  [ProposalState.Succeeded]: VotingTypes.Completed,
  [ProposalState.Executing]: VotingTypes.Executable,
  [ProposalState.Completed]: VotingTypes.Completed,
  [ProposalState.Cancelled]: VotingTypes.Cancelled,
  [ProposalState.Defeated]: VotingTypes.Defeated,
  [ProposalState.ExecutingWithErrors]: VotingTypes.ExecutingWithErrors,
  [ProposalState.Vetoed]: VotingTypes.Vetoed,
};

// Atom with initial state and local storage key
export interface FilterState {
  [key: string]: boolean;
}

export const filterStateAtom = atomWithStorage<FilterState>(
  'votingTypeFilterState',
  Object.keys(VotingTypes).reduce((acc, key) => {
    acc[key] = key === VotingTypes.Voting; // Initialize all filters as off
    return acc;
  }, {} as FilterState)
);

export function FilterPopover() {
  const { pubkey, cluster } = useRealmSlug();
  const { data } = useAllProposalsByRealm(pubkey, cluster);

  const state = data?.map((proposal) =>
    mapFromProposal(proposal.account.state)
  );

  // Count each voting type
  const validStates = state?.filter((type) => !(type instanceof Error)) || [];
  const votingTypeCounts = validStates.reduce((acc, type) => {
    if (typeof type === 'string') {
      // Ensure type is a string before using it as a key
      acc[type] = (acc[type] || 0) + 1;
    }
    return acc;
  }, {});

  const [filterState, setFilterState] = useAtom(filterStateAtom);

  const handleToggle = (key) => {
    setFilterState((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' className='border-primary'>
          <FilterIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80'>
        <div className='grid gap-4'>
          <div className='space-y-2'>
            <h4 className='font-medium leading-none'>Filter Voting</h4>
            <p className='text-sm text-muted-foreground'>
              Select which voting types to show.
            </p>
          </div>
          <div className='grid gap-4'>
            {Object.keys(VotingTypes).map((key) => {
              if (!votingTypeCounts[key]) return null;
              return (
                <div key={key} className='flex items-center space-x-2'>
                  <Switch
                    id={key}
                    checked={filterState[key]}
                    onCheckedChange={() => handleToggle(key)}
                  />
                  <Label htmlFor={key}>{`${VotingTypes[key]} (${
                    votingTypeCounts[key] || 0
                  })`}</Label>
                </div>
              );
            })}
            <div className='flex items-center justify-end space-x-2'>
              <Button
                variant='outline'
                onClick={() =>
                  setFilterState(
                    Object.keys(VotingTypes).reduce((acc, key) => {
                      acc[key] = false;
                      return acc;
                    }, {})
                  )
                }
              >
                <FilterXIcon />
                <div className='ml-2'>Deselect All</div>
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
