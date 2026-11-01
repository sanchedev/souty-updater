import clsx from 'clsx'
import type { Icon } from '@tabler/icons-react'
import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={clsx(
        'rounded-sm border border-edge bg-gradient-to-b from-panel to-app shadow-[0_10px_30px_-16px_rgb(0_0_0/0.7)]',
        className,
      )}>
      {children}
    </div>
  )
}

interface SectionProps {
  icon: Icon
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

/** Tarjeta con encabezado: ícono en ranura + título en mayúsculas. */
export function Section({
  icon: SectionIcon,
  title,
  description,
  actions,
  children,
  className,
}: SectionProps) {
  return (
    <Card className={clsx('p-5', className)}>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <span className='bevel-inset flex rounded-xs bg-brand-400/10 p-1.5 text-brand-300'>
            <SectionIcon size={16} />
          </span>
          <div>
            <h2 className='text-sm font-bold tracking-wider uppercase'>
              {title}
            </h2>
            {description != null && (
              <p className='mt-0.5 text-xs text-neutral-400'>{description}</p>
            )}
          </div>
        </div>
        {actions != null && (
          <div className='flex flex-wrap items-center gap-2'>{actions}</div>
        )}
      </div>
      <div className='mt-4'>{children}</div>
    </Card>
  )
}
