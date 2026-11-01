import { IconBox, IconHome } from '@tabler/icons-react'
import { ContentPage } from '../ui/pages/content-page'
import { HomePage } from '../ui/pages/home-page'

export const Pages = [
  {
    title: 'Principal',
    icon: IconHome,
    page: HomePage,
  },
  {
    title: 'Contenido',
    icon: IconBox,
    page: ContentPage,
  },
]
