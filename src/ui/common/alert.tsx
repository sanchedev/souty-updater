import clsx from 'clsx'
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'

type AlertTone = 'error' | 'success' | 'warning' | 'info'

const tones: Record<AlertTone, { wrapper: string; icon: ReactNode }> = {
  error: {
    wrapper: 'border-red-500/30 bg-red-500/10 text-red-300',
    icon: <IconAlertTriangle size={18} />,
  },
  success: {
    wrapper: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    icon: <IconCircleCheck size={18} />,
  },
  warning: {
    wrapper: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    icon: <IconAlertTriangle size={18} />,
  },
  info: {
    wrapper: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
    icon: <IconInfoCircle size={18} />,
  },
}

interface AlertProps {
  tone?: AlertTone
  title?: string
  children?: ReactNode
  onClose?: () => void
}

export function Alert({ tone = 'info', title, children, onClose }: AlertProps) {
  const t = tones[tone]

  return (
    <div
      role='alert'
      className={clsx(
        'flex items-start gap-3 rounded-sm border px-4 py-3 text-sm animate-slide-in',
        t.wrapper,
      )}>
      <span className='mt-0.5 shrink-0'>{t.icon}</span>
      <div className='min-w-0 flex-1'>
        {title != null && <p className='font-semibold'>{title}</p>}
        {children != null && (
          <div
            className={clsx(
              'whitespace-pre-wrap',
              title != null ? 'mt-0.5 text-xs opacity-90' : '',
            )}>
            {children}
          </div>
        )}
      </div>
      {onClose != null && (
        <button
          type='button'
          aria-label='Cerrar aviso'
          onClick={onClose}
          className='-m-1 shrink-0 rounded-sm p-1 opacity-70 hover:opacity-100'>
          <IconX size={16} />
        </button>
      )}
    </div>
  )
}
