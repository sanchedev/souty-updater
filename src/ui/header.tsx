import { Pages } from '../lib/pages'

interface HeaderProps {
  index: number
}

export function Header({ index }: HeaderProps) {
  const page = Pages[index]

  return (
    <header className='w-full h-16 px-4 py-2 flex justify-between items-center'>
      <h1 className='text-2xl font-bold'>{page?.title}</h1>
    </header>
  )
}
