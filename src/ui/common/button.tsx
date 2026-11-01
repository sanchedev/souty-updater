import clsx from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from './spinner'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'ghost'
  | 'outline'

type ButtonSize = 'sm' | 'default' | 'icon' | 'icon-sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Icono renderizado antes del texto. */
  icon?: ReactNode
  /** Muestra un spinner y bloquea el botón. */
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-400 hover:bg-brand-300 text-neutral-900 font-semibold bevel shadow-[0_2px_0_0_rgb(0_0_0/0.45)] hover:-translate-y-px active:translate-y-0 active:shadow-none',
  secondary:
    'bg-neutral-700/70 hover:bg-neutral-600/70 text-neutral-50 bevel',
  destructive:
    'bg-red-500 hover:bg-red-400 text-red-50 font-semibold bevel shadow-[0_2px_0_0_rgb(0_0_0/0.45)] hover:-translate-y-px active:translate-y-0 active:shadow-none',
  ghost: 'bg-transparent hover:bg-neutral-700/40 text-neutral-300',
  outline:
    'bg-panel-raise/40 hover:bg-neutral-700/60 text-neutral-200 border border-edge-strong',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5',
  default: 'px-4 py-2 text-sm gap-2',
  icon: 'p-2',
  'icon-sm': 'p-1.5',
}

const iconSizes: Record<ButtonSize, number> = {
  sm: 12,
  default: 16,
  icon: 16,
  'icon-sm': 14,
}

export function Button({
  variant = 'primary',
  size = 'default',
  icon,
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center rounded-sm transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}>
      {loading ? (
        <Spinner size={iconSizes[size]} />
      ) : (
        icon && <span className='shrink-0'>{icon}</span>
      )}
      {children}
    </button>
  )
}
