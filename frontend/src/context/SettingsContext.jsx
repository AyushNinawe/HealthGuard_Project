/**
 * SettingsContext — theme, language, notifications
 * Persisted to localStorage
 */
import { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext(null)

const DEFAULT_SETTINGS = {
  darkMode: false,
  language: 'en',
  notifications: { email: true, browser: true, sms: false },
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('hg_settings')
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  // Persist on change & toggle dark-mode class on <body>
  useEffect(() => {
    localStorage.setItem('hg_settings', JSON.stringify(settings))
    document.body.classList.toggle('dark-mode', settings.darkMode)
  }, [settings])

  function updateSettings(partial) {
    setSettings(s => ({ ...s, ...partial }))
  }

  function toggleDarkMode() {
    setSettings(s => ({ ...s, darkMode: !s.darkMode }))
  }

  function updateNotification(key, value) {
    setSettings(s => ({
      ...s,
      notifications: { ...s.notifications, [key]: value },
    }))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, toggleDarkMode, updateNotification }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be inside SettingsProvider')
  return ctx
}

export default SettingsContext
