import { useState } from 'react'
import {
  IconDownload,
  IconExternalLink,
  IconFolderOff,
  IconPalette,
  IconPuzzle,
  IconRadar2,
  IconReload,
  IconSparkles,
  IconTrash,
  type Icon,
} from '@tabler/icons-react'
import { usePreferencesStore } from '../../stores/preferences'
import { useContents } from '../../hooks/contents'
import { useSync } from '../../hooks/sync'
import {
  CONTENT_KIND_IDS,
  CONTENT_KINDS,
  type ContentKind,
} from '../../lib/content-kinds'
import type { ItemStatus } from '../../lib/content-types'
import { PackItem } from '../pack-item'
import { Alert } from '../common/alert'
import { Button, type ButtonVariant } from '../common/button'
import { EmptyState } from '../common/empty-state'
import { MicroLabel } from '../common/micro-label'
import { PixelProgress } from '../common/progress'
import { Pill } from '../common/pill'
import { ModRowSkeleton } from '../common/skeleton'
import { Tabs, type TabItem } from '../common/tabs'

const KIND_ICONS: Record<ContentKind, Icon> = {
  mod: IconPuzzle,
  resourcepack: IconPalette,
  shaderpack: IconSparkles,
}

type StatusFilter = 'all' | ItemStatus

const STATUS_NAMES: Record<ItemStatus, string> = {
  registered: 'descargados',
  missing: 'faltantes',
  unregistered: 'desconocidos',
}

interface ToolbarAction {
  id: string
  label: string
  icon: Icon
  variant: ButtonVariant
  className?: string
  title: string
  onClick: () => void
}

export function ContentPage() {
  const mcDir = usePreferencesStore((s) => s.mcDir)

  const [kind, setKind] = useState<ContentKind>('mod')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const { items, dir, loading, error, setError, reload } = useContents(
    kind,
    mcDir,
  )
  const { busy, progress, refreshList, removeExtras, downloadMissing, openFolder } =
    useSync({ kind, dir, items, reload, onError: setError })

  const meta = CONTENT_KINDS[kind]
  const disabled = loading || busy

  const counts = {
    registered: items.filter((item) => item.status === 'registered').length,
    missing: items.filter((item) => item.status === 'missing').length,
    unregistered: items.filter((item) => item.status === 'unregistered').length,
  }

  const filtered = items.filter(
    (item) => statusFilter === 'all' || item.status === statusFilter,
  )

  const kindTabs: TabItem<ContentKind>[] = CONTENT_KIND_IDS.map((id) => {
    const KindIcon = KIND_ICONS[id]
    return {
      id,
      label: CONTENT_KINDS[id].label,
      icon: <KindIcon size={16} />,
      panelId: 'content-list',
    }
  })

  const actions: ToolbarAction[] = [
    {
      id: 'update',
      label: 'actualizar',
      icon: IconRadar2,
      variant: 'primary',
      title: `Actualizar la lista de ${meta.label.toLowerCase()} desde la nube`,
      onClick: refreshList,
    },
    {
      id: 'delete',
      label: 'eliminar',
      icon: IconTrash,
      variant: 'destructive',
      title: 'Eliminar archivos sobrantes',
      onClick: removeExtras,
    },
    {
      id: 'download',
      label: 'descargar',
      icon: IconDownload,
      variant: 'secondary',
      className:
        'bg-lime-400 hover:bg-lime-300 text-neutral-900 font-semibold bevel shadow-[0_2px_0_0_rgb(0_0_0/0.45)] hover:-translate-y-px active:translate-y-0 active:shadow-none',
      title: 'Descargar lo faltante',
      onClick: downloadMissing,
    },
    {
      id: 'reload',
      label: 'recargar',
      icon: IconReload,
      variant: 'outline',
      title: 'Releer la carpeta',
      onClick: reload,
    },
    {
      id: 'open',
      label: 'abrir',
      icon: IconExternalLink,
      variant: 'ghost',
      title: 'Abrir la carpeta',
      onClick: openFolder,
    },
  ]

  return (
    <main className='min-h-0 flex-1 overflow-y-auto p-4'>
      <div className='mx-auto flex w-full max-w-4xl min-w-0 flex-col gap-4'>
        <div className='flex flex-col justify-center gap-3'>
          <Tabs items={kindTabs} value={kind} onChange={setKind} />

          <div className='flex flex-wrap items-center gap-2'>
            {actions.map((action) => (
              <Button
                key={action.id}
                size='sm'
                variant={action.variant}
                className={action.className}
                title={action.title}
                disabled={disabled}
                icon={<action.icon size={14} />}
                onClick={action.onClick}>
                {action.label}
              </Button>
            ))}
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <MicroLabel className='text-neutral-400'>Filtros</MicroLabel>
            <Pill
              tone='success'
              active={statusFilter === 'registered'}
              count={counts.registered}
              title='Instalados y reconocidos'
              onClick={() =>
                setStatusFilter((f) =>
                  f === 'registered' ? 'all' : 'registered',
                )
              }>
              {STATUS_NAMES.registered}
            </Pill>
            <Pill
              tone='brand'
              active={statusFilter === 'missing'}
              count={counts.missing}
              title='En la lista pero ausentes de la carpeta'
              onClick={() =>
                setStatusFilter((f) => (f === 'missing' ? 'all' : 'missing'))
              }>
              {STATUS_NAMES.missing}
            </Pill>
            <Pill
              tone='danger'
              active={statusFilter === 'unregistered'}
              count={counts.unregistered}
              title='Archivos que no reconocemos como parte de la lista'
              onClick={() =>
                setStatusFilter((f) =>
                  f === 'unregistered' ? 'all' : 'unregistered',
                )
              }>
              {STATUS_NAMES.unregistered}
            </Pill>
          </div>
        </div>

        {progress != null && (
          <div className='bevel rounded-sm border border-edge bg-panel p-4'>
            <div className='flex items-center justify-between gap-3'>
              <MicroLabel>Progreso</MicroLabel>
              <span
                className='min-w-0 truncate font-mono text-xs text-neutral-400'
                title={progress.label}>
                {progress.label} · {progress.done} / {progress.total}
              </span>
            </div>
            <PixelProgress
              className='mt-2'
              value={progress.done}
              max={progress.total}
            />
          </div>
        )}

        {error != null && (
          <Alert tone='error' onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && items.length === 0 ? (
          <div className='flex flex-col gap-2'>
            {Array.from({ length: 6 }, (_, i) => (
              <ModRowSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={IconFolderOff}
            title={
              mcDir == null
                ? 'No hay una carpeta configurada'
                : `No hay ${meta.label.toLowerCase()} para mostrar`
            }
            description={
              mcDir == null
                ? 'Selecciona tu carpeta de Minecraft en Principal para empezar.'
                : statusFilter === 'all'
                  ? `Los archivos de ${meta.folder} aparecerán aquí.`
                  : `No hay ${STATUS_NAMES[statusFilter]} para mostrar.`
            }
          />
        ) : (
          <ul
            id='content-list'
            key={kind}
            className='flex min-w-0 animate-fade-in flex-col gap-2'>
            {filtered.map(
              (item) =>
                dir != null && (
                  <PackItem
                    key={item.fileName}
                    item={item}
                    dir={dir}
                    onChanged={reload}
                    onError={(m) => setError(m)}
                  />
                ),
            )}
          </ul>
        )}
      </div>
    </main>
  )
}
