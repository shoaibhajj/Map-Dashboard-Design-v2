import { useRef, useState, type ComponentType, type KeyboardEvent } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { landingCopy, LENS_ORDER, type LensId } from './copy'

type Copy = (typeof landingCopy)['en']['lens']

const FLEET_DOTS: { x: number; y: number; g: 'a' | 'b' | 'c' }[] = [
  { x: 120, y: 90, g: 'a' }, { x: 150, y: 70, g: 'a' }, { x: 170, y: 110, g: 'a' }, { x: 140, y: 130, g: 'a' }, { x: 196, y: 84, g: 'a' },
  { x: 380, y: 200, g: 'b' }, { x: 410, y: 170, g: 'b' }, { x: 440, y: 215, g: 'b' }, { x: 400, y: 240, g: 'b' }, { x: 460, y: 180, g: 'b' }, { x: 360, y: 230, g: 'b' },
  { x: 620, y: 100, g: 'c' }, { x: 650, y: 130, g: 'c' }, { x: 600, y: 140, g: 'c' }, { x: 680, y: 96, g: 'c' },
]
const SELECTED = { x: 170, y: 110 }

function FleetView({ copy }: { copy: Copy }) {
  return (
    <svg viewBox="0 0 800 300" className="h-full w-full" role="img" aria-label={copy.stops.fleet.caption}>
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="300" stroke="var(--border)" strokeOpacity=".5" />
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 100} x2="800" y2={i * 100} stroke="var(--border)" strokeOpacity=".5" />
      ))}
      <path d="M60 210 C 200 160, 300 260, 420 200 S 640 90, 760 120" fill="none" stroke="var(--border)" strokeWidth="10" strokeLinecap="round" />
      <ellipse cx="158" cy="100" rx="68" ry="46" fill="color-mix(in srgb, var(--primary) 10%, transparent)" stroke="var(--primary)" strokeDasharray="4 4" />
      <ellipse cx="410" cy="205" rx="74" ry="52" fill="none" stroke="var(--border)" strokeDasharray="4 4" />
      <ellipse cx="640" cy="116" rx="60" ry="40" fill="none" stroke="var(--border)" strokeDasharray="4 4" />
      {FLEET_DOTS.map((d) => (
        <circle key={`${d.x}-${d.y}`} cx={d.x} cy={d.y} r="5" fill={d.g === 'a' ? 'var(--primary)' : 'var(--muted-foreground)'} />
      ))}
      <circle className="lp-selected-ring" cx={SELECTED.x} cy={SELECTED.y} r="7" fill="none" stroke="var(--primary)" strokeWidth="2" />
      <circle cx={SELECTED.x} cy={SELECTED.y} r="7" fill="var(--primary)" stroke="var(--card)" strokeWidth="2.5" />
      <text x="158" y="40" textAnchor="middle" fontFamily="var(--font-body)" fontSize="13" fill="var(--foreground)">{copy.groups.a}</text>
      <text x="410" y="138" textAnchor="middle" fontFamily="var(--font-body)" fontSize="13" fill="var(--muted-foreground)">{copy.groups.b}</text>
      <text x="640" y="62" textAnchor="middle" fontFamily="var(--font-body)" fontSize="13" fill="var(--muted-foreground)">{copy.groups.c}</text>
    </svg>
  )
}

function GroupView({ copy }: { copy: Copy }) {
  const rows: { label: string; count: number; depth: number; on: boolean; pick?: boolean }[] = [
    { label: copy.groups.root, count: 15, depth: 0, on: false },
    { label: copy.groups.a, count: 5, depth: 1, on: true },
    { label: copy.groups.a1, count: 3, depth: 2, on: true, pick: true },
    { label: copy.groups.a2, count: 2, depth: 2, on: true },
    { label: copy.groups.b, count: 6, depth: 1, on: false },
    { label: copy.groups.c, count: 4, depth: 1, on: false },
  ]
  return (
    <ul className="flex h-full flex-col justify-center gap-1 px-4 py-6 md:px-10" aria-label={copy.stops.group.caption}>
      {rows.map((r) => (
        <li
          key={r.label}
          className={`flex items-center gap-3 border px-4 py-2.5 ${r.on ? 'border-neon/50 bg-neon/5' : 'border-transparent'}`}
          style={{ marginInlineStart: r.depth * 28 }}
        >
          <span aria-hidden="true" className={`h-3 w-3 border ${r.on ? 'border-neon bg-neon' : 'border-edge'}`} />
          <span className={`flex-1 font-body text-sm ${r.on ? 'text-text' : 'text-muted'}`}>{r.label}</span>
          {r.pick && <span className="font-mono text-[10px] uppercase tracking-widest text-neon">{copy.selected}</span>}
          <span className="lp-ltr font-mono text-xs text-muted">{r.count} {copy.groups.vehicles}</span>
        </li>
      ))}
    </ul>
  )
}

