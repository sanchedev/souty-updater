import { CurseFileResponse } from './curse-file-type'
import type { FileInfo } from './types'

interface LoadCurseFileResult {
  cancel(): void
  load(): Promise<CurseFileResponse>
}

export function loadCurseFile(info: FileInfo): LoadCurseFileResult {
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

      if (!res.ok) {
        throw new Error(
          `No se pudo cargar el archivo ${info.fileId} (${res.status}).`,
        )
      }

      return await res.json()
    },
  }
}
