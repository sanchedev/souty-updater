import { CurseFileResponse } from './curse-file-type'
import type { FileInfoCurseForge } from './types'

interface LoadCurseFileResult {
  cancel(): void
  load(): Promise<CurseFileResponse>
}

function loadCurseFile(info: FileInfoCurseForge): LoadCurseFileResult {
  const abort = new AbortController()

  return {
    cancel: () => abort.abort(),
    load: async () => {
      const res = await fetch(
        `https://api.curseforge.com/v1/mods/${info.modId}/files/${info.fileId}`,
        {
          headers: {
            Accept: 'application/json',
            'x-api-key': import.meta.env.CURSEFORGE_API_KEY,
          },
          signal: abort.signal,
        },
      )
      return await res.json()
    },
  }
}