function VehicleView({ copy }: { copy: Copy }) {
  const v = copy.vehicle
  const facts = [
    { k: copy.fieldLabels.plate, val: v.plate },
    { k: copy.fieldLabels.driver, val: v.driver },
    { k: copy.fieldLabels.speed, val: v.speed },
    { k: copy.fieldLabels.fuel, val: v.fuel },
  ]
  return (
    <div className="flex h-full items-center justify-center px-4 py-6">
      <article className="grid w-full max-w-2xl grid-cols-1 gap-6 border border-edge bg-ground p-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
        <div className="flex h-20 w-20 items-center justify-center border border-neon bg-neon/10" aria-hidden="true">
          <svg viewBox="0 0 48 48" className="h-10 w-10">
            <rect x="6" y="16" width="26" height="18" fill="none" stroke="var(--primary)" strokeWidth="2" />
            <path d="M32 22h7l4 6v6H32z" fill="none" stroke="var(--primary)" strokeWidth="2" />
            <circle cx="14" cy="36" r="3.5" fill="var(--primary)" />
            <circle cx="36" cy="36" r="3.5" fill="var(--primary)" />
          </svg>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col">
              <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-text">{v.name}</h3>
              <span className="font-body text-sm text-muted">{v.group}</span>
            </div>
            <span className="flex items-center gap-2 border border-neon/50 px-2.5 py-1 font-mono text-xs text-neon">
              <span className="h-1.5 w-1.5 rounded-full bg-neon" aria-hidden="true" />
              {v.status}
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-px border border-edge bg-edge sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.k} className="flex flex-col gap-1 bg-ground px-3 py-2.5">
                <dt className="font-body text-xs text-muted">{f.k}</dt>
                <dd className="truncate font-mono text-sm text-text">{f.val}</dd>
              </div>
            ))}
          </dl>
          <p className="font-mono text-xs text-muted">{`${copy.fieldLabels.updated}: ${v.updated}`}</p>
        </div>
      </article>
    </div>
  )
}

function TripView({ copy }: { copy: Copy }) {
  const speeds = [0, 18, 42, 60, 64, 58, 22, 0, 0, 30, 54, 66, 70, 62, 34, 0, 0, 26, 48, 62]
  const max = 80
  const pts = speeds.map((s, i) => `${(i / (speeds.length - 1)) * 760 + 20},${150 - (s / max) * 110}`).join(' ')
  const stops = [
    { x: 20, label: copy.trip.depot, time: '08:12' },
    { x: 20 + (7.5 / 19) * 760, label: copy.trip.stop1, time: '09:04' },
    { x: 20 + (15.5 / 19) * 760, label: copy.trip.stop2, time: '10:31' },
    { x: 780, label: copy.trip.now, time: '11:27' },
  ]
  return (
    <svg viewBox="0 0 800 300" className="lp-ltr h-full w-full" role="img" aria-label={copy.stops.trip.caption}>
      <line x1="20" y1="150" x2="780" y2="150" stroke="var(--border)" />
      <polyline points={pts} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="20" y1="220" x2="780" y2="220" stroke="var(--border)" strokeWidth="6" strokeLinecap="round" />
      <line x1="20" y1="220" x2="780" y2="220" stroke="var(--primary)" strokeWidth="2" />
      {stops.map((s, i) => (
        <g key={s.label}>
          <line x1={s.x} y1="150" x2={s.x} y2="214" stroke="var(--border)" strokeDasharray="3 3" />
          <circle cx={s.x} cy="220" r={i === stops.length - 1 ? 8 : 6} fill={i === stops.length - 1 ? 'var(--primary)' : 'var(--card)'} stroke="var(--primary)" strokeWidth="2" />
          <text x={s.x} y="250" textAnchor={i === 0 ? 'start' : i === stops.length - 1 ? 'end' : 'middle'} fontFamily="var(--font-body)" fontSize="13" fill="var(--foreground)">{s.label}</text>
          <text x={s.x} y="268" textAnchor={i === 0 ? 'start' : i === stops.length - 1 ? 'end' : 'middle'} fontFamily="var(--font-mono)" fontSize="11" fill="var(--muted-foreground)">{s.time}</text>
        </g>
      ))}
      <text x="20" y="28" fontFamily="var(--font-mono)" fontSize="11" fill="var(--muted-foreground)">km/h</text>
      <text x="780" y="28" textAnchor="end" fontFamily="var(--font-mono)" fontSize="11" fill="var(--primary)">RUH 4821</text>
    </svg>
  )
}

