import { useContext, useEffect, useState } from 'react'
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCloud,
  IconExternalLink,
  IconFolder,
  IconInfoCircle,
  IconPuzzle,
  IconRefresh,
  IconTag,
  type Icon,
} from '@tabler/icons-react'
import { open } from '@tauri-apps/plugin-dialog'
import { revealItemInDir } from '@tauri-apps/plugin-opener'
import clsx from 'clsx'
import pkg from '../../../package.json'
import { Button } from '../common/button'
import { usePreferencesStore } from '../../stores/preferences'

const steps = [
  {
    icon: IconPuzzle,
    title: 'Revisa tus mods',
    description: 'Leemos la lista de mods instalados en tu carpeta.',
  },
  {
    icon: IconRefresh,
    title: 'Recarga',
    description: 'Comparamos tu instalación con la información de la nube.',
  },
  {
    icon: IconCircleCheck,
    title: 'Actualizado',
    description: 'Se eliminan los sobrantes y se descargan los faltantes.',
  },
]

export function HomePage() {
  const mcDir = usePreferencesStore((s) => s.mcDir)
  const setMcDir = usePreferencesStore((s) => s.setMcDir)
  const [picking, setPicking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const configured = mcDir != null
  const modsDir = mcDir == null ? null : `${mcDir.replace(/[\\/]+$/, '')}/mods`

  async function pickDirectory() {
    if (picking) return

    setPicking(true)
    setError(null)

    try {
      const dir = await open({
        directory: true,
        multiple: false,
        recursive: true,
        title: 'Selecciona tu carpeta de Minecraft',
        defaultPath: mcDir ?? undefined,
      })

      if (dir == null) return

      setMcDir(dir)
    } catch {
      setError('No se pudo abrir el selector de carpetas.')
    } finally {
      setPicking(false)
    }
  }

  async function revealModsFolder() {
    if (modsDir == null) return

    setError(null)

    try {
      await revealItemInDir(modsDir)
    } catch {
      setError('No se pudo abrir la carpeta. Verifica que exista.')
    }
  }

  return (
    <main className='flex-1 min-h-0 overflow-y-auto px-4 pb-8'>
      <div className='mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-6'>
        <section
          className={clsx('flex items-start gap-4 rounded-2xl border p-5', {
            'border-emerald-500/30 bg-emerald-500/5': configured,
            'border-amber-400/30 bg-amber-400/5': !configured,
          })}>
          <span
            className={clsx('rounded-full p-2', {
              'bg-emerald-500/15 text-emerald-300': configured,
              'bg-amber-400/15 text-amber-300': !configured,
            })}>
            {configured ? (
              <IconCircleCheck size={24} />
            ) : (
              <IconAlertTriangle size={24} />
            )}
          </span>
          <div>
            <h2 className='font-semibold'>
              {configured
                ? 'Carpeta de Minecraft configurada'
                : 'Falta configurar tu carpeta de Minecraft'}
            </h2>
            <p className='mt-1 text-sm text-neutral-400'>
              {configured
                ? 'Ve a la pestaña Mods y pulsa Recargar para comparar tu instalación con la nube.'
                : 'Selecciona la carpeta .minecraft para que podamos encontrar y actualizar tus mods.'}
            </p>
          </div>
        </section>

        <section className='rounded-2xl border border-neutral-700 bg-neutral-800/50 p-5'>
          <div className='flex items-center gap-2'>
            <IconFolder className='text-amber-300' />
            <h2 className='font-semibold'>Preferencias</h2>
          </div>

          <div className='mt-4 flex flex-col gap-3'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div>
                <p className='text-sm font-medium'>Carpeta de Minecraft</p>
                <p className='text-xs text-neutral-400'>
                  Normalmente se llama .minecraft.
                </p>
              </div>
              <div className='flex gap-2'>
                {configured && (
                  <Button
                    variant='secondary'
                    className='bg-neutral-700 hover:bg-neutral-600 text-neutral-50'
                    onClick={revealModsFolder}>
                    <IconExternalLink className='inline' /> Abrir mods
                  </Button>
                )}
                <Button disabled={picking} onClick={pickDirectory}>
                  <IconFolder className='inline' />{' '}
                  {picking
                    ? 'Abriendo…'
                    : configured
                      ? 'Cambiar'
                      : 'Seleccionar'}
                </Button>
              </div>
            </div>

            <div
              className='truncate rounded-lg border border-neutral-700 bg-neutral-900/50 px-3 py-2 font-mono text-xs'
              title={mcDir ?? 'Sin configurar'}>
              {mcDir ?? 'Sin configurar'}
            </div>

            {modsDir != null && (
              <p className='truncate text-xs text-neutral-400' title={modsDir}>
                Los mods se buscarán en{' '}
                <span className='font-mono text-neutral-300'>{modsDir}</span>
              </p>
            )}

            {error != null && <p className='text-xs text-red-400'>{error}</p>}
          </div>
        </section>

        <section className='rounded-2xl border border-neutral-700 bg-neutral-800/50 p-5'>
          <div className='flex items-center gap-2'>
            <IconInfoCircle className='text-amber-300' />
            <h2 className='font-semibold'>Información</h2>
          </div>

          <dl className='mt-4 grid gap-3 sm:grid-cols-3'>
            <InfoTile
              icon={IconFolder}
              label='Carpeta de mods'
              value={modsDir ?? 'Sin configurar'}
              mono
            />
            <InfoTile icon={IconCloud} label='Fuente' value='CurseForge' />
            <InfoTile icon={IconTag} label='Versión' value={pkg.version} />
          </dl>
        </section>

        <section className='rounded-2xl border border-neutral-700 bg-neutral-800/50 p-5'>
          <div className='flex items-center gap-2'>
            <IconRefresh className='text-amber-300' />
            <h2 className='font-semibold'>Cómo funciona</h2>
          </div>

          <ol className='mt-4 grid gap-3 sm:grid-cols-3'>
            {steps.map(({ icon: StepIcon, title, description }, index) => (
              <li
                key={title}
                className='rounded-lg border border-neutral-700 bg-neutral-900/40 p-3'>
                <div className='flex items-center gap-2 text-xs font-medium text-amber-300'>
                  <span className='flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/15'>
                    {index + 1}
                  </span>
                  <StepIcon size={16} />
                  {title}
                </div>
                <p className='mt-2 text-xs text-neutral-400'>{description}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
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
    <div className='min-w-0 rounded-lg border border-neutral-700 bg-neutral-900/40 p-3'>
      <dt className='flex items-center gap-1.5 text-xs text-neutral-400'>
        <TileIcon size={14} />
        {label}
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
