import { useEffect } from 'react'
import { useDiagnosticsStore } from '../../stores/diagnostics'
import { usePreferencesStore } from '../../stores/preferences'
import { Splash } from '../splash'

export function PreferencesProvider(props: React.PropsWithChildren) {
  const loadPrefs = usePreferencesStore((s) => s.load)
  const loading = usePreferencesStore((s) => s.loading)
  const loadDiagnostics = useDiagnosticsStore((s) => s.load)
  const diagnosticsLoading = useDiagnosticsStore((s) => s.loading)

  useEffect(() => {
    loadPrefs()
    loadDiagnostics()
  }, [])

  if (loading || diagnosticsLoading) return <Splash />

  return props.children
}