const VIEWS: Record<LensId, ComponentType<{ copy: Copy }>> = {
  fleet: FleetView,
  group: GroupView,
  vehicle: VehicleView,
  trip: TripView,
}

export default function ContinuityLens() {
  const { lang, isRTL } = useLanguage()
  const copy = landingCopy[lang].lens
  const [stop, setStop] = useState<LensId>('fleet')
  const tabRefs = useRef<Record<LensId, HTMLButtonElement | null>>({ fleet: null, group: null, vehicle: null, trip: null })
  const index = LENS_ORDER.indexOf(stop)
  const View = VIEWS[stop]

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const forward = isRTL ? 'ArrowLeft' : 'ArrowRight'
    const back = isRTL ? 'ArrowRight' : 'ArrowLeft'
    let next = index
    if (e.key === forward) next = Math.min(LENS_ORDER.length - 1, index + 1)
    else if (e.key === back) next = Math.max(0, index - 1)
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = LENS_ORDER.length - 1
    else return
    e.preventDefault()
    const id = LENS_ORDER[next]
    setStop(id)
    tabRefs.current[id]?.focus()
  }

  return (
    <section id="continuity" aria-labelledby="lp-lens-title" className="border-b border-edge bg-ground">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-20 md:py-28">
        <header className="flex max-w-3xl flex-col gap-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-neon">{copy.kicker}</p>
          <h2 id="lp-lens-title" className="lp-display font-display text-4xl font-extrabold uppercase text-text text-balance md:text-6xl">
            {copy.title}
          </h2>
          <p className="max-w-xl font-body text-base leading-relaxed text-muted text-pretty">{copy.body}</p>
        </header>

        <div className="flex flex-col border border-edge bg-surface">
          <div className="relative border-b border-edge px-4 pb-4 pt-6 md:px-8">
            <div className="absolute inset-x-8 top-[38px] hidden h-px bg-edge md:block" aria-hidden="true">
              <div className="lp-track-fill h-px bg-neon" style={{ transform: `scaleX(${index / (LENS_ORDER.length - 1)})` }} />
            </div>
            <div role="tablist" aria-label={copy.tablistLabel} className="relative grid grid-cols-4 gap-2">
              {LENS_ORDER.map((id, i) => (
                <button
                  key={id}
                  ref={(el) => { tabRefs.current[id] = el }}
                  role="tab"
                  id={`lp-tab-${id}`}
                  aria-selected={stop === id}
                  aria-controls="lp-lens-panel"
                  tabIndex={stop === id ? 0 : -1}
                  onClick={() => setStop(id)}
                  onKeyDown={onKey}
                  className={`lp-stop lp-focus flex flex-col gap-2 py-1 ${i === 0 ? 'items-start' : i === LENS_ORDER.length - 1 ? 'items-end' : 'items-center'} ${stop === id ? 'text-text' : 'text-muted hover:text-text'}`}
                >
                  <span className="lp-stop-dot h-3 w-3 rounded-full border border-neon bg-ground" aria-hidden="true" />
                  <span className="font-display text-base font-bold uppercase tracking-wide md:text-lg">{copy.stops[id].name}</span>
                </button>
              ))}
            </div>
          </div>
          <div id="lp-lens-panel" role="tabpanel" aria-labelledby={`lp-tab-${stop}`} className="relative overflow-hidden">
            <div key={stop} className="lp-lens-view h-80 md:h-96">
              <View copy={copy} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-edge px-4 py-3 md:px-8">
              <p className="font-body text-sm text-text">{copy.stops[stop].caption}</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{copy.demo}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
