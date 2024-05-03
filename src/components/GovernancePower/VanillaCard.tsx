'use client';

import { VotingCardProps } from '../VotingPowerCards';
import { FC } from 'react';
import { Deposit } from './Deposit';
import VanillaVotingPower from './VanillaVotingPower';
import { nanoid } from 'nanoid';

export const VanillaCard: FC<
  VotingCardProps & { unrecognizedPlugin?: boolean }
> = (props) => (
  <div key={nanoid()}>
    <VanillaVotingPower {...props} />
    <Deposit role={props.role} />
  </div>
);
