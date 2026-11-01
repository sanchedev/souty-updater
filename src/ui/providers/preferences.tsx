import { useEffect } from 'react'
import { usePreferencesStore } from '../../stores/preferences'
import { Splash } from '../splash'

export function PreferencesProvider(props: React.PropsWithChildren) {
  const loadPrefs = usePreferencesStore((s) => s.load)
  const loading = usePreferencesStore((s) => s.loading)

  useEffect(() => {
    loadPrefs()
  }, [])

  if (loading) return <Splash />

  return props.children
}
