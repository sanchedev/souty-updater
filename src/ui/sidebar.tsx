import { Icon, IconBrandNetbeans } from '@tabler/icons-react'
import { Pages } from '../lib/pages'

interface SideBarProps {
  currentIndex: number
  goTo: (index: number) => void
}

export function SideBar({ currentIndex, goTo }: SideBarProps) {
  return (
    <aside className='flex flex-col gap-4 p-4 w-96 max-w-[calc(100vw/3)]'>
      <div className='flex gap-2 items-center text-xl py-4 font-bold'>
        <IconBrandNetbeans />
        Souty Helper
      </div>
      <ul className='flex flex-col gap-2'>
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
  icon: Icon,
  title,
  onNav,
}: SideBarItemProps) {
  return (
    <li className='relative w-full before:absolute before:top-1/2 before:-left-0.5 before:w-1 before:h-4 before:scale-y-0 before:-translate-y-1/2 before:rounded-full before:transition-all has-[button[data-active=y]]:before:bg-amber-300 has-[button[data-active=y]]:before:scale-y-100 before:duration-300'>
      <button
        data-active={index === current ? 'y' : 'n'}
        className='w-full h-full text-start px-6 py-3 rounded-md data-[active=y]:bg-neutral-700/50 hover:bg-neutral-700/25 transition-colors duration-300'
        onClick={() => onNav(index)}>
        <Icon className='inline' /> {title}
      </button>
    </li>
  )
}
