import clsx from 'clsx'
import type { Icon } from '@tabler/icons-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: Icon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: EmptyIcon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center gap-2 rounded-sm border border-dashed border-edge-strong bg-panel/40 p-10 text-center',
        className,
      )}>
      <span className='bevel-inset flex rounded-xs bg-neutral-700/40 p-3 text-neutral-400'>
        <EmptyIcon size={24} />
      </span>
      <p className='mt-1 text-sm font-semibold'>{title}</p>
      <p className='max-w-sm text-xs text-neutral-400'>{description}</p>
      {action}
    </div>
  )
}
