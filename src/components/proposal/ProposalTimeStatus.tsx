import { Proposal, ProposalState } from '@solana/spl-governance';
import { fmtUnixTime } from '../../utils/formatting';
import { useGovernance } from '@/app/api/governance/hooks';
import ProposalTimer from './ProposalTimer';

type ProposalTimeStatusProps = {
  proposal: Proposal;
};

const ProposalTimeStatus = ({ proposal }: ProposalTimeStatusProps) => {
  const governance = useGovernance(proposal.governance).data;

  return proposal && governance ? (
    <div className='flex items-center text-sm'>
      {proposal.votingAt ? (
        <ProposalTimer proposal={proposal} governance={governance.account} />
      ) : (
        `Drafted ${fmtUnixTime(proposal.draftAt)}`
      )}
    </div>
  ) : null;
};

export default ProposalTimeStatus;
