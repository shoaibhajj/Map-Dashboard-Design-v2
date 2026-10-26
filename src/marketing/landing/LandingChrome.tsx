import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import ThemeToggle from '../../shared/ThemeToggle'
import LanguageToggle from '../../shared/LanguageToggle'
import { landingCopy } from './copy'

function Mark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'h-6 w-6' : 'h-7 w-7'
  return (
    <span className={`${box} flex items-center justify-center bg-neon`} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-ground">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    </span>
  )
}

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const { lang } = useLanguage()
  const { isAuthenticated } = useAuth()
  const copy = landingCopy[lang].nav

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '#system', label: copy.system },
    { href: '#signal', label: copy.signal },
    { href: '#continuity', label: copy.continuity },
    { href: '#console', label: copy.console },
  ]

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled ? 'border-b border-edge bg-ground/95 backdrop-blur-sm' : 'border-b border-transparent'}`}>
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <Link to="/" className="lp-focus flex items-center gap-2.5">
          <Mark />
          <span className="lp-ltr font-display text-xl font-bold tracking-widest text-text">TRIPMONITOR</span>
        </Link>
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="lp-focus font-body text-sm text-muted transition-colors hover:text-text">{l.label}</a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <LanguageToggle variant="nav" />
          <ThemeToggle variant="nav" />
          {!isAuthenticated && (
            <Link to="/login" className="lp-focus hidden px-2 font-body text-sm text-muted transition-colors hover:text-text sm:inline">
              {copy.login}
            </Link>
          )}
          <Link to={isAuthenticated ? '/app' : '/signup'} className="lp-btn lp-btn-primary hidden !min-h-9 !px-4 !text-sm sm:inline-flex">
            {isAuthenticated ? copy.open : copy.create}
          </Link>
        </div>
      </nav>
    </header>
  )
}

export function LandingFooter() {
  const { lang } = useLanguage()
  const copy = landingCopy[lang].footer
  const cols = [
    { heading: copy.product, links: ['Platform', 'Pricing', 'API', 'Status'] },
    { heading: copy.company, links: ['About', 'Careers', 'Blog', 'Contact'] },
    { heading: copy.legal, links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
  ]
  return (
    <footer className="bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <Mark size="sm" />
              <span className="lp-ltr font-display text-sm font-bold tracking-widest text-text">TRIPMONITOR</span>
            </div>
            <p className="font-body text-sm leading-relaxed text-muted">{copy.tagline}</p>
          </div>
          {cols.map((col) => (
            <div key={col.heading} className="flex flex-col gap-4">
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-neon">{col.heading}</h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="lp-focus lp-ltr font-body text-sm text-muted transition-colors hover:text-text">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-edge pt-6 md:flex-row">
          <p className="font-mono text-xs text-muted">{copy.copyright}</p>
          <p className="flex items-center gap-2 font-mono text-xs text-muted">
            <span className="h-1.5 w-1.5 bg-amber" aria-hidden="true" />
            {copy.status}
          </p>
        </div>
      </div>
    </footer>
  )
}
