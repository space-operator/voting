type VoteResultsBarProps = {
  approveVotePercentage: number;
  denyVotePercentage: number;
};

const VoteResultsBar = ({
  approveVotePercentage = 0,
  denyVotePercentage = 0,
}: VoteResultsBarProps) => {
  return (
    <>
      <div className='bg-[#363D44] h-2 flex flex-grow mt-2.5 rounded'>
        <div
          style={{
            width: `${
              approveVotePercentage > 2 || approveVotePercentage < 0.01
                ? approveVotePercentage
                : 2
            }%`,
          }}
          className={`bg-green-700 flex rounded-l ${
            denyVotePercentage < 0.01 && 'rounded'
          }`}
        />

        <div
          style={{
            width: `${
              denyVotePercentage > 2 || denyVotePercentage < 0.01
                ? denyVotePercentage
                : 2
            }%`,
          }}
          className={`bg-red-500 flex rounded-r border-l ${
            approveVotePercentage < 0.01 && 'rounded'
          }`}
        />
      </div>
    </>
  );
};

export default VoteResultsBar;
