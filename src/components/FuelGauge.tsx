interface Props {
  level: number      // 0–100
  showLabel?: boolean
  compact?: boolean
}

function FuelIcon({ size = 14, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8l2-2 2 2v6a2 2 0 0 1-2 2h-2"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 11h12" stroke={color} strokeWidth="2"/>
    </svg>
  )
}

export default function FuelGauge({ level, showLabel = true, compact = false }: Props) {
  const clamped = Math.min(100, Math.max(0, level))
  const color = clamped > 50 ? '#16a34a' : clamped > 20 ? '#f59e0b' : '#ef4444'
  const isLow = clamped <= 20
  const isMed = clamped > 20 && clamped <= 50

  const segments = 10
  const filledSegments = Math.round((clamped / 100) * segments)

  if (compact) {
    // Compact bar with icon
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <FuelIcon color={color} />
        <div style={{
          flex: 1,
          height: 6,
          background: 'var(--muted)',
          borderRadius: 99,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            width: `${clamped}%`,
            height: '100%',
            borderRadius: 99,
            background: `linear-gradient(90deg, ${color}cc 0%, ${color} 100%)`,
            transition: 'width 0.4s ease',
          }} />
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, color, fontFamily: 'var(--font-mono)',
          minWidth: 30, textAlign: 'right',
        }}>
          {clamped}%
        </span>
      </div>
    )
  }

  // Full gauge with segmented bars
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <FuelIcon color={color} />
          {showLabel && (
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Fuel Level
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>
            {clamped}
          </span>
          <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>%</span>
          {isLow && (
            <span style={{
              marginLeft: 6, fontSize: 9, fontWeight: 700,
              background: '#ef444420', color: '#ef4444',
              padding: '1px 5px', borderRadius: 99,
            }}>LOW</span>
          )}
        </div>
      </div>

      {/* Segmented bar */}
      <div style={{ display: 'flex', gap: 2, height: 10 }}>
        {Array.from({ length: segments }).map((_, i) => {
          const filled = i < filledSegments
          const segColor = i < 2 ? '#ef4444' : i < 5 ? '#f59e0b' : '#16a34a'
          return (
            <div
              key={i}
              style={{
                flex: 1,
                borderRadius: i === 0 ? '3px 0 0 3px' : i === segments - 1 ? '0 3px 3px 0' : 2,
                background: filled ? segColor : 'var(--muted)',
                transition: 'background 0.3s',
                opacity: filled ? 1 : 0.35,
              }}
            />
          )
        })}
      </div>

      {/* Min/max labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, color: '#ef4444', fontFamily: 'var(--font-mono)', opacity: 0.7 }}>E</span>
        <span style={{ fontSize: 9, color: '#16a34a', fontFamily: 'var(--font-mono)', opacity: 0.7 }}>F</span>
      </div>
    </div>
  )
}
