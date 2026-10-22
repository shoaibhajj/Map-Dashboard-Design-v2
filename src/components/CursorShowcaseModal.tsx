import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import {
  GPS_CURSOR_DEFINITIONS,
  GPSNavArrowIcon,
  GPSOpenHandIcon,
  GPSGrabbingHandIcon,
  GPSPointingHandIcon,
  GPSVerticalResizeIcon,
} from '../utils/gpsCursors'

interface Props {
  open: boolean
  onClose: () => void
  radarPingEnabled: boolean
  onToggleRadarPing: () => void
}

export default function CursorShowcaseModal({ open, onClose, radarPingEnabled, onToggleRadarPing }: Props) {
  const { lang } = useLanguage()
  const { paletteId, setPaletteId } = useTheme()
  const [activeTestPad, setActiveTestPad] = useState<string | null>(null)

  if (!open) return null

  const isAr = lang === 'ar'
  const isEmerald = paletteId === 'current'

  const renderIcon = (id: string, size = 26) => {
    switch (id) {
      case 'default':
        return <GPSNavArrowIcon size={size} />
      case 'grab':
        return <GPSOpenHandIcon size={size} />
      case 'grabbing':
        return <GPSGrabbingHandIcon size={size} />
      case 'pointer':
        return <GPSPointingHandIcon size={size} />
      case 'ns-resize':
        return <GPSVerticalResizeIcon size={size} />
      default:
        return <GPSNavArrowIcon size={size} />
    }
  }

  const getCursorStyle = (id: string) => {
    switch (id) {
      case 'default':
        return 'var(--cursor-default)'
      case 'grab':
        return 'var(--cursor-grab)'
      case 'grabbing':
        return 'var(--cursor-grabbing)'
      case 'pointer':
        return 'var(--cursor-pointer)'
      case 'ns-resize':
        return 'var(--cursor-ns-resize)'
      default:
        return 'var(--cursor-default)'
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        background: 'rgba(5, 12, 18, 0.72)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 780,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--card)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* Clean, minimalist Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'color-mix(in srgb, var(--primary) 14%, var(--card))',
                border: '1px solid var(--primary)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--primary)',
              }}
            >
              <GPSNavArrowIcon size={18} />
            </div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 750, color: 'var(--foreground)' }}>
              {isAr ? 'مؤشرات النظام (System Cursors)' : 'System Cursors'}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--muted-foreground)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'var(--cursor-pointer)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content body */}
        <div style={{ padding: '18px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Top Bar Controls: Palette Switcher & Ping toggle */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'var(--secondary)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Palette Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 650, color: 'var(--foreground)' }}>
                {isAr ? 'الثيم:' : 'Theme:'}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setPaletteId('current')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 11px',
                    borderRadius: 7,
                    fontSize: 11.5,
                    fontWeight: isEmerald ? 750 : 550,
                    border: `1.5px solid ${isEmerald ? '#22c55e' : 'var(--border)'}`,
                    background: isEmerald ? 'color-mix(in srgb, #22c55e 12%, var(--card))' : 'var(--card)',
                    color: isEmerald ? '#22c55e' : 'var(--muted-foreground)',
                    cursor: 'var(--cursor-pointer)',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  {isAr ? 'الأخضر الزمردي' : 'Emerald Green'}
                </button>

                <button
                  onClick={() => setPaletteId('tripmonitor')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 11px',
                    borderRadius: 7,
                    fontSize: 11.5,
                    fontWeight: !isEmerald ? 750 : 550,
                    border: `1.5px solid ${!isEmerald ? '#00e8b4' : 'var(--border)'}`,
                    background: !isEmerald ? 'color-mix(in srgb, #00e8b4 12%, var(--card))' : 'var(--card)',
                    color: !isEmerald ? '#00e8b4' : 'var(--muted-foreground)',
                    cursor: 'var(--cursor-pointer)',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e8b4', display: 'inline-block' }} />
                  {isAr ? 'البترولي والنعناعي' : 'Petroleum Mint'}
                </button>
              </div>
            </div>

            {/* Click radar wave toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11.5, color: 'var(--muted-foreground)' }}>
                {isAr ? 'تأثير النقر:' : 'Click Ping:'}
              </span>
              <button
                onClick={onToggleRadarPing}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  border: `1px solid ${radarPingEnabled ? 'var(--primary)' : 'var(--border)'}`,
                  background: radarPingEnabled ? 'color-mix(in srgb, var(--primary) 15%, var(--card))' : 'var(--card)',
                  color: radarPingEnabled ? 'var(--primary)' : 'var(--muted-foreground)',
                  cursor: 'var(--cursor-pointer)',
                }}
              >
                {radarPingEnabled ? (isAr ? 'مفعّل ✓' : 'On ✓') : (isAr ? 'معطّل' : 'Off')}
              </button>
            </div>
          </div>

          {/* Cards Grid: 5 States (Clean & Focused) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 12,
            }}
          >
            {GPS_CURSOR_DEFINITIONS.map(item => {
              const isActive = activeTestPad === item.id
              const cursorVal = getCursorStyle(item.id)

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 14,
                    borderRadius: 10,
                    background: 'var(--card)',
                    border: `1.5px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                    boxShadow: isActive ? '0 4px 14px color-mix(in srgb, var(--primary) 18%, transparent)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: 'var(--secondary)',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                          color: 'var(--card)',
                        }}
                      >
                        {renderIcon(item.id, 24)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 750, color: 'var(--foreground)' }}>
                          {isAr ? item.nameAr : item.nameEn}
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--muted-foreground)' }}>
                          {item.triggerAr}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive live test pad */}
                  <div
                    onMouseEnter={() => setActiveTestPad(item.id)}
                    onMouseLeave={() => setActiveTestPad(null)}
                    style={{
                      height: 44,
                      borderRadius: 7,
                      border: '1.5px dashed var(--border)',
                      background: isActive ? 'color-mix(in srgb, var(--primary) 8%, var(--card))' : 'var(--secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      fontSize: 11.5,
                      fontWeight: 650,
                      color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                      cursor: `${cursorVal} !important`,
                      userSelect: 'none',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <span>{isAr ? 'حرّك الماوس هنا لتجربة المؤشر' : 'Hover here to test cursor'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Minimal Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '10px 20px',
            borderTop: '1px solid var(--border)',
            background: 'var(--secondary)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              borderRadius: 7,
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              border: 0,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'var(--cursor-pointer)',
            }}
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}
