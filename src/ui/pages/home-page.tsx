import { useState } from 'react'
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
import { Card, Section } from '../common/card'
import { MicroLabel } from '../common/micro-label'
import { Slot } from '../common/slot'
import { packsDir } from '../../lib/content-kinds'
import { toast } from '../../stores/toasts'
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

  const configured = mcDir != null
  const modsDir = mcDir == null ? null : packsDir(mcDir, 'mod')

  async function pickDirectory() {
    if (picking) return

    setPicking(true)

    try {
      const dir = await open({
        directory: true,
        multiple: false,
        recursive: true,
        title: 'Selecciona tu carpeta de Minecraft',
        defaultPath: mcDir ?? undefined,
      })

      if (dir == null) return

      await setMcDir(dir)
      toast.success('Carpeta de Minecraft actualizada.')
    } catch {
      toast.error('No se pudo abrir el selector de carpetas.')
    } finally {
      setPicking(false)
    }
  }

  async function revealModsFolder() {
    if (modsDir == null) return

    try {
      await revealItemInDir(modsDir)
    } catch {
      toast.error('No se pudo abrir la carpeta. Verifica que exista.')
    }
  }

  return (
    <main className='min-h-0 flex-1 overflow-y-auto px-4 pb-8'>
      <div className='mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-5 pt-5'>
        <Card
          className={clsx('flex items-start gap-4 p-5', {
            'border-emerald-500/30': configured,
            'border-amber-400/30': !configured,
          })}>
          <Slot
            className={clsx({
              'bg-emerald-500/10 text-emerald-300': configured,
              'bg-amber-400/10 text-amber-300': !configured,
            })}>
            {configured ? (
              <IconCircleCheck size={22} />
            ) : (
              <IconAlertTriangle size={22} />
            )}
          </Slot>
          <div className='min-w-0'>
            <div className='flex items-center gap-2'>
              <MicroLabel>
                {configured ? 'Estado: listo' : 'Estado: pendiente'}
              </MicroLabel>
            </div>
            <h2 className='mt-1 font-bold'>
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
        </Card>

        <Section
          icon={IconFolder}
          title='Preferencias'
          description='Normalmente la carpeta se llama .minecraft.'>
          <div className='flex flex-col gap-3'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <p className='text-sm font-medium'>Carpeta de Minecraft</p>
              <div className='flex gap-2'>
                {configured && (
                  <Button
                    variant='secondary'
                    size='sm'
                    icon={<IconExternalLink size={14} />}
                    onClick={revealModsFolder}>
                    Abrir mods
                  </Button>
                )}
                <Button
                  size='sm'
                  disabled={picking}
                  icon={<IconFolder size={14} />}
                  onClick={pickDirectory}>
                  {picking
                    ? 'Abriendo…'
                    : configured
                      ? 'Cambiar'
                      : 'Seleccionar'}
                </Button>
              </div>
            </div>

            <div
              className='bevel-inset truncate rounded-xs bg-neutral-900 px-3 py-2 font-mono text-xs'
              title={mcDir ?? 'Sin configurar'}>
              {mcDir ?? 'Sin configurar'}
            </div>

            {modsDir != null && (
              <p className='truncate text-xs text-neutral-400' title={modsDir}>
                Los mods se buscarán en{' '}
                <span className='font-mono text-neutral-300'>{modsDir}</span>
              </p>
            )}
          </div>
        </Section>

        <Section
          icon={IconInfoCircle}
          title='Información'
          description='Detalles de la instalación actual.'>
          <dl className='grid gap-3 sm:grid-cols-3'>
            <InfoTile
              icon={IconFolder}
              label='Carpeta de mods'
              value={modsDir ?? 'Sin configurar'}
              mono
            />
            <InfoTile icon={IconCloud} label='Fuente' value='CurseForge' />
            <InfoTile icon={IconTag} label='Versión' value={pkg.version} />
          </dl>
        </Section>

        <Section
          icon={IconRefresh}
          title='Cómo funciona'
          description='Tres pasos y tu carpeta queda al día.'>
          <ol className='grid gap-3 sm:grid-cols-3'>
            {steps.map(({ icon: StepIcon, title, description }, index) => (
              <li
                key={title}
                className='bevel-inset rounded-sm border border-edge bg-neutral-900/40 p-3'>
                <div className='flex items-center gap-2 text-xs font-semibold'>
                  <Slot size={20} className='bg-brand-400/15 text-brand-300'>
                    <span className='font-mono text-[10px] font-bold'>
                      {index + 1}
                    </span>
                  </Slot>
                  <StepIcon size={14} className='text-brand-300' />
                  {title}
                </div>
                <p className='mt-2 text-xs text-neutral-400'>{description}</p>
              </li>
            ))}
          </ol>
        </Section>
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
    <div className='min-w-0 rounded-sm border border-edge bg-neutral-900/40 p-3'>
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
