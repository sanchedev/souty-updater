import { LazyStore } from '@tauri-apps/plugin-store'
import type { FileInfoSaved } from './types'

const STORE_PATH = 'mods.json'
const MODS_KEY = 'mods'

/**
 * Persiste la información de los mods descargados en `mods.json`.
 *
 * Uso:
 *   await modsStore.add({ modId, fileId, curseUrl, title, logo, fileName })
 *   await modsStore.addMany([...])
 */
class ModsStore {
  #store = new LazyStore(STORE_PATH, {
    autoSave: false,
    defaults: { [MODS_KEY]: [] },
  })
  #writeQueue: Promise<unknown> = Promise.resolve()

  async getAll(): Promise<FileInfoSaved[]> {
    return (await this.#store.get<FileInfoSaved[]>(MODS_KEY)) ?? []
  }

  async getByModId(modId: number): Promise<FileInfoSaved | undefined> {
    return (await this.getAll()).find((mod) => mod.modId === modId)
  }

  async add(mod: FileInfoSaved): Promise<FileInfoSaved[]> {
    return this.#enqueue(async () => {
      const mods = await this.getAll()
      const index = mods.findIndex((saved) => saved.modId === mod.modId)

      if (index === -1) mods.push(mod)
      else mods[index] = mod

      await this.#save(mods)
      return mods
    })
  }

  async addMany(newMods: FileInfoSaved[]): Promise<FileInfoSaved[]> {
    return this.#enqueue(async () => {
      const mods = await this.getAll()

      for (const mod of newMods) {
        const index = mods.findIndex((saved) => saved.modId === mod.modId)

        if (index === -1) mods.push(mod)
        else mods[index] = mod
      }

      await this.#save(mods)
      return mods
    })
  }

  async removeByModId(modId: number): Promise<FileInfoSaved[]> {
    return this.#enqueue(async () => {
      const mods = (await this.getAll()).filter((mod) => mod.modId !== modId)

      await this.#save(mods)
      return mods
    })
  }

  async removeByFileName(fileName: string): Promise<FileInfoSaved[]> {
    return this.#enqueue(async () => {
      const mods = (await this.getAll()).filter(
        (mod) => mod.fileName !== fileName,
      )

      await this.#save(mods)
      return mods
    })
  }

  async clear(): Promise<void> {
    return this.#enqueue(() => this.#save([]))
  }

  async #save(mods: FileInfoSaved[]) {
    await this.#store.set(MODS_KEY, mods)
    await this.#store.save()
  }

  /**
   * Serializa las escrituras para evitar condiciones de carrera cuando se
   * descargan varios mods al mismo tiempo.
   */
  #enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.#writeQueue.then(operation, operation)
    this.#writeQueue = result.catch(() => {})
    return result
  }
}

export const modsStore = new ModsStore()
