import { readDir, remove } from '@tauri-apps/plugin-fs'
import { CurseModInfo, loadCurseModInfo } from '../curse-info'
import { fetchModsList } from '../mods-list'
import { join } from '@tauri-apps/api/path'
import { modsStore } from '../mods-store'

export async function fetchMods() {
  const list = await fetchModsList()

  const mods = await Promise.all(list.map((fi) => loadCurseModInfo(fi)))

  return mods
}

export async function downloadMods(
  removeAll: boolean,
  modsDir: string,
  mods: CurseModInfo[],
  onProgress?: (current: number, total: number, message: string) => void,
) {
  const entries = await readDir(modsDir)

  const modMap = new Map<string, CurseModInfo>()
  for (const mod of mods) {
    modMap.set(mod.fileName, mod)
  }

  const missing = new Set(modMap.keys())
  const filesToDelete = new Set<string>(removeAll ? modMap.keys() : [])

  for (const entry of entries) {
    if (!entry.isFile) continue
    if (missing.has(entry.name)) {
      missing.delete(entry.name)
      const mod = modMap.get(entry.name)
      if (mod != null) await saveModInfo(mod)
    } else {
      filesToDelete.add(entry.name)
    }
  }

  const modsToDownload = [...missing]
    .map((key) => modMap.get(key)!)
    .filter(Boolean)

  const totalTasks = filesToDelete.size + modsToDownload.length
  let completedTasks = 0

  for (const fileName of filesToDelete) {
    const filePath = await join(modsDir, fileName)

    if (onProgress) {
      onProgress(completedTasks, totalTasks, `Eliminando ${fileName}...`)
    }

    await remove(filePath)
    completedTasks++
  }

  for (const mod of modsToDownload) {
    if (onProgress) {
      onProgress(completedTasks, totalTasks, `Descargando ${mod.fileName}...`)
    }

    await downloadMod(mod, modsDir)
    await saveModInfo(mod)
    completedTasks++
  }

  if (onProgress) {
    onProgress(totalTasks, totalTasks, '¡Sincronización completada!')
  }

  await Promise.allSettled(
    [...missing].flatMap(async (modKey) => {
      const mod = modMap.get(modKey)
      if (mod == null) return []
      await downloadMod(mod, modsDir)
      await saveModInfo(mod)
    }),
  )
}

import { invoke } from '@tauri-apps/api/core'
import { confirm } from '@tauri-apps/plugin-dialog'
import { openUrl } from '@tauri-apps/plugin-opener'

export async function downloadMod(info: CurseModInfo, modsDir: string) {
  const { downloadUrl, fileName } = info
  const filePath = await join(modsDir, fileName)

  if (!downloadUrl) {
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

export async function saveModInfo(info: CurseModInfo) {
  const { title, logo, pageUrl, fileName } = info

  await modsStore.add({
    title,
    logo,
    fileName,
    modId: info.modId,
    fileId: info.fileId,
    pageUrl,
    downloadUrl: info.downloadUrl,
  })
}
