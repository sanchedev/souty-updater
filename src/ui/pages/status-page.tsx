import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCloud,
  IconInfoCircle,
  IconRefresh,
  type Icon,
} from '@tabler/icons-react'
import clsx from 'clsx'
import pkg from '../../../package.json'
import { useDiagnostics, type KindStatus } from '../../hooks/diagnostics'
import {
  CONTENT_KIND_IDS,
  CONTENT_KINDS,
  type ContentKind,
} from '../../lib/content-kinds'
import { LIST_BASE_URL } from '../../lib/curseforge'
import { KIND_ICONS } from '../content-icons'
import { usePreferencesStore } from '../../stores/preferences'
import { Alert } from '../common/alert'
import { Button } from '../common/button'
import { Card, Section } from '../common/card'
import { MicroLabel } from '../common/micro-label'
import { Skeleton } from '../common/skeleton'
import { Slot } from '../common/slot'

export function StatusPage() {
  const mcDir = usePreferencesStore((s) => s.mcDir)
  const targetVersion = usePreferencesStore((s) => s.targetVersion)
  const targetLoader = usePreferencesStore((s) => s.targetLoader)

  const { status, loading, error, setError, refresh } = useDiagnostics(mcDir)

  return (
    <main className='min-h-0 flex-1 overflow-y-auto px-4 pb-8'>
      <div className='mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-5 pt-5'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <p className='text-sm text-neutral-400'>
            Revisa el estado de tus carpetas, tus listas y los avisos de
            compatibilidad.
          </p>
          <Button
            variant='secondary'
            size='sm'
            icon={<IconRefresh size={14} />}
            loading={loading}
            onClick={refresh}>
            Verificar de nuevo
          </Button>
        </div>

        {error != null && (
          <Alert tone='error' onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {status == null ? (
          <div className='grid gap-3 sm:grid-cols-3'>
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className='h-40' />
            ))}
          </div>
        ) : (
          <>
            <div className='grid gap-3 sm:grid-cols-3'>
              {CONTENT_KIND_IDS.map((kind) => (
                <KindCard key={kind} status={status[kind]} />
              ))}
            </div>

            <Section
              icon={IconAlertTriangle}
              title='Avisos de compatibilidad'
              description={`Objetivo actual: ${targetVersion} · ${targetLoader}`}>
              <Warnings status={status} />
            </Section>

            <Section
              icon={IconRefresh}
              title='Actividad de la lista'
              description='Última sincronización exitosa con la nube'>
              <div className='flex flex-col gap-2'>
                {CONTENT_KIND_IDS.map((kind) => {
                  const KindIcon = KIND_ICONS[kind]
                  const lastRefresh = status[kind].diagnostics.lastRefresh

                  return (
                    <div
                      key={kind}
                      className='flex items-center justify-between gap-3 rounded-xs border border-edge bg-neutral-900/40 px-3 py-2'>
                      <div className='flex items-center gap-2'>
                        <KindIcon size={14} className='text-neutral-400' />
                        <span className='text-xs font-medium'>
                          {CONTENT_KINDS[kind].label}
                        </span>
                      </div>
                      <span className='truncate font-mono text-[11px] text-neutral-400'>
                        {formatDate(lastRefresh)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Section>

            <Section
              icon={IconInfoCircle}
              title='Información'
              description='Detalle técnico de la instalación'>
              <dl className='grid gap-3 sm:grid-cols-3'>
                <InfoTile
                  icon={IconCloud}
                  label='Fuente'
                  value={LIST_BASE_URL}
                  mono
                />
                <InfoTile
                  icon={IconRefresh}
                  label='Objetivo'
                  value={`${targetVersion} · ${targetLoader}`}
                />
                <InfoTile icon={IconInfoCircle} label='Versión' value={pkg.version} />
              </dl>
            </Section>
          </>
        )}
      </div>
    </main>
  )
}

function KindCard({ status }: { status: KindStatus }) {
  const meta = CONTENT_KINDS[status.kind]
  const KindIcon = KIND_ICONS[status.kind]

  return (
    <Card className='flex flex-col gap-3 p-4'>
      <div className='flex items-center gap-2'>
        <Slot size={28} className='bg-brand-400/10 text-brand-300'>
          <KindIcon size={16} />
        </Slot>
        <span className='min-w-0 flex-1 truncate text-sm font-bold'>
          {meta.label}
        </span>
        <span
          className={clsx(
            'rounded-xs px-1.5 py-0.5 text-[10px] font-semibold',
            status.exists
              ? 'bg-emerald-500/15 text-emerald-300'
              : 'bg-amber-400/15 text-amber-300',
          )}>
          {status.exists ? 'Existe' : 'Falta'}
        </span>
      </div>

      <p
        className='truncate font-mono text-[11px] text-neutral-400'
        title={status.path ?? ''}>
        {status.path ?? 'Sin carpeta configurada'}
      </p>

      <dl className='grid grid-cols-3 gap-2'>
        <Stat label='Descargados' value={status.registered} tone='text-emerald-300' />
        <Stat label='Faltantes' value={status.missing} tone='text-amber-300' />
        <Stat label='Desconocidos' value={status.unregistered} tone='text-red-300' />
      </dl>

      <div className='flex items-center justify-between gap-2 border-t border-edge pt-2'>
        <MicroLabel>Última act.</MicroLabel>
        <span className='truncate font-mono text-[11px] text-neutral-400'>
          {formatDate(status.diagnostics.lastRefresh)}
        </span>
      </div>
    </Card>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: string
}) {
  return (
    <div className='rounded-xs border border-edge bg-neutral-900/40 px-2 py-1.5 text-center'>
      <dd className={clsx('font-mono text-sm font-bold', tone)}>{value}</dd>
      <dt className='mt-0.5 truncate text-[9px] tracking-wide text-neutral-500 uppercase'>
        {label}
      </dt>
    </div>
  )
}

function Warnings({ status }: { status: Record<ContentKind, KindStatus> }) {
  const kinds = CONTENT_KIND_IDS.filter(
    (kind) => status[kind].diagnostics.warnings.length > 0,
  )

  if (kinds.length === 0) {
    return (
      <div className='flex items-center gap-2 text-sm text-emerald-300'>
        <IconCircleCheck size={16} />
        Sin avisos pendientes.
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-3'>
      {kinds.map((kind) => (
        <div key={kind}>
          <MicroLabel>{CONTENT_KINDS[kind].label}</MicroLabel>
          <ul className='mt-1.5 flex flex-col gap-1'>
            {status[kind].diagnostics.warnings.map((text, index) => (
              <li
                key={index}
                className='flex items-start gap-2 rounded-xs border border-amber-400/20 bg-amber-400/5 px-2.5 py-1.5 text-xs text-amber-200'>
                <IconAlertTriangle size={12} className='mt-0.5 shrink-0' />
                <span className='min-w-0 break-all'>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

interface InfoTileProps {
  icon: Icon
  label: string
  value: string
  mono?: boolean
}

function InfoTile({ icon: TileIcon, label, value, mono }: InfoTileProps) {
  return (
    <div className='min-w-0 rounded-xs border border-edge bg-neutral-900/40 p-3'>
      <dt className='flex items-center gap-1.5 text-neutral-400'>
        <TileIcon size={12} className='shrink-0' />
        <MicroLabel>{label}</MicroLabel>
      </dt>
      <dd
        className={clsx('mt-1 truncate text-sm', {
          'font-mono text-xs': mono,
        })}
        title={value}>
        {value}
      </dd>
    </div>
  )
}

function formatDate(iso: string | null): string {
  if (iso == null) return 'Nunca'
  return new Date(iso).toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}
