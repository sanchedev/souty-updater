import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive'
}

export function Button(props: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        props.className,
        'px-4 py-2 rounded-lg active:scale-95 transition-all',
        {
          'bg-amber-400 hover:bg-amber-500 text-neutral-800':
            props.variant == null || props.variant === 'primary',
        },
      )}
    />
  )
}
