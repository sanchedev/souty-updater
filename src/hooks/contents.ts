import { useCallback, useEffect, useMemo, useState } from 'react'
import { readDir } from '@tauri-apps/plugin-fs'
import { packStore } from '../lib/content-store'
import { packsDir, type ContentKind } from '../lib/content-kinds'
import {
  mergeContents,
  type PackInfo,
} from '../lib/content-types'

/**
 * Lista de elementos de un tipo de contenido, cruzando la lista de
 * referencia guardada con lo que hay en su carpeta.
 */
export function useContents(kind: ContentKind, mcDir: string | null) {
  const [saved, setSaved] = useState<PackInfo[]>([])
  const [files, setFiles] = useState<string[]>([])
  const [dir, setDir] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    packStore
      .getByKind(kind)
      .then((packs) => active && setSaved(packs))
      .catch(
        () =>
          active &&
          setError('No se pudo cargar la lista de referencia guardada.'),
      )

    return () => {
      active = false
    }
  }, [kind])

  useEffect(
    () =>
      packStore.on((changed) => {
        if (changed === kind) packStore.getByKind(kind).then(setSaved)
      }),
    [kind],
  )

  const reload = useCallback(async () => {
    if (mcDir == null) {
      setDir(null)
      setFiles([])
      return
    }

    const dir = packsDir(mcDir, kind)
    setLoading(true)

    try {
      const entries = await readDir(dir)
      setFiles(entries.filter((e) => e.isFile).map((e) => e.name))
      setError(null)
    } catch {
      setFiles([])
      setError(
        `No se pudo leer la carpeta ${dir}. Si es la primera vez, créala o descarga algo para generarla.`,
      )
    } finally {
      setDir(dir)
      setLoading(false)
    }
  }, [mcDir, kind])

  useEffect(() => {
    reload()
  }, [reload])

  const items = useMemo(
    () => mergeContents(saved, files, kind),
    [saved, files, kind],
  )

  return { items, dir, loading, error, setError, reload }
}
