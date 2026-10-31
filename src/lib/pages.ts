import { IconHome, IconPuzzle } from '@tabler/icons-react'
import { ModPage } from '../ui/pages/mod-page'
import { HomePage } from '../ui/pages/home-page'

export const Pages = [
  {
    title: 'Principal',
    icon: IconHome,
    page: HomePage,
  },
  {
    title: 'Mods',
    icon: IconPuzzle,
    page: ModPage,
  },
]
