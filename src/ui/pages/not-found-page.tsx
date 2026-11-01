import { IconQuestionMark } from '@tabler/icons-react'
import { EmptyState } from '../common/empty-state'

export function NotFoundPage() {
  return (
    <main className='flex min-h-0 flex-1 items-center justify-center p-4'>
      <EmptyState
        icon={IconQuestionMark}
        title='Página no encontrada'
        description='Elige una opción del menú lateral o reporta esto como un error.'
      />
    </main>
  )
}
