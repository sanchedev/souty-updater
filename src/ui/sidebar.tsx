import { IconBrandNetbeans, type Icon } from '@tabler/icons-react'
import clsx from 'clsx'
import pkg from '../../package.json'
import { Pages } from '../lib/pages'

interface SideBarProps {
  currentIndex: number
  goTo: (index: number) => void
}

/**
 * Sidebar expandida: `w-96` con tope de 1/3 del viewport.
 * Por debajo de 640px (`max-sm:`) colapsa a un rail de solo iconos.
 */
export function SideBar({ currentIndex, goTo }: SideBarProps) {
  return (
    <aside className='from-panel to-app flex w-96 max-w-[calc(100vw/3)] flex-col gap-4 border-r border-edge bg-linear-to-b p-4 max-sm:w-20 max-sm:px-3'>
      <div className='flex items-center gap-2 px-2 py-3 font-pixel text-lg tracking-wide max-sm:justify-center max-sm:px-0 max-sm:py-1'>
        <IconBrandNetbeans className='shrink-0 text-brand-400' />
        <span className='max-sm:hidden'>Souty Helper</span>
      </div>

      <ul className='flex flex-col gap-1.5'>
        {Pages.map((p, i) => (
          <SideBarItem
            key={`sidebar-${p.title}`}
            current={currentIndex}
            icon={p.icon}
            title={p.title}
            index={i}
            onNav={goTo}
          />
        ))}
      </ul>

      <div className='mt-auto px-2 max-sm:hidden'>
        <span className='font-pixel text-[10px] tracking-widest text-neutral-500 uppercase'>
          v{pkg.version}
        </span>
      </div>
    </aside>
  )
}

interface SideBarItemProps {
  index: number
  current: number
  icon: Icon
  title: string
  onNav: (index: number) => void
}

function SideBarItem({
  current,
  index,
  icon: ItemIcon,
  title,
  onNav,
}: SideBarItemProps) {
  const active = index === current

  return (
    <li className='relative w-full before:absolute before:top-1/2 before:-left-1 before:h-5 before:w-1 before:-translate-y-1/2 before:scale-y-0 before:rounded-xs before:bg-brand-400 before:transition-transform before:duration-200 before:content-[""] has-[button[data-active=y]]:before:scale-y-100 max-sm:before:-left-0.5 max-sm:before:h-4'>
      <button
        type='button'
        data-active={active ? 'y' : 'n'}
        aria-current={active ? 'page' : undefined}
        title={title}
        onClick={() => onNav(index)}
        className={clsx(
          'flex w-full items-center gap-3 rounded-sm px-4 py-2.5 text-start text-sm transition-all duration-200 max-sm:justify-center max-sm:px-0 max-sm:py-3',
          active
            ? 'bevel bg-brand-400/10 font-semibold text-brand-300'
            : 'text-neutral-300 hover:translate-x-0.5 hover:bg-neutral-700/40 hover:text-neutral-50',
        )}>
        <ItemIcon size={18} className='shrink-0' />
        <span className='max-sm:hidden'>{title}</span>
      </button>
    </li>
  )
}
