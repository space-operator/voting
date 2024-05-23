import React, { FC } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useProfile } from './useProfile';
import { ShortAddress } from './ShortAddress';
import ContentLoader from 'react-content-loader';

type Props = {
  publicKey?: PublicKey;
  height?: string;
  width?: string;
  dark?: boolean;
  style?: React.CSSProperties;
};

export const ProfileName: FC<Props> = ({
  publicKey,
  height = '13',
  width = '300',
  dark = false,
  style,
}) => {
  const { profile, loading } = useProfile(publicKey);

  if (!publicKey) return <></>;
  return loading ? (
    <div
      style={{
        ...style,
        height,
        width,
        overflow: 'hidden',
      }}
    >
      <ContentLoader
        backgroundColor={dark ? '#333' : undefined}
        foregroundColor={dark ? '#555' : undefined}
      >
        <rect style={{ ...style }} x={0} y={0} width={width} height={height} />
      </ContentLoader>
    </div>
  ) : (
    <div style={{ display: 'flex', gap: '5px', ...style }}>
      {profile?.name?.value || <ShortAddress address={publicKey} />}
    </div>
  );
};
