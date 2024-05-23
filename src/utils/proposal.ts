import { arweaveDescriptionApi } from './arweave';
import { gistApi } from './github';

export async function resolveProposalDescription(descriptionLink: string) {
  try {
    gistApi.cancel();
    arweaveDescriptionApi.cancel();
    let desc = '';
    const url = new URL(descriptionLink);

    if (url.toString().includes('gist')) {
      desc = await gistApi.fetchGistFile(url.toString());
    }

    if (url.toString().includes('arweave')) {
      desc = await arweaveDescriptionApi.fetchArweaveFile(url.toString());
    }

    return desc ? desc : descriptionLink;
  } catch {
    return descriptionLink;
  }
}
