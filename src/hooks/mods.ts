import { useEffect, useState } from 'react'
import { modsStore } from '../lib/mods-store'
import { join } from '@tauri-apps/api/path'
import { readDir } from '@tauri-apps/plugin-fs'
import { ListItemFile } from '../ui/downloable-item'
import { FileInfoSaved } from '../lib/types'
import { usePreferencesStore } from '../stores/preferences'

function useSavedMods(
  setLoading: (loading: boolean) => void,
  setError: (msg: string) => void,
) {
  const [mods, setMods] = useState<FileInfoSaved[]>([])

  useEffect(() => {
    modsStore.on((mods) => setMods(() => mods))

    setLoading(true)
    modsStore
      .getAll()
      .then(setMods)
      .catch(() =>
        setError('Hubo un error al cargar la lista de mods guardados.'),
      )
      .finally(() => setLoading(false))
  }, [])

  useEffect
  return mods
}

export function useMods(
  setLoading: (loading: boolean) => void,
  setError: (msg: string) => void,
) {
  const mcDir = usePreferencesStore((s) => s.mcDir)
  const savedMods = useSavedMods(setLoading, setError)

  const [modsList, setModsList] = useState<string[]>([])
  const [mods, setMods] = useState<ListItemFile[]>([])

  const [modsDir, setModsDir] = useState<string | null>(null)

  const reloadMods = async () => {
    if (mcDir == null) return

    setLoading(true)
    try {
      const modsDir = await join(mcDir, 'mods')
      const entries = await readDir(modsDir)

      setModsDir(modsDir)
      setModsList(() => entries.filter((e) => e.isFile).map((e) => e.name))
    } catch {
      setError(
        'Hubo un problema conectando la carpeta del minecraft a la de mods.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reloadMods()
  }, [mcDir])

  useEffect(() => {
    const savedByName = new Set(modsList)

    const list: ListItemFile[] = []

    for (const mod of savedMods) {
      list.push({
        kind: savedByName.has(mod.fileName) ? 'registered' : 'missing',
        ...mod,
      })
      savedByName.delete(mod.fileName)
    }

    for (const fileName of savedByName) {
      list.push({
        kind: 'unregistered',
        fileName: fileName,
      })
    }

    setMods(
      list.sort((a, b) => {
        const titleA = a.kind === 'unregistered' ? a.fileName : a.title
        const titleB = b.kind === 'unregistered' ? b.fileName : b.title
        return titleA.localeCompare(titleB)
      }),
    )
  }, [modsList, savedMods])

  return { mods, modsDir, reloadMods }
}
