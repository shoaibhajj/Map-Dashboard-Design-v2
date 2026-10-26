import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { landingCopy, type ModuleId } from './copy'

const MODULES: { id: ModuleId; path: string; glyph: string }[] = [
  { id: 'map', path: '/app', glyph: 'M3 6l5-2 6 2 5-2v14l-5 2-6-2-5 2z M8 4v14 M14 6v14' },
  { id: 'dashboard', path: '/app/dashboard', glyph: 'M3 3h8v8H3z M13 3h8v5h-8z M13 10h8v11h-8z M3 13h8v8H3z' },
  { id: 'vehicles', path: '/app/vehicles', glyph: 'M2 7h12v9H2z M14 10h4l3 3v3h-7z M6 19a1.5 1.5 0 1 0 0-.01 M17 19a1.5 1.5 0 1 0 0-.01' },
  { id: 'ads', path: '/app/advertisements', glyph: 'M3 10v4h3l6 4V6L6 10z M16 9a4 4 0 0 1 0 6 M19 6a8 8 0 0 1 0 12' },
]

export default function ModuleIndex() {
  const { lang } = useLanguage()
  const copy = landingCopy[lang].modules

  return (
    <section id="console" aria-labelledby="lp-modules-title" className="border-b border-edge bg-surface2">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:py-28 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <header className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-neon">{copy.kicker}</p>
          <h2 id="lp-modules-title" className="lp-display font-display text-4xl font-extrabold uppercase text-text text-balance md:text-6xl">
            {copy.title}
          </h2>
          <p className="max-w-sm font-body text-sm leading-relaxed text-muted">{copy.note}</p>
        </header>
        <ul className="flex flex-col border-t border-edge">
          {MODULES.map((m) => (
            <li key={m.id} className="border-b border-edge">
              <Link to={m.path} className="lp-module lp-focus relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5 px-2 py-6 md:px-4">
                <span className="lp-module-rule absolute inset-x-0 bottom-[-1px] h-px bg-neon" aria-hidden="true" />
                <span className="flex h-11 w-11 items-center justify-center border border-edge text-neon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                    <path d={m.glyph} />
                  </svg>
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-display text-2xl font-bold uppercase tracking-wide text-text">{copy.items[m.id].name}</span>
                  <span className="font-body text-sm leading-relaxed text-muted text-pretty">{copy.items[m.id].line}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="lp-ltr hidden font-mono text-xs text-muted sm:inline">{m.path}</span>
                  <svg viewBox="0 0 16 16" className="lp-arrow h-4 w-4 text-muted" aria-hidden="true">
                    <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
