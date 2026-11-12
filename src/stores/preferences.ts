import { LazyStore } from '@tauri-apps/plugin-store'
import { create } from 'zustand'

const STORE_PATH = 'preferences.json'

const store = new LazyStore(STORE_PATH, {
  autoSave: false,
  defaults: {
    mcDir: null,
    targetVersion: '1.21.1',
    targetLoader: 'NeoForge',
    notifyOnSync: true,
  },
})

interface PreferencesStore {
  load(): Promise<void>
  loading: boolean

  mcDir: string | null
  setMcDir(dir: string): Promise<void>

  /** Versión de juego esperada para los avisos de compatibilidad. */
  targetVersion: string
  setTargetVersion(version: string): Promise<void>

  /** Loader esperado (solo aplica a mods). */
  targetLoader: string
  setTargetLoader(loader: string): Promise<void>

  /** Avisar con una notificación del sistema al terminar sincronizaciones. */
  notifyOnSync: boolean
  setNotifyOnSync(notify: boolean): Promise<void>
}

async function persist(key: string, value: unknown) {
  await store.set(key, value)
  await store.save()
}

export const usePreferencesStore = create<PreferencesStore>((set) => ({
  load: async () => {
    const obj: Partial<PreferencesStore> = { loading: false }

    const dir = await store.get('mcDir')
    if (typeof dir === 'string') obj.mcDir = dir

    const version = await store.get('targetVersion')
    if (typeof version === 'string') obj.targetVersion = version

    const loader = await store.get('targetLoader')
    if (typeof loader === 'string') obj.targetLoader = loader

    const notify = await store.get('notifyOnSync')
    if (typeof notify === 'boolean') obj.notifyOnSync = notify

    set(obj)
  },
  loading: true,

  mcDir: null,
  setMcDir: async (dir) => {
    if (dir == null || dir === '') return

    await persist('mcDir', dir)
    set({ mcDir: dir })
  },

  targetVersion: '1.21.1',
  setTargetVersion: async (version) => {
    const value = version.trim()
    if (value === '') return

    await persist('targetVersion', value)
    set({ targetVersion: value })
  },

  targetLoader: 'NeoForge',
  setTargetLoader: async (loader) => {
    const value = loader.trim()
    if (value === '') return

    await persist('targetLoader', value)
    set({ targetLoader: value })
  },

  notifyOnSync: true,
  setNotifyOnSync: async (notify) => {
    await persist('notifyOnSync', notify)
    set({ notifyOnSync: notify })
  },
}))
