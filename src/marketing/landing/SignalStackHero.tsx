import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { landingCopy, LAYER_ORDER, type LayerId } from './copy'

function AssetLayer() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <rect x="0" y="86" width="200" height="28" fill="var(--secondary)" />
      <rect x="86" y="0" width="28" height="200" fill="var(--secondary)" />
      <line x1="0" y1="100" x2="200" y2="100" stroke="var(--border)" strokeDasharray="6 6" />
      <line x1="100" y1="0" x2="100" y2="200" stroke="var(--border)" strokeDasharray="6 6" />
      {[[20, 20], [130, 20], [20, 130], [130, 130]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="50" height="50" fill="none" stroke="var(--border)" />
      ))}
      <g transform="translate(100 100)">
        <rect x="-9" y="-16" width="18" height="32" rx="3" fill="var(--foreground)" />
        <rect x="-7" y="-14" width="14" height="8" rx="1.5" fill="var(--primary)" />
      </g>
    </svg>
  )
}

function DeviceLayer() {
  const nodes = [
    { x: 34, y: 34, label: 'GNSS' },
    { x: 166, y: 34, label: 'FUEL' },
    { x: 34, y: 166, label: 'WGT' },
    { x: 166, y: 166, label: 'CAM' },
  ]
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      {nodes.map((n) => (
        <g key={n.label}>
          <path d={`M100 100 L${n.x} 100 L${n.x} ${n.y}`} fill="none" stroke="var(--lp-line)" strokeWidth="1.5" />
          <circle cx={n.x} cy={n.y} r="7" fill="var(--card)" stroke="var(--primary)" strokeWidth="1.5" />
          <text x={n.x} y={n.y < 100 ? n.y - 12 : n.y + 20} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--muted-foreground)">
            {n.label}
          </text>
        </g>
      ))}
      <rect x="78" y="78" width="44" height="44" fill="var(--secondary)" stroke="var(--primary)" strokeWidth="1.5" />
      {[86, 94, 102, 110].map((p) => (
        <g key={p}>
          <line x1={p} y1="72" x2={p} y2="78" stroke="var(--primary)" />
          <line x1={p} y1="122" x2={p} y2="128" stroke="var(--primary)" />
        </g>
      ))}
      <circle cx="100" cy="100" r="5" fill="var(--primary)" />
    </svg>
  )
}

function DataLayer() {
  const rows = [28, 46, 64, 136, 154, 172]
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      {rows.map((y, i) => (
        <g key={y}>
          <rect x="18" y={y - 5} width={26 + ((i * 17) % 30)} height="6" fill="var(--primary)" opacity={0.25 + (i % 3) * 0.2} />
          <rect x={56 + ((i * 17) % 30)} y={y - 5} width={60 - ((i * 11) % 24)} height="6" fill="var(--border)" />
          <rect x="150" y={y - 5} width="32" height="6" fill="var(--secondary)" />
        </g>
      ))}
      <line x1="18" y1="100" x2="182" y2="100" stroke="var(--lp-line)" />
      <circle cx="100" cy="100" r="9" fill="none" stroke="var(--primary)" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="4" fill="var(--primary)" />
      <text x="182" y="92" textAnchor="end" fontFamily="var(--font-mono)" fontSize="10" fill="var(--muted-foreground)">11:27:04</text>
    </svg>
  )
}

function DecisionLayer() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      {[[14, 14, 56, 40], [82, 14, 46, 60], [140, 14, 46, 46], [14, 66, 40, 58], [140, 72, 46, 60], [14, 136, 70, 50], [96, 140, 90, 46]].map(([x, y, w, h]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} fill="var(--secondary)" />
      ))}
      <path d="M20 178 C 52 150, 64 124, 100 100 S 160 52, 184 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="100" r="13" fill="none" stroke="var(--primary)" strokeWidth="1" opacity=".5" />
      <circle cx="100" cy="100" r="7" fill="var(--primary)" stroke="var(--card)" strokeWidth="2.5" />
      <rect x="112" y="108" width="56" height="20" fill="var(--card)" stroke="var(--primary)" />
      <text x="140" y="122" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--foreground)">62 km/h</text>
    </svg>
  )
}

const LAYER_ART: Record<LayerId, ComponentType> = {
  asset: AssetLayer,
  device: DeviceLayer,
  data: DataLayer,
  decision: DecisionLayer,
}

function PauseIcon({ paused }: { paused: boolean }) {
  return paused ? (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true"><path d="M5 3.5v9l7-4.5z" fill="currentColor" /></svg>
  ) : (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true"><path d="M5 3.5h2v9H5zM9 3.5h2v9H9z" fill="currentColor" /></svg>
  )
}

