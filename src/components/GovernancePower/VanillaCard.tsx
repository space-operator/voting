'use client';

import { VotingCardProps } from '../VotingPowerCards';
import { FC } from 'react';
import { Deposit } from './Deposit';
import VanillaVotingPower from './VanillaVotingPower';

export const VanillaCard: FC<
  VotingCardProps & { unrecognizedPlugin?: boolean }
> = (props) => (
  <div>
    <VanillaVotingPower {...props} />
    <Deposit role={props.role} />
  </div>
);
