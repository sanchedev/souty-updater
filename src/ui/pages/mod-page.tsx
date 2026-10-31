import { useState } from 'react'
import {
  IconAlertTriangle,
  IconDownload,
  IconExternalLink,
  IconFolderOff,
  IconRadar2,
  IconReload,
  IconTrash,
} from '@tabler/icons-react'
import { modsStore } from '../../lib/mods-store'
import { downloadMod, fetchMods } from '../../lib/reload/mod'
import { DownloableItem } from '../downloable-item'
import { useMods } from '../../hooks/mods'
import { usePreferencesStore } from '../../stores/preferences'
import { confirm } from '@tauri-apps/plugin-dialog'
import { join } from '@tauri-apps/api/path'
import { remove } from '@tauri-apps/plugin-fs'
import { openUrl, revealItemInDir } from '@tauri-apps/plugin-opener'
import { CurseModInfo } from '../../lib/curse-info'

export function ModPage() {
  const mcDir = usePreferencesStore((s) => s.mcDir)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { mods, modsDir, reloadMods } = useMods(setLoading, setError)

  const [reloading, setReloading] = useState<'single' | 'all' | null>(null)

  const [loadings, setLoadings] = useState<Record<string, boolean>>({})

  const setLoadingMod = (fileName: string, loading: boolean) => {
    setLoadings((ls) => {
      const newLs = { ...ls }
      newLs[fileName] = loading
      return newLs
    })
  }

  const reloadList = async () => {
    if (reloading != null || mcDir == null) return

    try {
      const mods = await fetchMods()
      await modsStore.addMany(mods)
      await reloadMods()
    } catch (e) {
      setError('No se pudo cargar la lista nueva de elementos.\nError: ' + e)
    } finally {
      setReloading(null)
    }
  }

  const deleteOthers = async () => {
    if (modsDir == null) return

    setLoading(true)
    try {
      if (
        !(await confirm(
          '¿Desea eliminar los archivos que no correspondan a mods de esta carpeta? Esta acción no se puede deshacer.',
        ))
      )
        return

      for (const mod of mods) {
        if (mod.kind !== 'unregistered') continue

        try {
          const filePath = await join(modsDir, mod.fileName)
          await remove(filePath)
          reloadMods()
        } catch (e) {
          setError?.(
            'Hubo un problema al eliminar el archivo ' +
              mod.fileName +
              '. Información completa: ' +
              e,
          )
        }
      }
    } catch (e) {
      setError(
        'Hubo un error al descargar los mods. Información completa: ' + e,
      )
    } finally {
      setLoading(false)
    }
  }

  const downloadRemaining = async () => {
    if (modsDir == null) return
    if (mods.every((m) => m.kind !== 'missing')) return

    setLoading(true)
    try {
      if (
        !(await confirm(
          'Por el momento las descargas no se pueden cancelar. ¿Desea descargas todos los mods restantes?',
        ))
      ) {
        setLoading(false)
        return
      }

      const missingMods = mods.filter(
        (m) => m.kind === 'missing',
      ) as CurseModInfo[]

      if (missingMods.every((mod) => mod.downloadUrl == null)) {
        if (
          !(await confirm(
            'Se detectó que los mods faltantes no tienen URLs de descarga disponibles. ¿Deseas hacerlo manualmente?',
          ))
        ) {
          setLoading(false)
          return
        }

        await Promise.allSettled(
          missingMods.map((mod) =>
            openUrl(mod.pageUrl + '/files/' + mod.fileId),
          ),
        )
        setLoading(false)
        return
      }

      for (const mod of missingMods) {
        try {
          setLoadingMod(mod.fileName, true)
          await downloadMod(mod, modsDir)
          reloadMods()
        } catch (e) {
          setError?.(
            'Hubo un problema al descargar el mod. Información completa: ' + e,
          )
        } finally {
          setLoadingMod(mod.fileName, false)
        }
      }
    } catch (e) {
      setError(
        'Hubo un error al descargar los mods. Información completa: ' + e,
      )
    } finally {
      setLoading(false)
    }
  }

  const savedCount = mods.filter((mod) => mod.kind === 'registered').length

  return (
    <main className='flex-1 min-h-0 overflow-y-auto p-4'>
      <div className='mx-auto flex w-full max-w-4xl min-w-0 flex-col gap-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          {savedCount > 0 && (
            <div className='flex flex-wrap items-center gap-2 text-xs'>
              <button
                className='text-start rounded-full bg-amber-300 hover:bg-amber-400 px-3 py-1 text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors'
                onClick={() => reloadList()}
                disabled={loading}>
                <IconRadar2 size={12} className='inline' /> actualizar
              </button>
              <button
                className='text-start rounded-full bg-red-300 hover:bg-red-400 px-3 py-1 text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors'
                onClick={() => deleteOthers()}
                title='Eliminar sobrantes'
                disabled={loading}>
                <IconTrash size={12} className='inline' /> eliminar
              </button>
              <button
                className='text-start rounded-full bg-lime-300 hover:bg-lime-400 px-3 py-1 text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors'
                onClick={() => downloadRemaining()}
                title='Descargar restantes'
                disabled={loading}>
                <IconDownload size={12} className='inline' /> descargar
              </button>
              <button
                className='text-start rounded-full bg-cyan-300 hover:bg-cyan-400 px-3 py-1 text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors'
                onClick={() => reloadMods()}
                disabled={loading}>
                <IconReload size={12} className='inline' /> recargar
              </button>
              <button
                className='text-start rounded-full bg-neutral-300 hover:bg-neutral-400 px-3 py-1 text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors'
                onClick={() => modsDir && revealItemInDir(modsDir)}
                disabled={loading}>
                <IconExternalLink size={12} className='inline' /> abrir
              </button>
            </div>
          )}
        </div>

        {error != null && (
          <div className='flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300'>
            <IconAlertTriangle size={20} className='mt-0.5 shrink-0' />
            <p>{error}</p>
          </div>
        )}

        {mods.length === 0 ? (
          <EmptyState configured={mcDir != null} />
        ) : (
          <ul className='flex min-w-0 flex-col gap-2'>
            {mods.map(
              (mod) =>
                modsDir != null && (
                  <DownloableItem
                    key={mod.fileName}
                    item={mod}
                    modsDir={modsDir}
                    loading={loadings[mod.fileName]}
                    onChange={reloadMods}
                    onLoading={(l) => {
                      setLoading(l)
                      setLoadingMod(mod.fileName, l)
                    }}
                    onError={setError}
                  />
                ),
            )}
          </ul>
        )}
      </div>
    </main>
  )
}

function EmptyState({ configured }: { configured: boolean }) {
  return (
    <div className='flex flex-col items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800/40 p-8 text-center'>
      <IconFolderOff size={28} className='text-neutral-500' />
      <p className='text-sm font-medium'>
        {configured
          ? 'No hay mods en la carpeta'
          : 'No hay una carpeta configurada'}
      </p>
      <p className='text-xs text-neutral-400'>
        {configured
          ? 'Cuando agregues archivos a la carpeta mods aparecerán aquí.'
          : 'Selecciona tu carpeta de Minecraft en Principal para empezar.'}
      </p>
    </div>
  )
}
