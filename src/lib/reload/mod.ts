import { CurseModInfo, loadCurseModInfo } from '../curse-info'
import { fetchModsList } from '../mods-list'
import { join } from '@tauri-apps/api/path'

export async function fetchMods() {
  const list = await fetchModsList()

  const mods = await Promise.all(list.map((fi) => loadCurseModInfo(fi)))

  return mods
}

import { invoke } from '@tauri-apps/api/core'
import { confirm } from '@tauri-apps/plugin-dialog'
import { openUrl } from '@tauri-apps/plugin-opener'

export async function downloadMod(
  info: CurseModInfo,
  modsDir: string,
  forceDownload: boolean = false,
) {
  const { downloadUrl, fileName } = info
  const filePath = await join(modsDir, fileName)

  if (!downloadUrl) {
    if (!forceDownload) return
    if (
      !(await confirm(
        'No hay URL de descarga disponible para este mod. Al hacerlo manual abriremos la página de descarga del archivo y manualmente tendrá que moverlo a la carpeta de mods asignada. ¿Desea continuar manualmente?',
      ))
    )
      return
    await openUrl(info.pageUrl + '/files/' + info.fileId)
    return
  }

  try {
    await invoke('download_mod_file', {
      url: downloadUrl,
      filePath,
      apiKey: import.meta.env.CURSEFORGE_API_KEY,
    })
  } catch (error) {
    throw new Error(`No se pudo descargar el archivo: ${error}`)
  }
}
