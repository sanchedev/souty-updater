import clsx from 'clsx'
import { useRef, type ReactNode } from 'react'

export interface TabItem<T extends string> {
  id: T
  label: string
  icon?: ReactNode
  /** id del elemento que sirve de panel (para aria-controls). */
  panelId?: string
}

interface TabsProps<T extends string> {
  items: TabItem<T>[]
  value: T
  onChange: (id: T) => void
}

/**
 * Tabs con aspecto de pestañas segmentadas (estilo inventario).
 * Soporta navegación con flechas izquierda/derecha.
 */
export function Tabs<T extends string>({ items, value, onChange }: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const index = items.findIndex((item) => item.id === value)
    if (index < 0) return

    let next = -1
    if (event.key === 'ArrowRight') next = (index + 1) % items.length
    if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length
    if (next < 0) return

    event.preventDefault()
    onChange(items[next].id)
    listRef.current
      ?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
      ?.focus()
  }

  return (
    <div
      ref={listRef}
      role='tablist'
      onKeyDown={handleKeyDown}
      className='bevel-inset flex gap-1 rounded-sm border border-edge bg-neutral-900/60 p-1'>
      {items.map((item) => {
        const active = item.id === value

        return (
          <button
            key={item.id}
            type='button'
            role='tab'
            aria-selected={active}
            aria-controls={item.panelId}
            onClick={() => onChange(item.id)}
            className={clsx(
              'flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xs px-3 py-1.5 text-xs font-medium transition-all duration-150',
              active
                ? 'bevel bg-brand-400/15 text-brand-300'
                : 'text-neutral-400 hover:bg-neutral-700/40 hover:text-neutral-200',
            )}>
            {item.icon}
            <span className='truncate'>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
