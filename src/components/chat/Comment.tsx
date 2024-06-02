import {
  getTokenOwnerRecordAddress,
  getVoteRecordAddress,
  GovernanceAccountType,
  ProgramAccount,
  Proposal,
  VoteType,
} from '@solana/spl-governance';

import { ChatMessage } from '@solana/spl-governance';
import { abbreviateAddress } from '../../utils/formatting';

import dayjs from 'dayjs';

import { useAsync } from 'react-async-hook';

import { fmtBnMintDecimals } from '@/utils/units';
import {
  useRealmFromParams,
  useRealmRegistryEntryFromParams,
} from '@/app/api/realm/hooks';
import { ProfileImage, ProfilePopup, useProfile } from '../CivicProfile';
import { useMintInfo } from '@/app/api/token/hooks';
import { useVoteRecordByPubkeyQuery } from '@/app/api/voteRecord/hooks';
import { ExternalLinkIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';
import { isPublicKey } from '@/utils/helpers';
import { getVoteWeight, isYesVote } from '@/app/api/voteRecord/helpers';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeExternalLinks from 'rehype-external-links';

const relativeTime = require('dayjs/plugin/relativeTime');

const Comment = ({
  chatMessage,
  proposal,
}: {
  chatMessage: ChatMessage;
  proposal: ProgramAccount<Proposal>;
}) => {
  dayjs.extend(relativeTime);
  const { author, postedAt, body } = chatMessage;
  const realmInfo = useRealmRegistryEntryFromParams();
  const { profile } = useProfile(author);
  const voteSymbol = !realmInfo
    ? ''
    : realmInfo.voteSymbol
    ? realmInfo.voteSymbol
    : isPublicKey(realmInfo.symbol)
    ? realmInfo.displayName
    : realmInfo.symbol;

  //@ts-ignore
  const fromNow = dayjs(postedAt.toNumber() * 1000).fromNow();

  const proposalMint = useMintInfo(proposal?.account.governingTokenMint).data;

  const { data: realm } = useRealmFromParams();

  const { result: voteRecordPk } = useAsync(async () => {
    if (!proposal || !realm) return undefined;
    const tokenPk = proposal.account.governingTokenMint;
    const torPk = await getTokenOwnerRecordAddress(
      proposal.owner,
      realm.pubkey,
      tokenPk,
      author
    );
    return getVoteRecordAddress(proposal.owner, proposal.pubkey, torPk);
  }, [proposal, realm.pubkey, author]);

  const voteRecord = useVoteRecordByPubkeyQuery(voteRecordPk).data?.account;

  const isMulti =
    proposal?.account.voteType !== VoteType.SINGLE_CHOICE &&
    proposal?.account.accountType === GovernanceAccountType.ProposalV2;

  return (
    <div className='w-full border-b mt-4 pb-2'>
      <div className='flex flex-col items-start justify-between mb-4 gap-2'>
        <div className='flex justify-between w-full'>
          <div className='flex items-center'>
            <div className='bg-secondary flex flex-shrink-0 items-center justify-center h-10 rounded-full w-10'>
              <ProfilePopup publicKey={author} expanded={true}>
                <ProfileImage
                  publicKey={author}
                  className='h-8 text-fgd-3 w-8'
                />
              </ProfilePopup>
            </div>
            <div className='mx-3'>
              <div className='flex items-center hover:brightness-[1.15] focus:outline-none'>
                <a
                  className='flex items-center hover:brightness-[1.15] focus:outline-none'
                  href={`https://explorer.solana.com/address/${author.toString()}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <span className='whitespace-nowrap'>
                    {profile?.name?.value || abbreviateAddress(author)}
                  </span>
                  <ExternalLinkIcon
                    className={`flex-shrink-0 h-4 w-4 ml-1.5 text-primary-light`}
                  />
                </a>
                {profile?.exists && (
                  <ProfilePopup publicKey={author} expanded={true} />
                )}
              </div>
              <div className='text-fgd-3 text-xs'>{fromNow}</div>
            </div>
          </div>
          {voteRecord && (
            <div className='bg-bkg-3 hidden lg:flex lg:items-center px-4 py-2 rounded-full'>
              <div className='flex items-center pr-2 text-fgd-1 text-xs'>
                {isYesVote(voteRecord) ? (
                  <ThumbsUpIcon className='h-4 mr-2 fill-[#8EFFDD] w-4' />
                ) : (
                  <ThumbsDownIcon className='h-4 mr-2 fill-[#FF7C7C] w-4' />
                )}
                {isYesVote(voteRecord) ? (isMulti ? 'Voted' : 'Yes') : 'No'}
              </div>
              <span className='text-fgd-4'>|</span>
              <span className='pl-2 text-xs'>
                {`${fmtBnMintDecimals(
                  getVoteWeight(voteRecord)!,
                  proposalMint?.decimals
                ).toLocaleString()} ${voteSymbol}`}
              </span>
            </div>
          )}
        </div>
        <ReactMarkdown
          className='markdown'
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[[rehypeExternalLinks, { target: '_blank' }]]}
        >
          {body.value}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default Comment;
