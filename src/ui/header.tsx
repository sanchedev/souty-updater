import { Pages } from '../lib/pages'

interface HeaderProps {
  index: number
}

export function Header({ index }: HeaderProps) {
  const page = Pages[index]

  return (
    <header className='from-panel/60 to-app flex h-14 w-full shrink-0 items-center justify-between border-b border-edge bg-gradient-to-b px-5'>
      <h1 className='text-lg font-extrabold tracking-tight'>{page?.title}</h1>
      <span className='font-pixel text-[10px] tracking-widest text-neutral-500 uppercase'>
        Souty Helper
      </span>
    </header>
  )
}
