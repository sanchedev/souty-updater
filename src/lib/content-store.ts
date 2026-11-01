import { LazyStore } from '@tauri-apps/plugin-store'
import { CONTENT_KINDS, type ContentKind } from './content-kinds'
import type { PackInfo } from './content-types'

/**
 * Persiste la lista de referencia, separada por tipo de contenido.
 * Se conserva el archivo `mods.json`; cada tipo guarda bajo su clave de
 * carpeta (`mods`, `resourcepacks`, `shaderpacks`). La clave `mods`
 * coincide con la legacy, así que los datos existentes siguen válidos
 * sin migración.
 */
const STORE_PATH = 'mods.json'

class PackStore {
  #store = new LazyStore(STORE_PATH, {
    autoSave: false,
    defaults: { mods: [] },
  })
  #writeQueue: Promise<unknown> = Promise.resolve()

  /** Elementos guardados de un tipo (sin importar la carpeta local). */
  async getByKind(kind: ContentKind): Promise<PackInfo[]> {
    const packs =
      (await this.#store.get<PackInfo[]>(CONTENT_KINDS[kind].folder)) ?? []

    // Las entradas antiguas no traen `content`.
    return packs.map((pack) => ({ ...pack, content: kind }))
  }

  /** Reemplaza la lista de referencia de un tipo en una sola escritura. */
  async replaceAll(kind: ContentKind, packs: PackInfo[]): Promise<void> {
    await this.#enqueue(async () => {
      const stamped = packs.map((pack) => ({ ...pack, content: kind }))
      await this.#store.set(CONTENT_KINDS[kind].folder, stamped)
      await this.#store.save()
      this.#emit(kind)
    })
  }

  #listeners = new Set<(kind: ContentKind) => void>()

  /** Notifica cuando cambia la lista de referencia de algún tipo. */
  on(cb: (kind: ContentKind) => void) {
    this.#listeners.add(cb)
    return () => {
      this.#listeners.delete(cb)
    }
  }

  #emit(kind: ContentKind) {
    for (const cb of [...this.#listeners]) cb(kind)
  }

  /**
   * Serializa las escrituras para evitar condiciones de carrera cuando
   * se descargan varios elementos al mismo tiempo.
   */
  #enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.#writeQueue.then(operation, operation)
    this.#writeQueue = result.catch(() => {})
    return result
  }
}

export const packStore = new PackStore()
