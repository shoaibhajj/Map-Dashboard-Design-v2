import MapDashboard from '../components/MapDashboard'
import { useTheme } from '../contexts/ThemeContext'

export default function MapDashboardRoute() {
  const { isDark, toggleTheme } = useTheme()
  return <MapDashboard darkMode={isDark} onToggleDark={toggleTheme} />
}
