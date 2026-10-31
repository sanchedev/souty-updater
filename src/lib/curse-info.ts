import { loadCurseFile } from './curse-loader'
import { loadCurseMod } from './curse-mod-loader'
import type { FileInfo } from './types'

export interface CurseModInfo {
  modId: number
  fileId: number
  title: string
  logo: string
  pageUrl: string
  fileName: string
  downloadUrl: string
}

/**
 * Obtiene los datos del mod y del archivo desde la API de CurseForge.
 */
export async function loadCurseModInfo(
  info: FileInfo,
): Promise<CurseModInfo> {
  const [mod, file] = await Promise.all([
    loadCurseMod(info.modId),
    loadCurseFile(info).load(),
  ])

  return {
    modId: info.modId,
    fileId: info.fileId,
    title: mod.data.name,
    logo: mod.data.logo?.url ?? '',
    pageUrl: mod.data.links?.websiteUrl ?? '',
    fileName: file.data.fileName,
    downloadUrl: file.data.downloadUrl,
  }
}
