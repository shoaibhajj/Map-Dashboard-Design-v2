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
  if (typeof window === 'undefined') return false
  try {
    const savedMode = window.localStorage.getItem(MODE_KEY)
    // Default must NOT be dark mode -> returns true only when explicitly saved as 'dark'
    return savedMode === 'dark'
  } catch {
    return false
  }
}

function initialPalette(): PaletteId {
  if (typeof window === 'undefined') return 'tripmonitor'
  try {
    const savedPalette = window.localStorage.getItem(PALETTE_KEY)
    return savedPalette === 'current' ? 'current' : 'tripmonitor'
  } catch {
    return 'tripmonitor'
  }
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  paletteId: 'tripmonitor',
  setPaletteId: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(initialMode)
  const [paletteId, setPaletteId] = useState<PaletteId>(initialPalette)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
    root.dataset.palette = paletteId
    try {
      window.localStorage.setItem(MODE_KEY, isDark ? 'dark' : 'light')
      window.localStorage.setItem(PALETTE_KEY, paletteId)
    } catch (_) {}
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

