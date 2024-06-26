export const HELIUM_VSR_PROGRAM_ID = new PublicKey(
  'hvsrNC3NKbcryqDs2DocYHZ9yPKEVzdSjQG6RVtK1s8'
);

import { PublicKey } from '@solana/web3.js';

export const DEFAULT_NFT_VOTER_PLUGIN =
  'GnftV5kLjd67tvHpNGyodwWveEKivz3ZWvvE3Z4xi2iw';

export const VSR_PLUGIN_PKS: string[] = [
  '4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo',
  'vsr2nfGVNHmSY8uxoBGqq8AQbwz3JwaEaHqGbsTPXqQ',
  'VotEn9AWwTFtJPJSMV5F9jsMY6QwWM5qn3XP9PATGW7',
  'VoteWPk9yyGmkX4U77nEWRJWpcc8kUfrPoghxENpstL',
  'VoteMBhDCqGLRgYpp9o7DGyq81KNmwjXQRAHStjtJsS',
  '5sWzuuYkeWLBdAv3ULrBfqA51zF7Y4rnVzereboNDCPn',
];

export const HELIUM_VSR_PLUGINS_PKS: string[] = [
  HELIUM_VSR_PROGRAM_ID.toBase58(),
];

export const NFT_PLUGINS_PKS: string[] = [
  DEFAULT_NFT_VOTER_PLUGIN,
  'GnftV5kLjd67tvHpNGyodwWveEKivz3ZWvvE3Z4xi2iw',
  'GnftVc21v2BRchsRa9dGdrVmJPLZiRHe9j2offnFTZFg', // v2, supporting compressed nft
];

export const GATEWAY_PLUGINS_PKS: string[] = [
  'GgathUhdrCWRHowoRKACjgWhYHfxCEdBi5ViqYN6HVxk',
];

export const QV_PLUGINS_PKS: string[] = [
  'quadCSapU8nTdLg73KHDnmdxKnJQsh7GUbu5tZfnRRr',
];

export const PYTH_PLUGIN_PK: string[] = [
  'pytS9TjG1qyAZypk7n8rw8gfW9sUaqqYyMhJQ4E7JCQ',
];

export type PluginName =
  | 'gateway'
  | 'QV'
  | 'vanilla'
  | 'VSR'
  | 'HeliumVSR'
  | 'NFT'
  | 'pyth'
  | 'unknown';

export const findPluginName = (programId: PublicKey | undefined): PluginName =>
  programId === undefined
    ? ('vanilla' as const)
    : VSR_PLUGIN_PKS.includes(programId.toString())
    ? ('VSR' as const)
    : HELIUM_VSR_PLUGINS_PKS.includes(programId.toString())
    ? 'HeliumVSR'
    : NFT_PLUGINS_PKS.includes(programId.toString())
    ? 'NFT'
    : GATEWAY_PLUGINS_PKS.includes(programId.toString())
    ? 'gateway'
    : QV_PLUGINS_PKS.includes(programId.toString())
    ? 'QV'
    : PYTH_PLUGIN_PK.includes(programId.toString())
    ? 'pyth'
    : 'unknown';

// Used when creating a new realm to choose which voterWeightAddin to use
export const pluginNameToCanonicalProgramId = (
  pluginName: PluginName
): PublicKey | undefined => {
  const lastPk = (arr: string[]) => new PublicKey(arr[arr.length - 1]);

  switch (pluginName) {
    case 'VSR':
      return lastPk(VSR_PLUGIN_PKS);
    case 'HeliumVSR':
      return lastPk(HELIUM_VSR_PLUGINS_PKS);
    case 'NFT':
      return lastPk(NFT_PLUGINS_PKS);
    case 'gateway':
      return lastPk(GATEWAY_PLUGINS_PKS);
    case 'QV':
      return lastPk(QV_PLUGINS_PKS);
    case 'pyth':
      return lastPk(PYTH_PLUGIN_PK);
    default:
      return undefined;
  }
};
export const SUPPORT_CNFTS = true;
export const ON_NFT_VOTER_V2 = false;
export const SHOW_DELEGATORS_LIST = false;

export const DELEGATOR_BATCH_VOTE_SUPPORT_BY_PLUGIN: Record<
  ReturnType<typeof findPluginName>,
  boolean
> = {
  vanilla: true,
  VSR: true,
  HeliumVSR: false,
  gateway: false,
  QV: false,
  NFT: false,
  pyth: false,
  unknown: false,
};
