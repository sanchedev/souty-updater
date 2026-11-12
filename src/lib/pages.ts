import { IconBox, IconHeartbeat, IconHome, IconSettings } from '@tabler/icons-react'
import { ContentPage } from '../ui/pages/content-page'
import { HomePage } from '../ui/pages/home-page'
import { SettingsPage } from '../ui/pages/settings-page'
import { StatusPage } from '../ui/pages/status-page'

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
  {
    title: 'Estado',
    icon: IconHeartbeat,
    page: StatusPage,
  },
  {
    title: 'Ajustes',
    icon: IconSettings,
    page: SettingsPage,
  },
]
