import { useEffect, useId, useState } from 'react'

// ═══════════════════════════════════════════════════════════
// AuthBackdrop — SVG diamond-grid road map, bird's-eye view.
//
// Two families of straight diagonal routes cross at 45°,
// forming a symmetric diamond pattern. Pins travel the routes
// in both directions and turn at intersections.
//
// One SVG fills the container (xMidYMid slice). Routes and
// pins both live inside it so CSS @keyframe translate()s use
// SVG-coordinate space — pins stay exactly on their routes
// at every viewport size.
// ═══════════════════════════════════════════════════════════

// ── Canvas ───────────────────────────────────────────────
const W = 1440
const H = 900

// ── Route families ───────────────────────────────────────
// Family A  x+y=c  →  slope –1  (NE ↗ / SW ↙)
// Family B  x–y=c  →  slope +1  (SE ↘ / NW ↖)
//
// A1: x+y=900    A2: x+y=1450
// B1: x–y=0      B2: x–y=550
//
// Intersection nodes (perfect centered diamond):
//   N1 (450, 450)   A1×B1  left vertex
//   N2 (725, 175)   A1×B2  top vertex
//   N3 (725, 725)   A2×B1  bottom vertex
//   N4 (1000,450)   A2×B2  right vertex
//   Center (725, 450)

const NODES = [
  { x: 450,  y: 450  }, // N1
  { x: 725,  y: 175  }, // N2
  { x: 725,  y: 725  }, // N3
  { x: 1000, y: 450  }, // N4
]

// Lines extended 300 px beyond SVG edges
const ROUTES = [
  { id: 'A1', x1: -200, y1: 1100, x2: 1100, y2: -200 },
  { id: 'A2', x1:  250, y1: 1200, x2: 1650, y2: -200 },
  { id: 'B1', x1: -200, y1: -200, x2: 1100, y2: 1100 },
  { id: 'B2', x1:  250, y1: -300, x2: 1750, y2: 1200 },
]

// ── Pin definitions ──────────────────────────────────────
// Each pin renders at (cx=0, cy=0) and is positioned by
// CSS transform translate(tx,ty) in SVG-space px.
// Multi-keyframe pins turn at an intersection node.

const PINS = [
  {
    id: 'p1',
    color: '#00e8b4',
    dur: 17,
    delay: 0,
    // A1 NE: off-screen SW → off-screen NE
    kf: [
      { at: '0%',   tx: -200, ty:  1100 },
      { at: '100%', tx:  1100, ty:  -200 },
    ],
  },
  {
    id: 'p2',
    color: '#f59e0b',
    dur: 14,
    delay: 3.5,
    // B2 SE: off top → off bottom
    kf: [
      { at: '0%',   tx:   250, ty:  -300 },
      { at: '100%', tx:  1750, ty:  1200 },
    ],
  },
  {
    id: 'p3',
    color: '#00b58c',
    dur: 19,
    delay: 7,
    // A2 SW (reverse): off top-right → off bottom-left
    kf: [
      { at: '0%',   tx:  1650, ty:  -200 },
      { at: '100%', tx:   250, ty:  1200 },
    ],
  },
  {
    id: 'p4',
    color: '#a78bfa',
    dur: 22,
    delay: 1,
    // B1 SE → turn at N1 (450,450) → A1 NE
    kf: [
      { at: '0%',   tx:  -200, ty:  -200 },  // B1: off top-left
      { at: '44%',  tx:   450, ty:   450 },  // N1 node
      { at: '100%', tx:  1100, ty:  -200 },  // A1: off top-right
    ],
  },
  {
    id: 'p5',
    color: '#00e8b4',
    dur: 20,
    delay: 10,
    // A1 SW → turn at N1 (450,450) → B1 SE
    kf: [
      { at: '0%',   tx:  1100, ty:  -200 },  // A1: off top-right
      { at: '47%',  tx:   450, ty:   450 },  // N1 node
      { at: '100%', tx:  1100, ty:  1100 },  // B1: off bottom-right
    ],
  },
]

