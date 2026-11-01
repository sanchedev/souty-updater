import clsx from 'clsx'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('animate-pulse rounded-xs bg-neutral-700/40', className)} />
  )
}

/** Placeholder con la forma de una fila de mod. */
export function ModRowSkeleton() {
  return (
    <div className='flex items-center gap-3 rounded-sm border border-edge bg-panel/50 px-4 py-3'>
      <Skeleton className='h-10 w-10' />
      <div className='min-w-0 flex-1 space-y-2'>
        <Skeleton className='h-3.5 w-1/3' />
        <Skeleton className='h-3 w-1/2' />
      </div>
      <Skeleton className='h-8 w-8' />
    </div>
  )
}
