import {
  IconDownload,
  IconExternalLink,
  IconPuzzle,
  IconTrash,
} from '@tabler/icons-react'
import { CurseModInfo } from '../lib/curse-info'
import { useState } from 'react'
import clsx from 'clsx'
import { Button } from './common/button'
import { openUrl } from '@tauri-apps/plugin-opener'
import { downloadMod } from '../lib/reload/mod'
import { remove } from '@tauri-apps/plugin-fs'
import { confirm } from '@tauri-apps/plugin-dialog'
import { join } from '@tauri-apps/api/path'

export type ListItemFile =
  | {
      kind: 'unregistered'
      fileName: string
    }
  | ({
      kind: 'registered' | 'missing'
    } & CurseModInfo)

interface DownloableItemProps {
  item: ListItemFile
  modsDir: string
  loading?: boolean
  onChange: (fileName: string | null) => void
  onLoading?: (loading: boolean) => void
  onError?: (msg: string) => void
}

export function DownloableItem({
  item,
  modsDir,
  loading = false,
  onChange,
  onLoading,
  onError,
}: DownloableItemProps) {
  const registered = item.kind !== 'unregistered'
  const title = item.kind !== 'unregistered' ? item.title : item.fileName

  const handleDownload = async () => {
    if (item.kind !== 'missing') return

    onLoading?.(true)

    try {
      await downloadMod(item, modsDir, true)
      onChange(item.fileName)
    } catch (e) {
      onError?.(
        'Hubo un problema al descargar el mod. Información completa: ' + e,
      )
    } finally {
      onLoading?.(false)
    }
  }

  const handleDelete = async () => {
    if (item.kind === 'missing') return

    if (item.kind === 'registered') {
      if (
        !(await confirm(
          '¿Está seguro(a) de eliminar el mod ' + item.title + '?',
        ))
      )
        return
    } else {
      if (
        !(await confirm(
          '¿Está seguro(a) de eliminar el archivo ' + item.fileName + '?',
        ))
      )
        return
    }

    onLoading?.(true)

    try {
      await remove(await join(modsDir, item.fileName))
      onChange(null)
    } catch (e) {
      onError?.(
        'Hubo un problema al eliminar el archivo. Información completa: ' + e,
      )
    } finally {
      onLoading?.(false)
    }
  }

  return (
    <li className='relative flex min-w-0 items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-800/40 px-4 py-3 overflow-hidden'>
      <DownloableItemIcon item={item} />
      <div className='min-w-0 flex-1 overflow-hidden'>
        <p
          className={clsx(
            'truncate text-sm',
            registered ? 'font-medium' : 'font-mono',
          )}
          title={title}>
          {title}
        </p>
        {registered && (
          <p
            className='truncate font-mono text-xs text-neutral-400'
            title={item.fileName}>
            {item.fileName}
          </p>
        )}
        <p className='mt-1 truncate text-[11px] text-neutral-500'>
          {item.kind === 'unregistered' ? (
            'Sin información asociada'
          ) : (
            <>
              modId:{' '}
              <span className='font-mono text-neutral-400'>{item.modId}</span>
              {' · '}
              fileId:{' '}
              <span className='font-mono text-neutral-400'>{item.fileId}</span>
            </>
          )}
        </p>
      </div>
      {
        <div className='flex shrink-0 items-center gap-2'>
          {item.kind !== 'unregistered' && (
            <Button
              variant='secondary'
              size='icon'
              title='Abrir en CurseForge'
              className='size-8'
              onClick={() => openUrl(item.pageUrl + '/files/' + item.fileId)}>
              <IconExternalLink className='inline' size={16} />
            </Button>
          )}
          {item.kind === 'missing' ? (
            <Button
              variant='primary'
              size='icon'
              title='Descargar'
              className='size-8'
              onClick={handleDownload}>
              <IconDownload className='inline' size={16} />
            </Button>
          ) : (
            <Button
              variant='destructive'
              size='icon'
              title='Eliminar'
              className='size-8'
              onClick={handleDelete}>
              <IconTrash className='inline' size={16} />
            </Button>
          )}
        </div>
      }
      {loading && (
        <div className='absolute left-0 bottom-0 h-1 bg-amber-400/80 rounded-full w-full animate-[alternate_loading_2s_ease-in-out_infinite]'></div>
      )}
    </li>
  )
}

function DownloableItemIcon({ item }: Pick<DownloableItemProps, 'item'>) {
  const [failed, setFailed] = useState(false)

  if (item.kind === 'unregistered' || item.logo === '' || failed) {
    return (
      <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-700/50 text-neutral-400'>
        <IconPuzzle size={20} />
      </span>
    )
  }

  return (
    <img
      src={item.logo}
      alt={item.title}
      className='h-10 w-10 shrink-0 rounded-lg object-cover'
      onError={() => setFailed(true)}
    />
  )
}
