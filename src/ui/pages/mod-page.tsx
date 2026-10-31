import { useContext, useEffect, useMemo, useState } from 'react'
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconDownload,
  IconExternalLink,
  IconFile,
  IconFolderOff,
  IconLoader2,
  IconPuzzle,
  IconRefresh,
  IconReload,
  IconSearch,
} from '@tabler/icons-react'
import { join } from '@tauri-apps/api/path'
import { readDir } from '@tauri-apps/plugin-fs'
import { openUrl } from '@tauri-apps/plugin-opener'
import { PreferencesContext } from '../../lib/preferences'
import { modsStore } from '../../lib/mods-store'
import { fetchModsList } from '../../lib/mods-list'
import { type CurseModInfo } from '../../lib/curse-info'
import type { FileInfo, FileInfoSaved } from '../../lib/types'
import { Button } from '../common/button'
import { downloadMods, fetchMods } from '../../lib/reload/mod'

interface ModEntry {
  fileName: string
  saved: FileInfoSaved | null
}

export function ModPage() {
  const preferences = useContext(PreferencesContext)
  const [mcDir, setMcDir] = useState<string | null>(null)
  const [modsDir, setModsDir] = useState<string | null>(null)
  const [mods, setMods] = useState<ModEntry[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloading, setReloading] = useState<'single' | 'all' | null>(null)
  const [reloadStatus, setReloadStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)

  function loader() {
    const state = { active: true }

    return {
      state,
      load: async () => {
        setLoading(true)
        setError(null)

        try {
          const [dir, saved] = await Promise.all([
            preferences.get('mcDir'),
            modsStore.getAll(),
          ])

          if (!state.active) return

          setMcDir(dir ?? null)

          if (dir == null) {
            setMods([])
            return
          }

          const savedByName = new Map(
            saved.map((mod) => [mod.fileName.toLowerCase(), mod]),
          )
          const modsDir = await join(dir, 'mods')
          const entries = await readDir(modsDir)
          setModsDir(modsDir)

          if (!state.active) return

          const files = entries
            .filter((entry) => entry.isFile)
            .map((entry) => entry.name)
            .sort((a, b) => a.localeCompare(b))

          setMods(
            files.map((fileName) => ({
              fileName,
              saved: savedByName.get(fileName.toLowerCase()) ?? null,
            })),
          )
        } catch (e) {
          alert(JSON.stringify(e))
          if (!state.active) return

          setMods([])
          setError(
            'No se pudo leer la carpeta de mods. Verifica que exista y que hayas seleccionado la carpeta de Minecraft en Principal.',
          )
        } finally {
          if (state.active) setLoading(false)
        }
      },
    }
  }

  useEffect(() => {
    const { load, state } = loader()
    load()

    return () => {
      state.active = false
    }
  }, [preferences])

  async function reloadList(mode: 'single' | 'all') {
    if (reloading != null || modsDir == null) return

    setReloading(mode)
    setReloadStatus(null)

    try {
      const list = await fetchModsList()
      alert('Se obtuvieron los mods, en total ' + list.length)
      const mods = await fetchMods()
      alert('Se cargaron los mods en memoria')

      let state = { active: false }
      await downloadMods(mode === 'all', modsDir, mods, () => {
        if (state.active) state.active = false
        const s = loader()
        s.load()
        state = s.state
      })

      setReloadStatus({
        kind: 'success',
        message: `Lista descargada: ${list.length} mod${list.length === 1 ? '' : 's'}.`,
      })
    } catch (e) {
      setReloadStatus({
        kind: 'error',
        message: (e as Error).message,
      })
    } finally {
      setReloading(null)
    }
  }

  const filteredMods = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (term === '') return mods

    return mods.filter(({ fileName, saved }) =>
      [fileName, saved?.title, saved?.modId, saved?.fileId]
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [mods, query])

  const savedCount = mods.filter((mod) => mod.saved != null).length

  return (
    <main className='flex-1 min-h-0 overflow-y-auto p-4'>
      <div className='mx-auto flex w-full max-w-4xl min-w-0 flex-col gap-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              variant='secondary'
              className='flex items-center gap-2 bg-neutral-700 text-neutral-50 hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-60'
              disabled={reloading != null}
              onClick={() => reloadList('single')}>
              {reloading === 'single' ? (
                <IconLoader2 size={16} className='animate-spin' />
              ) : (
                <IconRefresh size={16} />
              )}
              Recargar
            </Button>
            <Button
              variant='secondary'
              className='flex items-center gap-2 bg-neutral-700 text-neutral-50 hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-60'
              disabled={reloading != null}
              onClick={() => reloadList('all')}>
              {reloading === 'all' ? (
                <IconLoader2 size={16} className='animate-spin' />
              ) : (
                <IconReload size={16} />
              )}
              Recargar todos
            </Button>
          </div>

          {reloadStatus != null && (
            <p
              className={
                reloadStatus.kind === 'success'
                  ? 'text-xs text-emerald-300'
                  : 'text-xs text-red-300'
              }>
              {reloadStatus.message}
            </p>
          )}
        </div>

        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='relative w-full sm:max-w-sm'>
            <IconSearch
              size={18}
              className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400'
            />
            <input
              type='search'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Buscar mods...'
              className='w-full rounded-lg border border-neutral-700 bg-neutral-900/60 py-2 pr-3 pl-10 text-sm outline-none transition-colors placeholder:text-neutral-500 focus:border-amber-400/60'
            />
          </div>

          <div className='flex flex-wrap items-center gap-2 text-xs'>
            <span className='rounded-full bg-amber-400/10 px-3 py-1 font-medium text-amber-300'>
              {filteredMods.length === mods.length
                ? `${mods.length} mods`
                : `${filteredMods.length} de ${mods.length} mods`}
            </span>
            {savedCount > 0 && (
              <span className='rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300'>
                {savedCount} con información
              </span>
            )}
          </div>
        </div>

        {error != null && (
          <div className='flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300'>
            <IconAlertTriangle size={20} className='mt-0.5 shrink-0' />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className='flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800/40 p-8 text-sm text-neutral-400'>
            <IconLoader2 size={18} className='animate-spin' />
            Leyendo carpeta de mods...
          </div>
        ) : mods.length === 0 ? (
          error == null && <EmptyState configured={mcDir != null} />
        ) : filteredMods.length === 0 ? (
          <div className='rounded-xl border border-neutral-700 bg-neutral-800/40 p-8 text-center text-sm text-neutral-400'>
            No hay mods que coincidan con la búsqueda.
          </div>
        ) : (
          <ul className='flex min-w-0 flex-col gap-2'>
            {filteredMods.map((mod) => (
              <ModRow key={mod.fileName} mod={mod} />
            ))}
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

function ModRow({ mod }: { mod: ModEntry }) {
  if (mod.saved == null) {
    return (
      <li className='flex min-w-0 items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-800/40 px-4 py-3'>
        <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-700/50 text-neutral-400'>
          <IconFile size={20} />
        </span>
        <div className='min-w-0 flex-1 overflow-hidden'>
          <p className='truncate font-mono text-sm' title={mod.fileName}>
            {mod.fileName}
          </p>
          <p className='truncate text-xs text-neutral-500'>
            Sin información asociada
          </p>
        </div>
      </li>
    )
  }

  const { title, logo, fileName, modId, fileId, curseUrl } = mod.saved

  return (
    <li className='flex min-w-0 items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-800/40 px-4 py-3'>
      <ModLogo src={logo} title={title} />
      <div className='min-w-0 flex-1 overflow-hidden'>
        <p className='truncate text-sm font-medium' title={title}>
          {title}
        </p>
        <p
          className='truncate font-mono text-xs text-neutral-400'
          title={fileName}>
          {fileName}
        </p>
        <p className='mt-1 truncate text-[11px] text-neutral-500'>
          modId: <span className='font-mono text-neutral-400'>{modId}</span>
          {' · '}
          fileId: <span className='font-mono text-neutral-400'>{fileId}</span>
        </p>
      </div>
      <div className='flex shrink-0 items-center gap-2'>
        <span className='hidden items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300 xl:inline-flex'>
          <IconCircleCheck size={14} />
          Con información
        </span>
        {curseUrl && (
          <Button
            variant='secondary'
            className='bg-neutral-700 text-xs text-neutral-50 hover:bg-neutral-600'
            title='Abrir en CurseForge'
            onClick={() => openCurseForge(curseUrl)}>
            <IconExternalLink className='inline' size={16} /> CurseForge
          </Button>
        )}
      </div>
    </li>
  )
}

function openCurseForge(url: string) {
  openUrl(url).catch(() => {})
}

function ModLogo({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false)

  if (src === '' || failed) {
    return (
      <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-700/50 text-neutral-400'>
        <IconPuzzle size={20} />
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={title}
      className='h-10 w-10 shrink-0 rounded-lg object-cover'
      onError={() => setFailed(true)}
    />
  )
}
