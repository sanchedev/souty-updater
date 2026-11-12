import { LazyStore } from '@tauri-apps/plugin-store'
import { create } from 'zustand'
import { CONTENT_KIND_IDS, type ContentKind } from '../lib/content-kinds'

const STORE_PATH = 'diagnostics.json'

const store = new LazyStore(STORE_PATH, {
  autoSave: false,
  defaults: {},
})

/** Estado persistido por tipo de contenido. */
export interface KindDiagnostics {
  /** ISO del último refresh exitoso, o `null` si nunca se hizo. */
  lastRefresh: string | null
  /** Avisos de compatibilidad del último refresh/revisión. */
  warnings: string[]
}

function emptyKind(): KindDiagnostics {
  return { lastRefresh: null, warnings: [] }
}

function emptyAll(): Record<ContentKind, KindDiagnostics> {
  return {
    mod: emptyKind(),
    resourcepack: emptyKind(),
    shaderpack: emptyKind(),
  }
}

interface DiagnosticsStore {
  loading: boolean
  all: Record<ContentKind, KindDiagnostics>

  load(): Promise<void>
  /** Guarda los avisos y marca el momento del refresh. */
  recordRefresh(kind: ContentKind, warnings: string[]): Promise<void>
  /** Guarda avisos de una revisión local, sin tocar el timestamp de refresh. */
  setWarnings(kind: ContentKind, warnings: string[]): Promise<void>
}

async function persist(kind: ContentKind, entry: KindDiagnostics) {
  await store.set(kind, entry)
  await store.save()
}

export const useDiagnosticsStore = create<DiagnosticsStore>((set, get) => ({
  loading: true,
  all: emptyAll(),

  load: async () => {
    const all = emptyAll()

    for (const kind of CONTENT_KIND_IDS) {
      const saved = await store.get<KindDiagnostics>(kind)
      if (saved != null) {
        all[kind] = {
          lastRefresh: typeof saved.lastRefresh === 'string' ? saved.lastRefresh : null,
          warnings: Array.isArray(saved.warnings) ? saved.warnings : [],
        }
      }
    }

    set({ all, loading: false })
  },

  recordRefresh: async (kind, warnings) => {
    const entry: KindDiagnostics = {
      lastRefresh: new Date().toISOString(),
      warnings,
    }

    await persist(kind, entry)
    set((s) => ({ all: { ...s.all, [kind]: entry } }))
  },

  setWarnings: async (kind, warnings) => {
    const current = get().all[kind] ?? emptyKind()
    const entry: KindDiagnostics = { ...current, warnings }

    await persist(kind, entry)
    set((s) => ({ all: { ...s.all, [kind]: entry } }))
  },
}))
