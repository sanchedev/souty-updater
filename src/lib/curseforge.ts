import { join } from '@tauri-apps/api/path'
import { invoke } from '@tauri-apps/api/core'
import { CONTENT_KINDS, type ContentKind } from './content-kinds'
import { isFileInfo, type FileInfo, type PackInfo } from './content-types'

const API = 'https://api.curseforge.com/v1'
const API_KEY = import.meta.env.CURSEFORGE_API_KEY

export const LIST_BASE_URL =
  'https://raw.githubusercontent.com/sanchedev/souty-updater/refs/heads/master/'

/** Valores esperados para los avisos de compatibilidad (definidos en Ajustes). */
export interface CompatTarget {
  version: string
  loader: string
}

/** Listado publicado de un tipo de contenido (`externs/<tipo>/list.json`). */
export async function fetchPacksList(
  kind: ContentKind,
  signal?: AbortSignal,
): Promise<FileInfo[]> {
  const res = await fetch(LIST_BASE_URL + CONTENT_KINDS[kind].listPath, {
    cache: 'no-store',
    signal,
  })

  if (!res.ok) {
    throw new Error(`La lista respondió con el estado ${res.status}.`)
  }

  const data: unknown = await res.json()
  if (!Array.isArray(data)) {
    throw new Error('La lista de elementos no tiene el formato esperado.')
  }

  return data.filter(isFileInfo)
}

interface CurseResponse<T> {
  data: T
}

interface CurseModData {
  name: string
  logo?: { url?: string } | null
  links?: { websiteUrl?: string } | null
}

interface CurseFileData {
  fileName: string
  downloadUrl: string | null
  gameVersions: string[]
}

async function curseGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Accept: 'application/json', 'x-api-key': API_KEY },
    cache: 'no-store',
    signal,
  })

  if (!res.ok) {
    throw new Error(`CurseForge respondió ${res.status} en ${path}.`)
  }

  return await res.json()
}

/** Resuelve una entrada del listado contra la API de CurseForge. */
export async function fetchPackInfo(
  kind: ContentKind,
  entry: FileInfo,
  target: CompatTarget,
): Promise<{ pack: PackInfo; warnings: string[] }> {
  const [mod, file] = await Promise.all([
    curseGet<CurseResponse<CurseModData>>(`/mods/${entry.modId}`),
    curseGet<CurseResponse<CurseFileData>>(
      `/mods/${entry.modId}/files/${entry.fileId}`,
    ),
  ])

  const pack: PackInfo = {
    content: kind,
    modId: entry.modId,
    fileId: entry.fileId,
    title: mod.data.name,
    logo: mod.data.logo?.url ?? '',
    pageUrl: mod.data.links?.websiteUrl ?? '',
    fileName: file.data.fileName,
    downloadUrl: file.data.downloadUrl,
    gameVersions: file.data.gameVersions,
  }

  return { pack, warnings: checkCompatibility(pack, target) }
}

/**
 * Descarga el listado completo de un tipo. Los elementos que fallen no
 * detienen la operación: terminan como avisos.
 */
export async function fetchPacks(
  kind: ContentKind,
  target: CompatTarget,
): Promise<{ packs: PackInfo[]; warnings: string[] }> {
  const entries = await fetchPacksList(kind)
  const results = await Promise.allSettled(
    entries.map((entry) => fetchPackInfo(kind, entry, target)),
  )

  const packs: PackInfo[] = []
  const warnings: string[] = []

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      packs.push(result.value.pack)
      warnings.push(...result.value.warnings)
    } else {
      const entry = entries[index]
      warnings.push(
        `No se pudo cargar el elemento ${entry.modId}/${entry.fileId}: ${result.reason}`,
      )
    }
  })

  return { packs, warnings }
}

/**
 * Revisa un elemento guardado contra el target actual, usando sus
 * `gameVersions` persistidos (sin llamadas a la API).
 */
export function checkCompatibility(
  pack: PackInfo,
  target: CompatTarget,
): string[] {
  const versions = pack.gameVersions ?? []
  // Entradas guardadas antes de persistir versiones: no se puede revisar.
  if (versions.length === 0) return []

  const { checks } = CONTENT_KINDS[pack.content]
  const warnings: string[] = []

  if (checks.version && !versions.includes(target.version)) {
    warnings.push(`${pack.fileName}: no es compatible con la ${target.version}.`)
  }
  if (checks.loader && !versions.includes(target.loader)) {
    warnings.push(`${pack.fileName}: no es compatible con ${target.loader}.`)
  }
  if (
    checks.side &&
    versions.includes('Server') &&
    !versions.includes('Client')
  ) {
    warnings.push(`${pack.fileName}: está enfocado únicamente para servidores.`)
  }

  return warnings
}

/** Descarga un archivo a la carpeta indicada (la crea si no existe). */
export async function downloadPack(pack: PackInfo, dir: string): Promise<void> {
  if (pack.downloadUrl == null) {
    throw new Error(`${pack.fileName} no tiene URL de descarga directa.`)
  }

  await invoke('download_file', {
    url: pack.downloadUrl,
    filePath: await join(dir, pack.fileName),
    apiKey: API_KEY,
  })
}

/** Abre la página del archivo en el navegador (descarga manual). */
export function packDownloadPage(pack: PackInfo): string {
  return `${pack.pageUrl}/files/${pack.fileId}`
}
