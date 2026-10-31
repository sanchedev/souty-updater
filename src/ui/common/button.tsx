import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive'
  size?: 'default' | 'icon'
}

export function Button(props: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        props.className,
        'rounded-lg active:scale-95 transition-all',
        {
          'px-4 py-2': props.size === 'default' || props.size == null,
          'p-1': props.size === 'icon',
        },
        {
          'bg-amber-400 hover:bg-amber-500 text-neutral-800':
            props.variant == null || props.variant === 'primary',
          'bg-neutral-700 hover:bg-neutral-600 text-neutral-50':
            props.variant === 'secondary',
          'bg-red-500 hover:bg-red-600 text-red-50':
            props.variant === 'destructive',
        },
      )}
    />
  )
}
