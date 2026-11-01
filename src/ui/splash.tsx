import { IconBrandNetbeans } from '@tabler/icons-react'
import { Spinner } from './common/spinner'

/** Pantalla de arranque mientras se cargan las preferencias. */
export function Splash() {
  return (
    <div className='pixel-grid flex h-full w-full flex-col items-center justify-center gap-5 bg-app'>
      <div className='bevel flex items-center gap-3 rounded-sm border border-edge bg-panel px-5 py-4'>
        <IconBrandNetbeans size={28} className='text-brand-400' />
        <span className='font-pixel text-lg tracking-wide'>Souty Helper</span>
      </div>
      <Spinner size={20} className='text-neutral-500' />
    </div>
  )
}
