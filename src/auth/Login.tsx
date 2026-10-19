import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AuthField from './AuthField'
import AuthBackdrop from './AuthBackdrop'
import AuthBrandMark from './AuthBrandMark'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from '../shared/ThemeToggle'
import LanguageToggle from '../shared/LanguageToggle'

export default function Login() {
  const { t } = useLanguage()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [expanded, setExpanded] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!expanded) {
      setExpanded(true)
      return
    }
    const data = new FormData(e.currentTarget)
    const identifier = String(data.get('identifier') || '')
    const password = String(data.get('password') || '')

    setError('')
    setLoading(true)
    // Static demo check (admin / admin) — see src/contexts/AuthContext.tsx
    // for where to plug in a real API call later.
    setTimeout(() => {
      const ok = login(identifier, password)
      setLoading(false)
      if (ok) {
        const dest = (location.state as { from?: Location })?.from?.pathname || '/app'
        navigate(dest, { replace: true })
      } else {
        setError(t('auth_invalid_credentials'))
      }
    }, 700)
  }

  return (
    <div className="marketing-scope relative min-h-screen bg-ground text-text font-body flex items-center justify-center px-6 overflow-hidden">
      <AuthBackdrop />

      <div className="absolute top-6 end-6 flex items-center gap-2">
        <LanguageToggle variant="corner" />
        <ThemeToggle variant="corner" />
      </div>

      {/* brand mark lives above the card, not inside it */}
      <div className="relative w-full max-w-sm flex flex-col items-center">
        <AuthBrandMark />

        <div
          className="w-full bg-surface border border-edge px-8 py-10 text-center"
          style={{ boxShadow: '0 0 60px #00e8b414, 0 0 160px #00e8b408' }}
        >
          <p className="font-body text-muted text-sm mb-7">{t('auth_tagline_login')}</p>

          <form onSubmit={handleSubmit} noValidate className="text-start">
            {/* expands open on the first click of the button below */}
            <div
              style={{
                display: 'grid',
                gridTemplateRows: expanded ? '1fr' : '0fr',
                transition: 'grid-template-rows 0.45s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              <div style={{ overflow: 'hidden', minHeight: 0 }}>
                <div
                  className="pt-1"
                  style={{
                    opacity: expanded ? 1 : 0,
                    transition: 'opacity 0.35s ease',
                    transitionDelay: expanded ? '0.1s' : '0s',
                  }}
                >
                  <AuthField
                    label={t('auth_username')}
                    name="identifier"
                    autoComplete="username"
                    tabIndex={expanded ? 0 : -1}
                  />
                  <AuthField
                    label={t('auth_password')}
                    name="password"
                    isPassword
                    autoComplete="current-password"
                    tabIndex={expanded ? 0 : -1}
                  />
                  {error && <p className="font-mono text-xs text-red mb-4">{error}</p>}
                  <p className="font-mono text-[11px] text-muted mb-4">{t('auth_demo_hint')}</p>
                  <label className="flex items-center gap-2 font-mono text-xs text-muted mb-6 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={e => setRemember(e.target.checked)}
                      tabIndex={expanded ? 0 : -1}
                      className="w-3.5 h-3.5 accent-[#00e8b4]"
                    />
                    {t('auth_remember')}
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-display font-bold tracking-widest text-sm uppercase px-7 py-3.5 bg-neon text-ground hover:bg-neon-dim transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ boxShadow: '0 0 24px #00e8b422' }}
            >
              {loading ? (
                <>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 animate-spin" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  {t('auth_logging_in')}
                </>
              ) : (
                t('auth_log_in')
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-2">
            <a href="/forgot-password" className="font-mono text-xs text-neon hover:text-neon-dim transition-colors">
              {t('auth_forgot')}
            </a>
            <p className="font-mono text-xs text-muted">
              {t('auth_no_account')}{' '}
              <Link to="/signup" className="text-neon hover:text-neon-dim transition-colors">
                {t('auth_sign_up')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
