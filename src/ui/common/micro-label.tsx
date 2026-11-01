import clsx from 'clsx'

interface MicroLabelProps {
  children: string
  className?: string
}

/** Etiqueta pequeña en tipografía pixel, para acentos y encabezados cortos. */
export function MicroLabel({ children, className }: MicroLabelProps) {
  return (
    <span
      className={clsx(
        'font-pixel text-[10px] tracking-widest text-neutral-400 uppercase',
        className,
      )}>
      {children}
    </span>
  )
}