// ── Hook ────────────────────────────────────────────────
function usePrefersReducedMotion() {
  const [v, setV] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setV(mq.matches)
    const fn = () => setV(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return v
}

// ── Component ────────────────────────────────────────────
export default function AuthBackdrop({ className = '' }: { className?: string }) {
  const uid = useId().replace(/[^a-z0-9]/gi, '')
  const reduce = usePrefersReducedMotion()

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
      style={{ background: '#041319' }}
    >
      {/* Per-pin CSS keyframes in SVG-coordinate space */}
      {!reduce && (
        <style>{PINS.map(p => {
          const name = `${uid}${p.id}`
          const frames = p.kf
            .map(f => `${f.at}{transform:translate(${f.tx}px,${f.ty}px)}`)
            .join('')
          return `@keyframes ${name}{${frames}}`
        }).join('')}</style>
      )}

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          {/* Route glow */}
          <filter id={`${uid}rg`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Pin glow (wide, soft) */}
          <filter id={`${uid}pg`} x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="22" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Node glow */}
          <filter id={`${uid}ng`} x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="10" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient depth ellipse */}
        <ellipse cx="725" cy="450" rx="540" ry="330" fill="#0b2a2b" opacity="0.5" />

        {/* ── Road bodies (wide dark stroke) ── */}
        {ROUTES.map(r => (
          <line key={`${r.id}u`}
            x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
            stroke="#0c2a2c" strokeWidth="16" strokeLinecap="round"
          />
        ))}

        {/* ── Route center-line glow ── */}
        {ROUTES.map(r => (
          <line key={`${r.id}l`}
            x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
            stroke="#00e8b4" strokeWidth="1.8" strokeLinecap="round"
            opacity="0.5" filter={`url(#${uid}rg)`}
          />
        ))}

        {/* ── Scan sweep ── */}
        <rect x="-200" y="0" width={W + 400} height="2"
          fill="#00e8b4" opacity="0.05"
          style={{ animation: 'scan 10s linear infinite' }} />

        {/* ── Intersection nodes ── */}
        {NODES.map((n, i) => (
          <g key={i} filter={`url(#${uid}ng)`}>
            <circle cx={n.x} cy={n.y} r="16"
              fill="none" stroke="#00e8b4" strokeWidth="1.2" opacity="0.3">
              <animate attributeName="r"
                values={`${12 + i};${22 + i};${12 + i}`}
                dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
              <animate attributeName="opacity"
                values="0.3;0;0.3"
                dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={n.x} cy={n.y} r="5.5"
              fill="#041319" stroke="#00e8b4" strokeWidth="2" />
            <circle cx={n.x} cy={n.y} r="2.5" fill="#00e8b4" />
          </g>
        ))}

        {/* ── Moving pins ── */}
        {PINS.map(p => (
          <g key={p.id}
            style={reduce ? { transform: `translate(${p.kf[Math.floor(p.kf.length / 2)].tx}px,${p.kf[Math.floor(p.kf.length / 2)].ty}px)`, opacity: 0.6 }
              : { animation: `${uid}${p.id} ${p.dur}s linear ${p.delay}s infinite` }}
          >
            {/* Outer diffuse halo */}
            <circle cx={0} cy={0} r={60}
              fill={p.color} opacity="0.07"
              filter={`url(#${uid}pg)`}
            />
            {/* Mid ring */}
            <circle cx={0} cy={0} r={22}
              fill={p.color} opacity="0.15"
            />
            {/* Pin body — dark fill, colored border */}
            <circle cx={0} cy={0} r={13}
              fill="#041319" stroke={p.color} strokeWidth="2.5"
              filter={`url(#${uid}pg)`}
            />
            {/* Inner white dot */}
            <circle cx={0} cy={0} r={4} fill="#ffffff" opacity="0.92" />
          </g>
        ))}
      </svg>
    </div>
  )
}
