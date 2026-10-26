import { useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { landingCopy, FIELD_ORDER, type FieldId } from './copy'

const ROW = 64
const READING_ORDER: FieldId[] = ['gnss', 'speed', 'fuel', 'camera', 'weight', 'wasl']

export default function PacketDecoder() {
  const { lang } = useLanguage()
  const copy = landingCopy[lang].signal
  const [hover, setHover] = useState<FieldId | null>(null)
  const [pinned, setPinned] = useState<FieldId | null>(null)
  const active = hover ?? pinned

  const bind = (id: FieldId) => ({
    onMouseEnter: () => setHover(id),
    onMouseLeave: () => setHover(null),
    onFocus: () => setHover(id),
    onBlur: () => setHover(null),
    onClick: () => setPinned((p) => (p === id ? null : id)),
    'aria-pressed': pinned === id,
    'data-on': active === id ? '' : undefined,
  })

  const height = ROW * FIELD_ORDER.length

  return (
    <section id="signal" aria-labelledby="lp-signal-title" className="border-b border-edge bg-surface2">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-20 md:py-28">
        <header className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-neon">{copy.kicker}</p>
            <h2 id="lp-signal-title" className="lp-display font-display text-4xl font-extrabold uppercase text-text text-balance md:text-6xl">
              {copy.title}
            </h2>
          </div>
          <p className="max-w-lg font-body text-base leading-relaxed text-muted text-pretty">{copy.body}</p>
        </header>

        <div className="lp-decoder grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_120px_minmax(0,1fr)] md:gap-0" data-active={active ? '' : undefined}>
          <div className="flex flex-col border border-edge bg-ground">
            <div className="flex items-center justify-between gap-3 border-b border-edge px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em]">
              <span className="text-text">{copy.packetLabel}</span>
              <span className="text-muted">{copy.packetTime}</span>
            </div>
            <ul className="flex flex-col">
              {FIELD_ORDER.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    {...bind(id)}
                    className="lp-raw-row lp-focus flex w-full items-center gap-3 border-s-2 border-transparent px-5 text-start"
                    style={{ height: ROW }}
                  >
                    <span className="lp-ltr truncate font-mono text-sm text-text">{copy.fields[id].raw}</span>
                    <span className="sr-only">{`→ ${copy.fields[id].label}: ${copy.fields[id].value}`}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <svg
            className="hidden h-full w-full md:block rtl:-scale-x-100"
            viewBox={`0 0 100 ${height}`}
            preserveAspectRatio="none"
            style={{ marginTop: 45, height }}
            aria-hidden="true"
          >
            {FIELD_ORDER.map((id, i) => {
              const y1 = ROW * i + ROW / 2
              const y2 = ROW * READING_ORDER.indexOf(id) + ROW / 2
              return (
                <path
                  key={id}
                  className="lp-link-path"
                  data-on={active === id ? '' : undefined}
                  d={`M0 ${y1} C 50 ${y1}, 50 ${y2}, 100 ${y2}`}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
          </svg>

          <div className="flex flex-col border border-edge bg-ground">
            <div className="flex items-center justify-between gap-3 border-b border-edge px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em]">
              <span className="text-text">{copy.readingsLabel}</span>
              <span className="text-muted">{copy.updated}</span>
            </div>
            <ul className="flex flex-col">
              {READING_ORDER.map((id) => {
                const f = copy.fields[id]
                return (
                  <li key={id}>
                    <button
                      type="button"
                      {...bind(id)}
                      className="lp-read-row lp-focus grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 border-e-2 border-transparent px-5 text-start"
                      style={{ height: ROW }}
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="font-body text-xs text-muted">{f.label}</span>
                        <span className="truncate font-display text-lg font-bold tracking-wide text-text">{f.value}</span>
                      </span>
                      <span className="flex flex-col items-end">
                        <span className={`lp-ltr font-mono text-xs ${f.older ? 'text-amber' : 'text-neon'}`}>{f.time}</span>
                        {f.older && <span className="font-mono text-[10px] text-muted">{copy.older}</span>}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
        <p className="font-mono text-xs text-muted">{copy.disclaimer}</p>
      </div>
    </section>
  )
}
