import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthField from './AuthField'
import AuthBackdrop from './AuthBackdrop'
import AuthBrandMark from './AuthBrandMark'
import { useLanguage } from '../contexts/LanguageContext'
import ThemeToggle from '../shared/ThemeToggle'
import LanguageToggle from '../shared/LanguageToggle'

export default function Signup() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [expanded, setExpanded] = useState(false)
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!expanded) {
      setExpanded(true)
      return
    }
    if (!agree) {
      setError(t('auth_accept_terms_error'))
      return
    }
    setError('')
    setLoading(true)
    // No real signup endpoint yet — this is a static demo, so the only
    // account that actually works is admin / admin (see AuthContext).
    // Send the visitor to Login, where that's called out clearly,
    // instead of pretending a brand-new account was created.
    setTimeout(() => {
      navigate('/login', { replace: true })
    }, 900)
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
          <p className="font-body text-muted text-sm mb-7">{t('auth_tagline_signup')}</p>

          <form onSubmit={handleSubmit} noValidate className="text-start">
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
                  <AuthField label={t('auth_full_name')} name="name" autoComplete="name" tabIndex={expanded ? 0 : -1} />
                  <AuthField
                    label={t('auth_username')}
                    name="identifier"
                    autoComplete="email"
                    tabIndex={expanded ? 0 : -1}
                  />
                  <AuthField
                    label={t('auth_company')}
                    name="company"
                    autoComplete="organization"
                    tabIndex={expanded ? 0 : -1}
                  />
                  <AuthField
                    label={t('auth_password')}
                    name="password"
                    isPassword
                    autoComplete="new-password"
                    tabIndex={expanded ? 0 : -1}
                  />
                  <AuthField
                    label={t('auth_confirm_password')}
                    name="confirm"
                    isPassword
                    autoComplete="new-password"
                    tabIndex={expanded ? 0 : -1}
                  />
                  {error && <p className="font-mono text-xs text-red mb-4">{error}</p>}
                  <label className="flex items-start gap-2.5 font-mono text-xs text-muted mb-6 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={e => setAgree(e.target.checked)}
                      tabIndex={expanded ? 0 : -1}
                      className="w-3.5 h-3.5 mt-0.5 accent-[#00e8b4]"
                    />
                    <span>
                      {t('auth_agree_prefix')}{' '}
                      <a href="/terms" className="text-neon hover:text-neon-dim transition-colors">
                        {t('auth_terms')}
                      </a>{' '}
                      {t('auth_and')}{' '}
                      <a href="/privacy" className="text-neon hover:text-neon-dim transition-colors">
                        {t('auth_privacy')}
                      </a>
                    </span>
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
                  {t('auth_creating_account')}
                </>
              ) : (
                t('auth_create_account')
              )}
            </button>
          </form>

          <p className="font-mono text-xs text-muted mt-6">
            {t('auth_have_account')}{' '}
            <Link to="/login" className="text-neon hover:text-neon-dim transition-colors">
              {t('auth_sign_in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
