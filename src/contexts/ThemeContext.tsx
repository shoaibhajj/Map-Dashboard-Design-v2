import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type PaletteId = 'current' | 'tripmonitor'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
  paletteId: PaletteId
  setPaletteId: (palette: PaletteId) => void
}

const MODE_KEY = 'fleetview-color-mode'
const PALETTE_KEY = 'fleetview-palette'

function initialMode(): boolean {
  if (typeof window === 'undefined') return true
  const savedMode = window.localStorage.getItem(MODE_KEY)
  return savedMode === null ? true : savedMode === 'dark'
}

function initialPalette(): PaletteId {
  if (typeof window === 'undefined') return 'tripmonitor'
  const savedPalette = window.localStorage.getItem(PALETTE_KEY)
  return savedPalette === null ? 'tripmonitor' : savedPalette === 'tripmonitor' ? 'tripmonitor' : 'current'
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  paletteId: 'tripmonitor',
  setPaletteId: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(initialMode)
  const [paletteId, setPaletteId] = useState<PaletteId>(initialPalette)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
    root.dataset.palette = paletteId
    window.localStorage.setItem(MODE_KEY, isDark ? 'dark' : 'light')
    window.localStorage.setItem(PALETTE_KEY, paletteId)
  }, [isDark, paletteId])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(value => !value), paletteId, setPaletteId }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
