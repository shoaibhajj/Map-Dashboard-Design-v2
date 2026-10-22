import { useEffect, useState, useCallback } from 'react'

interface PingPoint {
  id: number
  x: number
  y: number
}

interface Props {
  enabled?: boolean
}

export default function GPSCursorEffects({ enabled = true }: Props) {
  const [pings, setPings] = useState<PingPoint[]>([])

  const triggerPing = useCallback((x: number, y: number) => {
    if (!enabled) return
    const id = Date.now() + Math.random()
    setPings(current => [...current.slice(-5), { id, x, y }])

    // Auto cleanup after animation ends
    window.setTimeout(() => {
      setPings(current => current.filter(p => p.id !== id))
    }, 600)
  }, [enabled])

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      // Don't trigger if right click or modifier
      if (e.button !== 0) return
      triggerPing(e.clientX, e.clientY)
    }

    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [triggerPing])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        overflow: 'hidden',
      }}
    >
      {pings.map(ping => (
        <div
          key={ping.id}
          className="gps-click-ripple"
          style={{
            left: ping.x,
            top: ping.y,
          }}
        >
          {/* Central radar pinpoint */}
          <div className="ripple-core" />
          {/* Expanding primary radar ring */}
          <div className="ripple-wave" />
          {/* Radar cardinal ticks (N, S, E, W) */}
          <svg className="ripple-ticks" viewBox="0 0 32 32" fill="none">
            <line x1="16" y1="2" x2="16" y2="7" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="16" y1="25" x2="16" y2="30" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="2" y1="16" x2="7" y2="16" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="25" y1="16" x2="30" y2="16" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
      ))}
    </div>
  )
}
