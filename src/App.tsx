import { useState } from 'react'
import { Header } from './ui/header'
import { SideBar } from './ui/sidebar'
import { NotFoundPage } from './ui/pages/not-found-page'
import { Pages } from './lib/pages'

function App() {
  const [index, setIndex] = useState(0)

  const CurrentPage = Pages[index].page ?? NotFoundPage
  return (
    <div className='w-full h-full grid grid-cols-[auto_1fr]'>
      <SideBar currentIndex={index} goTo={(index) => setIndex(index)} />
      <div className='flex flex-col h-full min-h-0 min-w-0'>
        <Header index={index} />
        {<CurrentPage key={`page-${index}`} />}
      </div>
    </div>
  )
}

export default App
