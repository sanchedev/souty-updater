/**
 * Categorías de contenido soportadas desde CurseForge.
 * Cada tipo sabe en qué carpeta de `.minecraft` vive y qué compatibilidad
 * se espera de sus archivos.
 */
export type ContentKind = 'mod' | 'resourcepack' | 'shaderpack'

export interface ContentKindMeta {
  id: ContentKind
  /** Carpeta dentro de `.minecraft`. */
  folder: string
  /** Nombre para la UI (plural). */
  label: string
  /** Nombre en singular para diálogos de confirmación. */
  singular: string
  /** classId del proyecto en la API de CurseForge. */
  classId: number
  /** Ruta del listado publicado, relativa a la raíz del repositorio. */
  listPath: string
  expect: {
    gameVersion?: string
    /** Loader que debe declarar el archivo (solo aplica a mods). */
    loader?: string
    /** Lado esperado del archivo, ej. 'Client' (solo aplica a mods). */
    side?: string
  }
}

export const CONTENT_KINDS: Record<ContentKind, ContentKindMeta> = {
  mod: {
    id: 'mod',
    folder: 'mods',
    label: 'Mods',
    singular: 'mod',
    classId: 6,
    listPath: 'externs/mods/list.json',
    expect: { gameVersion: '1.21.1', loader: 'NeoForge', side: 'Client' },
  },
  resourcepack: {
    id: 'resourcepack',
    folder: 'resourcepacks',
    label: 'Resource Packs',
    singular: 'resource pack',
    classId: 12,
    listPath: 'externs/resource-packs/list.json',
    expect: { gameVersion: '1.21.1' },
  },
  shaderpack: {
    id: 'shaderpack',
    folder: 'shaderpacks',
    label: 'Shader Packs',
    singular: 'shader pack',
    classId: 6552,
    listPath: 'externs/shader-packs/list.json',
    expect: { gameVersion: '1.21.1' },
  },
}

export const CONTENT_KIND_IDS = Object.keys(CONTENT_KINDS) as ContentKind[]

/** Ruta absoluta de la carpeta de un tipo de contenido. */
export function packsDir(mcDir: string, kind: ContentKind): string {
  return `${mcDir.replace(/[\\/]+$/, '')}/${CONTENT_KINDS[kind].folder}`
}
