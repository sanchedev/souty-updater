import clsx from 'clsx'
import type { ReactNode } from 'react'

type PillTone = 'brand' | 'success' | 'danger' | 'info' | 'neutral'

const toneClasses: Record<PillTone, { active: string; idle: string }> = {
  brand: {
    active: 'bg-brand-400 text-neutral-900',
    idle: 'bg-brand-400/15 text-brand-300 hover:bg-brand-400/25',
  },
  success: {
    active: 'bg-lime-400 text-neutral-900',
    idle: 'bg-lime-400/15 text-lime-300 hover:bg-lime-400/25',
  },
  danger: {
    active: 'bg-red-400 text-neutral-900',
    idle: 'bg-red-400/15 text-red-300 hover:bg-red-400/25',
  },
  info: {
    active: 'bg-cyan-400 text-neutral-900',
    idle: 'bg-cyan-400/15 text-cyan-200 hover:bg-cyan-400/25',
  },
  neutral: {
    active: 'bg-neutral-200 text-neutral-900',
    idle: 'bg-neutral-700/50 text-neutral-200 hover:bg-neutral-700',
  },
}

interface PillProps {
  active?: boolean
  tone?: PillTone
  icon?: ReactNode
  count?: number
  disabled?: boolean
  title?: string
  onClick?: () => void
  children?: ReactNode
}

/** Botón tipo píldora con estado activo (bevel + escala) para filtros. */
export function Pill({
  active = false,
  tone = 'brand',
  icon,
  count,
  disabled,
  title,
  onClick,
  children,
}: PillProps) {
  const tones = toneClasses[tone]

  return (
    <button
      type='button'
      aria-pressed={active}
      disabled={disabled}
      title={title}
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-sm px-3 py-1 text-xs transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        active && 'bevel scale-105 font-semibold',
        active ? tones.active : tones.idle,
      )}>
      {icon && <span className='shrink-0'>{icon}</span>}
      {children}
      {count != null && (
        <span
          className={clsx(
            'rounded-xs px-1 py-px font-mono text-[10px] font-semibold',
            active ? 'bg-neutral-900/20' : 'bg-neutral-900/40',
          )}>
          {count}
        </span>
      )}
    </button>
  )
}
