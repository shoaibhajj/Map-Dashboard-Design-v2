interface Props {
  speed: number
  maxSpeed?: number
  size?: number
}

export default function SpeedGauge({ speed, maxSpeed = 120, size = 130 }: Props) {
  const cx = size / 2
  const cy = size * 0.58
  const R = size * 0.42
  const sw = Math.max(6, size * 0.056)

  // ratio in [0, 1]
  const ratio = Math.min(Math.max(speed, 0) / maxSpeed, 1)

  // Angle convention: angle=PI → left end of arc (speed=0), angle=0 → right end (speed=maxSpeed)
  // Both arc fill and needle share identical formula → they always agree
  const angle = Math.PI * (1 - ratio)

  const startX = cx - R  // left end (speed=0)
  const startY = cy
  const endX   = cx + R  // right end (speed=maxSpeed)
  const endY   = cy

  // Fill arc endpoint
  const fx = cx + R * Math.cos(angle)
  const fy = cy - R * Math.sin(angle)

  // largeArc is always 0: we always travel the short clockwise path from start to fx,fy
  // (the arc spans 0–180°, so the short clockwise path never exceeds 180°)
  const fillArc = `M ${startX} ${startY} A ${R} ${R} 0 0 1 ${fx.toFixed(3)} ${fy.toFixed(3)}`

  const fillColor = ratio < 1/3 ? '#16a34a' : ratio < 2/3 ? '#f59e0b' : '#ef4444'

  const ticks = [0, 30, 60, 90, 120]
  const labelR = R - sw * 2.5
  const tickOuter = R + sw * 0.3
  const tickInner = R - sw * 0.4

  // Needle tip — slightly shorter than R so it sits inside the track
  const nx = cx + (R - sw * 0.6) * Math.cos(angle)
  const ny = cy - (R - sw * 0.6) * Math.sin(angle)

  return (
    <svg
      viewBox={`0 0 ${size} ${size * 0.72}`}
      width={size}
      height={size * 0.72}
      style={{ overflow: 'visible', display: 'block' }}
    >
      {/* Background track — full semicircle */}
      <path
        d={`M ${startX} ${startY} A ${R} ${R} 0 0 1 ${endX} ${endY}`}
        fill="none" stroke="var(--muted)" strokeWidth={sw} strokeLinecap="round"
      />

      {/* Colored fill arc */}
      {speed > 0 && (
        <path
          d={fillArc}
          fill="none" stroke={fillColor} strokeWidth={sw} strokeLinecap="round"
          style={{ transition: 'd 0.35s ease' }}
        />
      )}

      {/* Tick marks + labels */}
      {ticks.map(tick => {
        const ta = Math.PI * (1 - tick / maxSpeed)
        const xo = cx + tickOuter * Math.cos(ta)
        const yo = cy - tickOuter * Math.sin(ta)
        const xi = cx + tickInner * Math.cos(ta)
        const yi = cy - tickInner * Math.sin(ta)
        const xl = cx + labelR * Math.cos(ta)
        const yl = cy - labelR * Math.sin(ta)
        return (
          <g key={tick}>
            <line x1={xo} y1={yo} x2={xi} y2={yi}
              stroke="var(--muted-foreground)" strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
            <text x={xl} y={yl + 1}
              fontSize={size * 0.072} textAnchor="middle" dominantBaseline="middle"
              fill="var(--muted-foreground)" opacity="0.55" fontFamily="var(--font-mono)">
              {tick}
            </text>
          </g>
        )
      })}

      {/* Needle */}
      <line
        x1={cx} y1={cy} x2={nx} y2={ny}
        stroke={fillColor} strokeWidth={Math.max(2, size * 0.022)} strokeLinecap="round"
        style={{ transition: 'x2 0.35s ease, y2 0.35s ease' }}
      />
      {/* Pivot */}
      <circle cx={cx} cy={cy} r={Math.max(3.5, size * 0.032)} fill={fillColor} />
      <circle cx={cx} cy={cy} r={Math.max(1.5, size * 0.014)} fill="var(--card)" />

      {/* Speed readout */}
      <text x={cx} y={cy + size * 0.115} textAnchor="middle"
        fontSize={size * 0.19} fontWeight="800"
        fill="var(--foreground)" fontFamily="var(--font-mono)">
        {speed}
      </text>
      <text x={cx} y={cy + size * 0.22} textAnchor="middle"
        fontSize={size * 0.075} fill="var(--muted-foreground)" fontFamily="var(--font-sans)">
        km/h
      </text>
    </svg>
  )
}
