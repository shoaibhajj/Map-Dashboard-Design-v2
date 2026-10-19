import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'

const LandingPage = lazy(() => import('./marketing/LandingPage'))
const Login = lazy(() => import('./auth/Login'))
const Signup = lazy(() => import('./auth/Signup'))
const MapDashboardRoute = lazy(() => import('./routes/MapDashboardRoute'))
const Dashboard = lazy(() => import('./dashboard/components/Dashboard'))
const VehiclesLayoutPage = lazy(() => import('./vehicles/components/VehiclesLayoutPage'))
const AdvertisementRoute = lazy(() => import('./routes/AdvertisementRoute'))

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<div role="status" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--background)', color: 'var(--muted-foreground)', fontSize: 13 }}>Loading page…</div>}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/app" element={<ProtectedRoute><MapDashboardRoute /></ProtectedRoute>} />
                <Route path="/app/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/app/vehicles" element={<ProtectedRoute><VehiclesLayoutPage /></ProtectedRoute>} />
                <Route path="/vehicles" element={<Navigate to="/app/vehicles" replace />} />
                <Route path="/app/advertisements" element={<ProtectedRoute><AdvertisementRoute /></ProtectedRoute>} />
                <Route path="/app/ads" element={<Navigate to="/app/advertisements" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
