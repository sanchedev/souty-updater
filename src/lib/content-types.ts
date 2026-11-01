import type { ContentKind } from './content-kinds'

/**
 * Entrada cruda de un listado publicado (`externs/<tipo>/list.json`).
 * La estructura es la misma para todos los tipos de contenido.
 */
export interface FileInfo {
  kind: 'curseforge'
  modId: number
  fileId: number
}

/** Elemento resuelto desde CurseForge; es lo que se persiste en la store. */
export interface PackInfo {
  content: ContentKind
  modId: number
  fileId: number
  title: string
  logo: string
  pageUrl: string
  fileName: string
  downloadUrl: string | null
}

/** Estado de un elemento respecto a la carpeta local. */
export type ItemStatus = 'registered' | 'missing' | 'unregistered'

/** Un elemento de la lista mostrada en la UI. */
export type ContentItem =
  | ({ status: 'unregistered' } & Pick<PackInfo, 'content' | 'fileName'>)
  | ({ status: 'registered' } & PackInfo)
  | ({ status: 'missing' } & PackInfo)

export function isFileInfo(value: unknown): value is FileInfo {
  if (typeof value !== 'object' || value == null) return false

  const info = value as Record<string, unknown>

  return (
    info.kind === 'curseforge' &&
    typeof info.modId === 'number' &&
    typeof info.fileId === 'number'
  )
}

/**
 * Une la lista guardada con los archivos presentes en la carpeta:
 * - presente + guardado → `registered`
 *   - guardado sin archivo → `missing`
 * - presente sin guardar → `unregistered`
 */
export function mergeContents(
  saved: PackInfo[],
  files: string[],
  content: ContentKind,
): ContentItem[] {
  const pending = new Set(files)
  const items: ContentItem[] = []

  for (const pack of saved) {
    if (pending.has(pack.fileName)) {
      items.push({ ...pack, status: 'registered' })
    } else {
      items.push({ ...pack, status: 'missing' })
    }
    pending.delete(pack.fileName)
  }

  for (const fileName of pending) {
    items.push({ content, status: 'unregistered', fileName })
  }

  return items.sort((a, b) => titleOf(a).localeCompare(titleOf(b)))
}

function titleOf(item: ContentItem): string {
  return item.status === 'unregistered' ? item.fileName : item.title
}

/** Guard de tipo: elementos presentes en la lista pero ausentes de la carpeta. */
export function isMissing(
  item: ContentItem,
): item is Extract<ContentItem, { status: 'missing' }> {
  return item.status === 'missing'
}
