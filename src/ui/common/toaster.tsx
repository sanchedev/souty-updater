import clsx from 'clsx'
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { useToastsStore, type ToastTone } from '../../stores/toasts'

const toneClasses: Record<ToastTone, { wrapper: string; icon: ReactNode }> = {
  info: {
    wrapper: 'border-cyan-400/30 bg-panel text-cyan-200',
    icon: <IconInfoCircle size={16} />,
  },
  success: {
    wrapper: 'border-emerald-500/30 bg-panel text-emerald-300',
    icon: <IconCircleCheck size={16} />,
  },
  warning: {
    wrapper: 'border-amber-400/30 bg-panel text-amber-300',
    icon: <IconAlertTriangle size={16} />,
  },
  error: {
    wrapper: 'border-red-500/30 bg-panel text-red-300',
    icon: <IconAlertTriangle size={16} />,
  },
}

/** Pila de notificaciones flotantes (esquina inferior derecha). */
export function Toaster() {
  const toasts = useToastsStore((s) => s.toasts)
  const dismiss = useToastsStore((s) => s.dismiss)

  return (
    <div className='pointer-events-none fixed right-4 bottom-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2'>
      {toasts.map((t) => {
        const tones = toneClasses[t.tone]

        return (
          <div
            key={t.id}
            role='status'
            className={clsx(
              'flex items-start gap-2.5 rounded-sm border px-3 py-2.5 text-xs shadow-[0_8px_24px_-8px_rgb(0_0_0/0.8)] bevel animate-slide-in',
              tones.wrapper,
            )}>
            <span className='mt-px shrink-0'>{tones.icon}</span>
            <p className='min-w-0 flex-1 whitespace-pre-wrap'>{t.message}</p>
            <button
              type='button'
              aria-label='Cerrar aviso'
              onClick={() => dismiss(t.id)}
              className='-m-1 shrink-0 rounded-sm p-1 opacity-70 hover:opacity-100'>
              <IconX size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
