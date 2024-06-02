import axios from 'axios'

const urlRegex =
  // eslint-disable-next-line
  /(https:\/\/)(arweave\.net\/)([\w-]{43})/

export const arweaveDescriptionApi = {
  fetchArweaveFile: fetchArweaveFile,
  cancel: function () {
    if (this?.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  },
  abortController: null,
}
async function fetchArweaveFile(url: string, signal: AbortSignal) {
  const pieces = url.match(urlRegex)
  console.log(pieces)
  if (pieces) {
    console.log(pieces)
    const idPiece = pieces[3]
    if (idPiece) {
      const apiUrl = 'https://arweave.net/' + idPiece
      const apiResponse = await axios.get(apiUrl, {
        signal,
      })
      if (apiResponse?.data?.description) {
        return apiResponse.data.description
      } else {
        console.warn('could not arweave file', {
          url,
          apiResponse: apiResponse.data,
        })
      }
    }
  }

  return undefined
}
