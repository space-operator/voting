import axios from 'axios';

const urlRegex =
  // eslint-disable-next-line
  /(https:\/\/)(gist\.github.com\/)([\w\/-]{1,39}\/)([\w-]{1,32})/;

export const gistApi = {
  fetchGistFile: fetchGistFile,
  cancel: function () {
    if (this?.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  },
  abortController: null,
};
async function fetchGistFile(gistUrl: string, signal: AbortSignal) {
  const pieces = gistUrl.match(urlRegex);

  if (pieces) {
    const justIdWithoutUser = pieces[4];
    if (justIdWithoutUser) {
      const apiUrl = 'https://api.github.com/gists/' + justIdWithoutUser;
      try {
        const apiResponse = await axios.get(apiUrl, {
          signal,
        });
        if (apiResponse.status === 200) {
          const jsonContent = apiResponse.data;
          const nextUrlFileName = Object.keys(jsonContent['files'])[0];
          const nextUrl = jsonContent['files'][nextUrlFileName]['raw_url'];
          if (nextUrl.startsWith('https://gist.githubusercontent.com/')) {
            const fileResponse = await axios.get(nextUrl, {
              signal,
            });
            return fileResponse.data;
          }
          return undefined;
        } else {
          console.warn('could not fetchGistFile', {
            gistUrl,
            apiResponse: apiResponse.data,
          });
        }
      } catch (error) {
        return undefined;
      }
    }
  } else {
    return undefined;
  }

  return undefined;
}
