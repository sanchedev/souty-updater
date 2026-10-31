import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './globals.css'
import { PreferencesProvider } from './ui/providers/preferences'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PreferencesProvider>
      <App />
    </PreferencesProvider>
  </React.StrictMode>,
)
