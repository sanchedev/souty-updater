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
  downloadUrl: string | null
}

/**
 * Obtiene los datos del mod y del archivo desde la API de CurseForge.
 */
export async function loadCurseModInfo(info: FileInfo): Promise<CurseModInfo> {
  const [mod, file] = await Promise.all([
    loadCurseMod(info.modId),
    loadCurseFile(info).load(),
  ])

  const reportMessage = `Si viste este mensaje, repórtalo.\nModId: ${mod.data.id}\nFileId: ${file.data.id}\nName: ${mod.data.name}\nCompatibility: ${file.data.gameVersions.join(' - ')}`

  if (!file.data.gameVersions.includes('1.21.1'))
    alert(
      'Versión incompatible. El mod cargado no es compatible con la 1.21.1.' +
        reportMessage,
    )
  if (!file.data.gameVersions.includes('NeoForge'))
    alert(
      'Loader incompatible. El mod cargado no es compatible con NeoForge.' +
        reportMessage,
    )
  if (
    !file.data.gameVersions.includes('Client') &&
    file.data.gameVersions.includes('Server')
  )
    alert(
      'Side incompatible. El mod cargado está enfocado unicamente para servidores.' +
        reportMessage,
    )

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
