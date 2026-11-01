import clsx from 'clsx'

interface PixelProgressProps {
  value: number
  max: number
  className?: string
}

/** Barra de progreso segmentada, estilo pixel. */
export function PixelProgress({ value, max, className }: PixelProgressProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

  return (
    <div
      role='progressbar'
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={clsx(
        'bevel-inset relative h-2.5 w-full overflow-hidden rounded-xs bg-neutral-900',
        className,
      )}>
      <div
        className='h-full bg-brand-400 transition-[width] duration-300'
        style={{
          width: `${pct}%`,
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent 0 6px, rgb(0 0 0 / 0.35) 6px 8px)',
        }}
      />
    </div>
  )
}
