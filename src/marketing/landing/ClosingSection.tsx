import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { landingCopy, LAYER_ORDER } from './copy'

export default function ClosingSection() {
  const { lang } = useLanguage()
  const { isAuthenticated } = useAuth()
  const all = landingCopy[lang]
  const copy = all.closing

  return (
    <section id="start" aria-labelledby="lp-closing-title" className="border-b border-edge bg-ground">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 py-24 text-center md:py-32">
        <p className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-muted" aria-label={LAYER_ORDER.map((id) => all.layers[id].name).join(' → ')}>
          {LAYER_ORDER.map((id, i) => (
            <Fragment key={id}>
              <span className={i === LAYER_ORDER.length - 1 ? 'text-neon' : ''}>{all.layers[id].name}</span>
              {i < LAYER_ORDER.length - 1 && <span aria-hidden="true" className="h-px w-8 bg-neon/60" />}
            </Fragment>
          ))}
        </p>
        <h2 id="lp-closing-title" className="lp-display font-display text-5xl font-extrabold uppercase text-text text-balance md:text-7xl">
          {copy.title}
        </h2>
        <p className="max-w-lg font-body text-base leading-relaxed text-muted text-pretty">{copy.body}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to={isAuthenticated ? '/app' : '/signup'} className="lp-btn lp-btn-primary">
            {isAuthenticated ? copy.primaryAuth : copy.primaryGuest}
            <svg viewBox="0 0 16 16" className="lp-arrow h-4 w-4" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
          </Link>
          {!isAuthenticated && <Link to="/login" className="lp-btn lp-btn-ghost">{copy.secondary}</Link>}
        </div>
        <p className="font-mono text-xs text-muted">{all.hero.demoNote}</p>
      </div>
    </section>
  )
}
