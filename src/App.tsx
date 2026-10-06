import { useState, useEffect } from 'react'
import MapDashboard from './components/MapDashboard'
import { LanguageProvider } from './contexts/LanguageContext'

export default function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  return (
    <LanguageProvider>
      <div className={darkMode ? 'dark' : ''} style={{ height: '100%' }}>
        <MapDashboard darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />
      </div>
    </LanguageProvider>
  )
}
