import { arweaveDescriptionApi } from './arweave';
import { gistApi } from './github';

export async function resolveProposalDescription(
  descriptionLink: string,
  signal: AbortSignal
) {
  try {
    gistApi.cancel();
    arweaveDescriptionApi.cancel();
    let desc = '';
    const url = new URL(descriptionLink);

    if (url.toString().includes('gist')) {
      desc = await gistApi.fetchGistFile(url.toString(), signal);
    }

    if (url.toString().includes('arweave')) {
      desc = await arweaveDescriptionApi.fetchArweaveFile(
        url.toString(),
        signal
      );
    }

    return desc ? desc : descriptionLink;
  } catch {
    return descriptionLink;
  }
}
