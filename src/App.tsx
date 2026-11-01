import { useState } from 'react'
import { Header } from './ui/header'
import { SideBar } from './ui/sidebar'
import { Toaster } from './ui/common/toaster'
import { NotFoundPage } from './ui/pages/not-found-page'
import { Pages } from './lib/pages'

function App() {
  const [index, setIndex] = useState(0)

  const CurrentPage = Pages[index]?.page ?? NotFoundPage

  return (
    <div className='grid h-full w-full grid-cols-[auto_1fr]'>
      <SideBar currentIndex={index} goTo={(index) => setIndex(index)} />
      <div className='flex h-full min-h-0 min-w-0 flex-col'>
        <Header index={index} />
        <div
          key={`page-${index}`}
          className='flex min-h-0 min-w-0 flex-1 flex-col animate-fade-in'>
          <CurrentPage />
        </div>
      </div>
      <Toaster />
    </div>
  )
}

export default App
