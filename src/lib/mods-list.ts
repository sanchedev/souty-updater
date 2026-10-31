import type { FileInfo } from './types'

/**
 * Lista de mods publicada en el repositorio. El archivo local
 * `externs/mods/list.json` solo sirve para actualizar esta lista; la app
 * siempre descarga la versión subida.
 */
export const MODS_LIST_URL =
  'https://raw.githubusercontent.com/sanchedev/souty-updater/refs/heads/master/externs/mods/list.json'

function isFileInfo(value: unknown): value is FileInfo {
  if (typeof value !== 'object' || value == null) return false

  const info = value as Record<string, unknown>

  return (
    info.kind === 'curseforge' &&
    typeof info.modId === 'number' &&
    typeof info.fileId === 'number'
  )
}

export async function fetchModsList(signal?: AbortSignal): Promise<FileInfo[]> {
  const res = await fetch(MODS_LIST_URL, {
    cache: 'no-store',
    signal,
  })

  if (!res.ok) {
    throw new Error(`La lista respondió con el estado ${res.status}.`)
  }

  const data: unknown = await res.json()

  if (!Array.isArray(data)) {
    throw new Error('La lista de mods no tiene el formato esperado.')
  }

  return data.filter(isFileInfo)
}
