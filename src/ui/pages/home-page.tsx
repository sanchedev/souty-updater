import {
  IconAlertTriangle,
  IconCircleCheck,
  IconRefresh,
  IconPuzzle,
} from '@tabler/icons-react'
import clsx from 'clsx'
import { Card, Section } from '../common/card'
import { MicroLabel } from '../common/micro-label'
import { Slot } from '../common/slot'
import { usePreferencesStore } from '../../stores/preferences'

const steps = [
  {
    icon: IconPuzzle,
    title: 'Elige tu contenido',
    description:
      'En Contenido revisas mods, resource packs y shader packs de la nube.',
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
  const configured = mcDir != null

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
                ? 'Ve a la pestaña Contenido y pulsa Recargar para comparar tu instalación con la nube.'
                : 'Selecciona la carpeta .minecraft en Ajustes para que podamos encontrar y actualizar tu contenido.'}
            </p>
          </div>
        </Card>

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
