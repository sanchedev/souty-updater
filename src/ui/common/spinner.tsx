import clsx from 'clsx'

interface SpinnerProps {
  size?: number
  className?: string
}

/** Spinner cuadrado (sin redondeos) coherente con el estilo del resto. */
export function Spinner({ size = 16, className }: SpinnerProps) {
  return (
    <span
      role='status'
      aria-label='Cargando'
      style={{ width: size, height: size }}
      className={clsx(
        'inline-block shrink-0 border-2 border-current border-t-transparent animate-spin',
        className,
      )}
    />
  )
}
