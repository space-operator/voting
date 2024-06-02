import { CheckCircleIcon, CircleHelpIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

type Props = {
  progress?: number;
  votesRequired?: string | number;
  showBg?: boolean;
};
type GenericProps = {
  voteKindTitle: string;
  quorumTitle: string;
  tooltip: string;
};

const QuorumProgress = ({
  progress,
  votesRequired,
  showBg,
  quorumTitle,
  tooltip,
  voteKindTitle,
}: Props & GenericProps) => {
  const quorumNotMet = typeof progress !== 'undefined' && progress < 100;

  return (
    <div className={`${showBg ? 'bg-bkg-1 p-3' : ''} rounded-md`}>
      <div className='flex items-center'>
        <div className='w-full'>
          <div className='flex items-center'>
            <p className='text-fgd-2 mb-0 mr-1.5'>{quorumTitle} Quorum</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleHelpIcon className='cursor-help h-5 w-5' />
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {quorumNotMet ? (
            <p className='font-bold mb-0'>{`${(
              votesRequired ?? 0
            ).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })} ${(progress ?? 0) > 0 ? 'more' : ''} ${voteKindTitle} vote${
              ((votesRequired as number) ?? 0) > 1 ? 's' : ''
            } required`}</p>
          ) : (
            <div className='flex items-center gap-1'>
              <CheckCircleIcon className='flex-shrink-0 h-5 mr-1.5 text-green-700 w-5' />
              <p className='font-bold mb-0 text-fgd-1'>
                Required approval achieved
              </p>
            </div>
          )}
        </div>
      </div>
      <div className='bg-secondary h-2 flex flex-grow mt-2.5 rounded w-full'>
        <div
          style={{
            width: `${progress}%`,
          }}
          className={`${
            (progress ?? 0) >= 100 ? 'bg-green-700' : 'bg-gray-500'
          } flex rounded`}
        ></div>
      </div>
    </div>
  );
};

export const ApprovalProgress = (props: Props) => (
  <QuorumProgress
    tooltip={`Proposals must reach a minimum number of 'Yes' votes before they are eligible to pass. If the minimum is reached but there are more 'No' votes when voting ends the proposal will fail.`}
    quorumTitle='Approval'
    voteKindTitle='Yes'
    {...props}
  />
);

export const VetoProgress = (props: Props) => (
  <QuorumProgress
    tooltip={`This proposal can be vetoed. If the veto quorum is reached the proposal will fail regardless of the approval quorum.`}
    quorumTitle='Veto'
    voteKindTitle='Veto'
    {...props}
  />
);
