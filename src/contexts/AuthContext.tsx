import { createContext, useContext, useState, ReactNode } from 'react'

/**
 * ───────────────────────────────────────────────────────────────
 * DEMO AUTH — static credentials, no backend.
 * ───────────────────────────────────────────────────────────────
 * This is scaffolding so the protected /app route and the login
 * flow have something real to check against. It is NOT production
 * auth: the "session" is just a flag in localStorage, and the only
 * valid account is admin / admin.
 *
 * When you're ready to wire up a real backend, replace the body of
 * `login()` below with your API call and keep the same return
 * shape (boolean, or throw/reject on failure — update the caller
 * in src/auth/Login.tsx to match). Nothing else in the app needs
 * to change: every component that cares about auth state reads it
 * through useAuth(), never by talking to localStorage directly.
 * See docs/GUIDE.md → "Adding real authentication" for the full
 * walkthrough.
 * ───────────────────────────────────────────────────────────────
 */

const DEMO_USERNAME = 'admin'
const DEMO_PASSWORD = 'admin'
const STORAGE_KEY = 'tripmonitor-auth'

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
})

function getInitialAuth(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(STORAGE_KEY) === '1'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(getInitialAuth)

  function login(username: string, password: string): boolean {
    const ok =
      username.trim().toLowerCase() === DEMO_USERNAME && password === DEMO_PASSWORD
    if (ok) {
      setIsAuthenticated(true)
      window.localStorage.setItem(STORAGE_KEY, '1')
    }
    return ok
  }

  function logout() {
    setIsAuthenticated(false)
    window.localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
