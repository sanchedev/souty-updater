import { useCallback, useEffect, useState } from 'react'
import { exists, readDir } from '@tauri-apps/plugin-fs'
import {
  CONTENT_KIND_IDS,
  packsDir,
  type ContentKind,
} from '../lib/content-kinds'
import { packStore } from '../lib/content-store'
import {
  useDiagnosticsStore,
  type KindDiagnostics,
} from '../stores/diagnostics'

/** Resumen de salud de un tipo de contenido. */
export interface KindStatus {
  kind: ContentKind
  path: string | null
  exists: boolean
  fileCount: number
  savedCount: number
  registered: number
  missing: number
  unregistered: number
  diagnostics: KindDiagnostics
}

/**
 * Diagnóstico de las carpetas y listas de los 3 tipos, con
 * re-ejecución manual (`refresh`).
 */
export function useDiagnostics(mcDir: string | null) {
  const [status, setStatus] = useState<Record<
    ContentKind,
    KindStatus
  > | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)

    try {
      const result = {} as Record<ContentKind, KindStatus>

      for (const kind of CONTENT_KIND_IDS) {
        const path = mcDir == null ? null : packsDir(mcDir, kind)

        let folderExists = false
        let files: string[] = []

        if (path != null) {
          folderExists = await exists(path)
          if (folderExists) {
            files = (await readDir(path))
              .filter((entry) => entry.isFile)
              .map((entry) => entry.name)
          }
        }

        const saved = await packStore.getByKind(kind)
        const savedNames = new Set(saved.map((pack) => pack.fileName))
        const registered = files.filter((file) => savedNames.has(file)).length

        result[kind] = {
          kind,
          path,
          exists: folderExists,
          fileCount: files.length,
          savedCount: saved.length,
          registered,
          missing: saved.length - registered,
          unregistered: files.length - registered,
          diagnostics: useDiagnosticsStore.getState().all[kind],
        }
      }

      setStatus(result)
      setError(null)
    } catch (e) {
      setError('No se pudo generar el diagnóstico. Información completa: ' + e)
    } finally {
      setLoading(false)
    }
  }, [mcDir])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { status, loading, error, setError, refresh }
}
