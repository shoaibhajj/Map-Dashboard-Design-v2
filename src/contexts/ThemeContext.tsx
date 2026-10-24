import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type PaletteId = 'current' | 'tripmonitor'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
  paletteId: PaletteId
  setPaletteId: (palette: PaletteId) => void
}

// TEMP: Force the startup theme while user preference persistence is paused.
// TODO: Restore reading and writing the fleetview-color-mode and fleetview-palette keys when user settings are ready.
const INITIAL_DARK_MODE = true
const INITIAL_PALETTE: PaletteId = 'tripmonitor'

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  paletteId: 'tripmonitor',
  setPaletteId: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(INITIAL_DARK_MODE)
  const [paletteId, setPaletteId] = useState<PaletteId>(INITIAL_PALETTE)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
    root.dataset.palette = paletteId
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