export default function SignalStackHero() {
  const { lang } = useLanguage()
  const { isAuthenticated } = useAuth()
  const copy = landingCopy[lang]
  const heroRef = useRef<HTMLElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [focus, setFocus] = useState<LayerId | null>(null)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const setOffscreen = (off: boolean) => {
      if (off) hero.setAttribute('data-offscreen', '')
      else hero.removeAttribute('data-offscreen')
    }
    let visible = true
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      setOffscreen(!visible || document.hidden)
    })
    io.observe(hero)
    const onVisibility = () => setOffscreen(!visible || document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  useEffect(() => {
    const hero = heroRef.current
    const stack = stackRef.current
    if (!hero || !stack) return
    const allowTilt = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)')
    if (!allowTilt.matches) return
    let frame = 0
    const onMove = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect()
      const nx = (event.clientX - rect.left) / rect.width - 0.5
      const ny = (event.clientY - rect.top) / rect.height - 0.5
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        stack.style.setProperty('--lp-rz', `${-40 + nx * 10}deg`)
        stack.style.setProperty('--lp-rx', `${58 - ny * 8}deg`)
      })
    }
    const onLeave = () => {
      cancelAnimationFrame(frame)
      stack.style.removeProperty('--lp-rz')
      stack.style.removeProperty('--lp-rx')
    }
    hero.addEventListener('pointermove', onMove)
    hero.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      hero.removeEventListener('pointermove', onMove)
      hero.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <section
      ref={heroRef}
      id="system"
      aria-labelledby="lp-hero-title"
      className="lp-hero relative overflow-hidden border-b border-edge pt-16"
      data-paused={paused ? '' : undefined}
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-6 px-6 pb-8 pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10 lg:pt-16">
        <div className="flex flex-col gap-7">
          <p className="lp-rise flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-neon" style={{ '--d': 0 } as CSSProperties}>
            <span className="h-px w-8 bg-neon" aria-hidden="true" />
            {copy.hero.eyebrow}
          </p>
          <h1
            id="lp-hero-title"
            className="lp-display lp-rise font-display font-extrabold uppercase text-text text-balance"
            style={{ '--d': 1, fontSize: 'clamp(2.75rem, 6.2vw, 5.75rem)' } as CSSProperties}
          >
            {copy.hero.titleA}
            <br />
            <span className="text-neon">{copy.hero.titleB}</span>
          </h1>
          <p className="lp-rise max-w-md font-body text-base leading-relaxed text-muted text-pretty md:text-lg" style={{ '--d': 2 } as CSSProperties}>
            {copy.hero.body}
          </p>
          <div className="lp-rise flex flex-wrap gap-3" style={{ '--d': 3 } as CSSProperties}>
            <Link to={isAuthenticated ? '/app' : '/signup'} className="lp-btn lp-btn-primary">
              {isAuthenticated ? copy.hero.ctaPrimaryAuth : copy.hero.ctaPrimaryGuest}
              <svg viewBox="0 0 16 16" className="lp-arrow h-4 w-4" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
            </Link>
            <a href="#signal" className="lp-btn lp-btn-ghost">{copy.hero.ctaSecondary}</a>
          </div>
          <p className="lp-rise font-mono text-xs text-muted" style={{ '--d': 4 } as CSSProperties}>{copy.hero.demoNote}</p>
        </div>

        <div className="relative">
          <div
            className="lp-stage"
            role="img"
            aria-label={copy.hero.stageLabel}
            data-focus={focus ?? undefined}
          >
            <div ref={stackRef} className="lp-stack lp-ltr">
              {LAYER_ORDER.map((id, i) => {
                const Art = LAYER_ART[id]
                return (
                  <div key={id} className="lp-plane" data-layer={id} style={{ '--i': i } as CSSProperties}>
                    <div className="lp-plane-edge-b" />
                    <div className="lp-plane-edge-r" />
                    <div className="lp-plane-face"><Art /></div>
                  </div>
                )
              })}
              <div className="lp-spine" />
              <div className="lp-pulse" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            aria-label={paused ? copy.hero.play : copy.hero.pause}
            title={paused ? copy.hero.play : copy.hero.pause}
            className="lp-focus absolute bottom-2 end-2 flex h-10 w-10 items-center justify-center border border-edge bg-ground text-muted transition-colors hover:border-neon hover:text-neon"
          >
            <PauseIcon paused={paused} />
          </button>
        </div>
      </div>

      <ol className="mx-auto grid max-w-7xl grid-cols-2 border-t border-edge md:grid-cols-4">
        {LAYER_ORDER.map((id, i) => (
          <li key={id} className="border-edge [&:not(:last-child)]:border-e max-md:[&:nth-child(-n+2)]:border-b">
            <button
              type="button"
              className="lp-chain-item lp-focus flex h-full w-full flex-col items-start gap-1.5 px-6 py-5 text-start"
              style={{ '--i': i } as CSSProperties}
              data-active={focus === id ? '' : undefined}
              onMouseEnter={() => setFocus(id)}
              onMouseLeave={() => setFocus(null)}
              onFocus={() => setFocus(id)}
              onBlur={() => setFocus(null)}
              aria-describedby={`lp-layer-${id}`}
            >
              <span className="lp-chain-bar" aria-hidden="true" />
              <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-neon">
                <span className="lp-ltr">L{i + 1}</span>
                <span aria-hidden="true" className="h-px w-4 bg-edge" />
              </span>
              <span className="font-display text-xl font-bold uppercase tracking-wide text-text">{copy.layers[id].name}</span>
              <span id={`lp-layer-${id}`} className="font-body text-sm leading-relaxed text-muted">{copy.layers[id].line}</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
