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

export const VotingTypes = {
  Cancelled: 'Cancelled',
  Completed: 'Completed',
  Defeated: 'Defeated',
  Draft: 'Draft',
  Executable: 'Executable',
  ExecutingWithErrors: 'Executing w/ Errors',
  SigningOff: 'Signing Off',
  Voting: 'Voting',
  Vetoed: 'Vetoed',
  withoutQuorum: 'Voting w/out Quorum',
};

export function mapFromProposal(proposalState: ProposalState) {
  return (
    MapProposalStateToVotingTypes[proposalState] ||
    new Error('unsupported voting type')
  );
}

const MapProposalStateToVotingTypes = {
  [ProposalState.Cancelled]: VotingTypes.Cancelled,
  [ProposalState.Completed]: VotingTypes.Completed,
  [ProposalState.Defeated]: VotingTypes.Defeated,
  [ProposalState.Draft]: VotingTypes.Draft,
  [ProposalState.Executing]: VotingTypes.Executable,
  [ProposalState.ExecutingWithErrors]: VotingTypes.ExecutingWithErrors,
  [ProposalState.SigningOff]: VotingTypes.SigningOff,
  [ProposalState.Voting]: VotingTypes.Voting,
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
        <Button variant='outline'>
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
              return (
                <div key={key} className='flex items-center space-x-2'>
                  <Switch
                    id={key}
                    checked={filterState[key]}
                    onCheckedChange={() => handleToggle(key)}
                  />
                  <Label htmlFor={key}>{VotingTypes[key]}</Label>
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
