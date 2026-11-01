import clsx from 'clsx'
import type { ReactNode } from 'react'

interface SlotProps {
  size?: number
  children: ReactNode
  className?: string
}

/** Marco estilo ranura de inventario de Minecraft (bisel invertido). */
export function Slot({ size = 40, children, className }: SlotProps) {
  return (
    <span
      style={{ width: size, height: size }}
      className={clsx(
        'bevel-inset flex shrink-0 items-center justify-center rounded-xs bg-neutral-900',
        className,
      )}>
      {children}
    </span>
  )
}
