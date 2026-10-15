import { useState } from 'react'
import { FABType } from '../types'
import { useLanguage } from '../contexts/LanguageContext'

interface Props {
  vehiclesPanelOpen: boolean
  panelInlineOffset: number
  onOpen: (type: FABType) => void
}

function TruckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"/>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  )
}

export default function FABStack({ vehiclesPanelOpen, panelInlineOffset, onOpen }: Props) {
  const { t, isRTL } = useLanguage()
  const [hoveredType, setHoveredType] = useState<FABType | null>(null)

  const fabDefs: { type: FABType; labelKey: 'fab_vehicles'; icon: React.ReactNode; tooltipKey: 'fab_opens_panel'; variant: 'panel' }[] = [
    { type: 'vehicles', labelKey: 'fab_vehicles', icon: <TruckIcon />, tooltipKey: 'fab_opens_panel', variant: 'panel' },
  ]

  const isActive = () => vehiclesPanelOpen
  return (
    <div style={{
      position: 'absolute',
      top: vehiclesPanelOpen ? 12 : 72,
      insetInlineStart: vehiclesPanelOpen ? panelInlineOffset : 10,
      display: 'flex', flexDirection: 'column', gap: 5, zIndex: 26,
      transition: 'inset-inline-start 180ms ease, top 180ms ease',
    }}>
      {fabDefs.map(fab => {
        const active = isActive()
        const hovered = hoveredType === fab.type

        return (
          <div key={fab.type} style={{ position: 'relative' }}>
            <button
              onClick={() => onOpen(fab.type)}
              onMouseEnter={() => setHoveredType(fab.type)}
              onMouseLeave={() => setHoveredType(null)}
              title={t(fab.labelKey)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 11px 7px 9px',
                background: active ? 'var(--primary)' : hovered ? 'color-mix(in srgb, var(--card) 100%, transparent)' : 'color-mix(in srgb, var(--card) 93%, transparent)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 9,
                cursor: 'pointer',
                color: active ? '#fff' : hovered ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontSize: 12, fontWeight: 600,
                boxShadow: active ? '0 2px 14px rgba(22,163,74,0.28)' : '0 2px 10px rgba(0,0,0,0.10)',
                whiteSpace: 'nowrap',
                transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
                fontFamily: 'var(--font-sans)', letterSpacing: '-0.01em',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', opacity: active ? 1 : hovered ? 0.9 : 0.65, transition: 'opacity 0.15s' }}>
                {fab.icon}
              </span>
              {t(fab.labelKey)}
              {fab.variant === 'panel' && active && (
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', marginLeft: 2 }} />
              )}
            </button>

            {hovered && !active && (
              <div style={{
                position: 'absolute',
                left: isRTL ? undefined : '100%',
                right: isRTL ? '100%' : undefined,
                top: '50%',
                transform: 'translateY(-50%)',
                marginLeft: isRTL ? 0 : 8,
                marginRight: isRTL ? 8 : 0,
                background: 'var(--foreground)', color: 'var(--card)',
                fontSize: 10, fontWeight: 500,
                padding: '3px 7px', borderRadius: 5,
                whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 99,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}>
                {t(fab.tooltipKey)}
                <div style={{
                  position: 'absolute',
                  right: isRTL ? undefined : '100%',
                  left: isRTL ? '100%' : undefined,
                  top: '50%', transform: 'translateY(-50%)',
                  borderTop: '4px solid transparent',
                  borderBottom: '4px solid transparent',
                  borderRight: isRTL ? undefined : '4px solid var(--foreground)',
                  borderLeft: isRTL ? '4px solid var(--foreground)' : undefined,
                }} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
