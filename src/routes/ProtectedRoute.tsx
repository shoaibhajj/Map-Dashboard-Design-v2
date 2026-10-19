import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Wrap any route element that should require login:
 *
 *   <Route path="/app" element={
 *     <ProtectedRoute><MapDashboard /></ProtectedRoute>
 *   } />
 *
 * Redirects to /login when signed out, and remembers where the
 * visitor was headed so Login can send them back after a
 * successful sign-in. See docs/GUIDE.md → "Adding a new protected
 * page" to add more routes like this.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
