import * as React from 'react';

import { cn } from '@/lib/utils';

const ProposalCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}
    {...props}
  />
));
ProposalCard.displayName = 'ProposalCard';

const ProposalCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-row items-start p-6', className)}
    {...props}
  />
));
ProposalCardHeader.displayName = 'ProposalCardHeader';

const ProposalCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
ProposalCardContent.displayName = 'ProposalCardContent';

const ProposalCardVote = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
ProposalCardVote.displayName = 'ProposalCardVote';

const ProposalCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
ProposalCardFooter.displayName = 'ProposalCardFooter';

export {
  ProposalCard,
  ProposalCardHeader,
  ProposalCardFooter,
  ProposalCardContent,
  ProposalCardVote,
};
