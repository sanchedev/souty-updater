import { useState, useEffect } from 'react'
import { Preferences, PreferencesContext } from '../../lib/preferences'

export function PreferencesProvider(props: React.PropsWithChildren) {
  const [preferences, setPreferences] = useState<Preferences | null>(null)

  useEffect(() => {
    const prefs = new Preferences()
    prefs.load().finally(() => {
      setPreferences(prefs)
    })
  }, [])

  if (preferences == null) return null

  return (
    <PreferencesContext.Provider value={preferences}>
      {props.children}
    </PreferencesContext.Provider>
  )
}
