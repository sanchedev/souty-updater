import {
  IconDownload,
  IconExternalLink,
  IconPuzzle,
  IconTrash,
} from '@tabler/icons-react'
import { useState } from 'react'
import clsx from 'clsx'
import { Button } from './common/button'
import { Slot } from './common/slot'
import { openUrl } from '@tauri-apps/plugin-opener'
import { remove } from '@tauri-apps/plugin-fs'
import { confirm } from '@tauri-apps/plugin-dialog'
import { join } from '@tauri-apps/api/path'
import { CONTENT_KINDS } from '../lib/content-kinds'
import { downloadPack, packDownloadPage } from '../lib/curseforge'
import type { ContentItem } from '../lib/content-types'

interface PackItemProps {
  item: ContentItem
  dir: string
  onChanged: () => void
  onError?: (msg: string) => void
}

export function PackItem({
  item,
  dir,
  onChanged,
  onError,
}: PackItemProps) {
  const [busy, setBusy] = useState(false)

  const registered = item.status !== 'unregistered'
  const title = item.status !== 'unregistered' ? item.title : item.fileName

  const handleDownload = async () => {
    if (item.status !== 'missing') return

    setBusy(true)

    try {
      await downloadPack(item, dir)
      onChanged()
    } catch (e) {
      onError?.(
        'Hubo un problema al descargar el elemento. Información completa: ' + e,
      )
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (item.status === 'missing') return

    const singular = CONTENT_KINDS[item.content].singular
    const noun = item.status === 'registered' ? singular : 'archivo'
    const name = item.status === 'registered' ? item.title : item.fileName

    if (!(await confirm(`¿Está seguro(a) de eliminar ${noun} ${name}?`))) return

    setBusy(true)

    try {
      await remove(await join(dir, item.fileName))
      onChanged()
    } catch (e) {
      onError?.(
        'Hubo un problema al eliminar el archivo. Información completa: ' + e,
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className='relative flex min-w-0 items-center gap-3 overflow-hidden rounded-sm border border-edge bg-panel/50 px-4 py-3 transition-colors hover:border-edge-strong'>
      <PackItemIcon item={item} />
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
          {item.status === 'unregistered' ? (
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
      <div className='flex shrink-0 items-center gap-2'>
        {registered && (
          <Button
            variant='secondary'
            size='icon'
            title='Abrir en CurseForge'
            className='size-8'
            icon={<IconExternalLink size={16} />}
            onClick={() => openUrl(packDownloadPage(item))}
          />
        )}
        {item.status === 'missing' ? (
          item.downloadUrl != null ? (
            <Button
              variant='primary'
              size='icon'
              title='Descargar'
              className='size-8'
              loading={busy}
              icon={<IconDownload size={16} />}
              onClick={handleDownload}
            />
          ) : (
            <Button
              variant='outline'
              size='icon'
              title='Sin descarga directa: abrir página'
              className='size-8'
              icon={<IconDownload size={16} />}
              onClick={() => openUrl(packDownloadPage(item))}
            />
          )
        ) : (
          <Button
            variant='destructive'
            size='icon'
            title='Eliminar'
            className='size-8'
            icon={<IconTrash size={16} />}
            onClick={handleDelete}
          />
        )}
      </div>
      {busy && (
        <div className='absolute bottom-0 left-0 h-1 w-full animate-loading rounded-xs bg-brand-400/80' />
      )}
    </li>
  )
}

function PackItemIcon({ item }: Pick<PackItemProps, 'item'>) {
  const [failed, setFailed] = useState(false)

  if (item.status === 'unregistered' || item.logo === '' || failed) {
    return (
      <Slot>
        <IconPuzzle size={20} className='text-neutral-400' />
      </Slot>
    )
  }

  return (
    <Slot>
      <img
        src={item.logo}
        alt={item.title}
        className='h-full w-full object-cover'
        onError={() => setFailed(true)}
      />
    </Slot>
  )
}
