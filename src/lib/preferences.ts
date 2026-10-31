import { load, Store } from '@tauri-apps/plugin-store'
import { createContext } from 'react'

interface PreferencesOptions {
  mcDir: string
}

export class Preferences {
  #store: Store | undefined
  #loaded: boolean = false

  async load() {
    try {
      const store = await load('preferences.json', { autoSave: false })
      this.#store = store
    } finally {
      this.#loaded = true
    }
  }

  get loaded() {
    return this.#loaded
  }

  async set<T extends keyof PreferencesOptions>(
    key: T,
    value: PreferencesOptions[T],
  ) {
    if (this.#store == null) return
    await this.#store.set(key, value)
    await this.#store.save()
  }

  async get<T extends keyof PreferencesOptions>(key: T) {
    if (this.#store == null) return
    return await this.#store.get<PreferencesOptions[T]>(key)
  }

  async getOrDefault<T extends keyof PreferencesOptions>(
    key: T,
    defaultValue: PreferencesOptions[T],
  ) {
    const val = await this.get(key)
    if (val != null) return val
    if (val !== defaultValue) return val
    this.set(key, defaultValue)
    return defaultValue
  }
}

export const PreferencesContext = createContext<Preferences>(undefined!)
