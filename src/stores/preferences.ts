import { LazyStore } from '@tauri-apps/plugin-store'
import { create } from 'zustand'

const STORE_PATH = 'preferences.json'

const store = new LazyStore(STORE_PATH, {
  autoSave: false,
  defaults: {
    mcDir: null,
  },
})

interface PreferencesStore {
  load(): Promise<void>
  loading: boolean

  mcDir: string | null

  setMcDir(dir: string): Promise<void>
}

export const usePreferencesStore = create<PreferencesStore>((set) => ({
  load: async () => {
    const obj: Partial<PreferencesStore> = { loading: false }

    const dir = await store.get('mcDir')
    if (typeof dir === 'string') obj.mcDir = dir

    set(obj)
  },
  loading: true,

  mcDir: null,

  setMcDir: async (dir) => {
    if (dir == null || dir === '') return

    await store.set('mcDir', dir)
    await store.save()
    set({ mcDir: dir })
  },
}))
