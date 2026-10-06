import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

interface Props {
  activeRoute: string
}

const NavMapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
)
const NavTruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)
const NavReportsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6"  y1="20" x2="6"  y2="14"/>
  </svg>
)
const NavBellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const NavSettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const COLLAPSED_W = 52
const EXPANDED_W  = 200

export default function Sidebar({ activeRoute }: Props) {
  const { t, isRTL } = useLanguage()
  const [open, setOpen] = useState(false)

  const navItems = [
    { id: 'map',           labelKey: 'nav_map' as const,      icon: <NavMapIcon />,      badge: null, badgeAlert: false },
    { id: 'vehicles',      labelKey: 'nav_vehicles' as const,  icon: <NavTruckIcon />,    badge: 6,    badgeAlert: false },
    { id: 'reports',       labelKey: 'nav_reports' as const,   icon: <NavReportsIcon />,  badge: null, badgeAlert: false },
    { id: 'notifications', labelKey: 'nav_alerts' as const,    icon: <NavBellIcon />,     badge: 3,    badgeAlert: true  },
    { id: 'settings',      labelKey: 'nav_settings' as const,  icon: <NavSettingsIcon />, badge: null, badgeAlert: false },
  ]

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{
        width: open ? EXPANDED_W : COLLAPSED_W,
        minWidth: open ? EXPANDED_W : COLLAPSED_W,
        background: 'var(--card)',
        borderRight: isRTL ? 'none' : '1px solid var(--border)',
        borderLeft:  isRTL ? '1px solid var(--border)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)',
        flexShrink: 0,
        zIndex: 40,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 0',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        overflow: 'hidden',
        /* Always center the logo icon in the collapsed width */
        paddingLeft: isRTL ? 0 : (COLLAPSED_W - 32) / 2,
        paddingRight: isRTL ? (COLLAPSED_W - 32) / 2 : 0,
      }}>
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
          <rect width="32" height="32" rx="8" fill="var(--primary)"/>
          <path d="M16 5C11.03 5 7 9.03 7 14c0 6.5 9 17 9 17s9-10.5 9-17c0-4.97-4.03-9-9-9zm0 12a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" fill="white"/>
        </svg>
        <div style={{
          opacity: open ? 1 : 0,
          transform: open ? 'translateX(0)' : isRTL ? 'translateX(6px)' : 'translateX(-6px)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
          whiteSpace: 'nowrap', minWidth: 0, pointerEvents: open ? 'auto' : 'none',
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{t('app_name')}</div>
          <div style={{ fontSize: 9.5, color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t('app_subtitle')}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, paddingTop: 6, paddingBottom: 6, overflow: 'hidden' }}>
        {navItems.map(item => {
          const isActive = activeRoute === item.id
          return (
            <div key={item.id} style={{ position: 'relative', padding: '2px 6px' }}>
              <button
                style={{
                  width: '100%',
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  /* Icon is always centered in the collapsed-width area; label appears after */
                  gap: 0,
                  padding: 0,
                  background: isActive ? 'color-mix(in srgb, var(--primary) 11%, transparent)' : 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                  position: 'relative',
                  transition: 'background 0.15s, color 0.15s',
                  overflow: 'hidden',
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {/* Active accent bar */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left:   isRTL ? undefined : -6,
                    right:  isRTL ? -6 : undefined,
                    top: '15%', bottom: '15%',
                    width: 3,
                    borderRadius: isRTL ? '3px 0 0 3px' : '0 3px 3px 0',
                    background: 'var(--primary)',
                  }} />
                )}

                {/* Icon cell — fixed width matches collapsed sidebar */}
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: COLLAPSED_W - 12,  /* 12 = 2 * 6px wrapper padding */
                  flexShrink: 0,
                }}>
                  {item.icon}
                </span>

                {/* Label — slides in */}
                <span style={{
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: 'nowrap',
                  opacity: open ? 1 : 0,
                  transform: open ? 'translateX(0)' : isRTL ? 'translateX(6px)' : 'translateX(-6px)',
                  transition: 'opacity 0.18s ease, transform 0.18s ease',
                  flex: 1,
                  pointerEvents: 'none',
                }}>
                  {t(item.labelKey)}
                </span>

                {/* Badge (expanded) */}
                {item.badge && open && (
                  <span style={{
                    background: item.badgeAlert ? '#ef4444' : 'var(--muted)',
                    color: item.badgeAlert ? '#fff' : 'var(--muted-foreground)',
                    fontSize: 10.5, fontWeight: 700,
                    padding: '1px 6px', borderRadius: 99,
                    flexShrink: 0,
                    marginRight: 10,
                    opacity: open ? 1 : 0,
                    transition: 'opacity 0.15s ease',
                  }}>
                    {item.badge}
                  </span>
                )}

                {/* Badge dot (collapsed, alert-only) */}
                {item.badge && !open && item.badgeAlert && (
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    right: isRTL ? undefined : 8,
                    left:  isRTL ? 8 : undefined,
                    width: 7, height: 7,
                    borderRadius: '50%',
                    background: '#ef4444',
                    border: '1.5px solid var(--card)',
                  }} />
                )}
              </button>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '10px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px',
          borderRadius: 6,
          background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, boxShadow: '0 0 6px var(--primary)' }} />
          {open && (
            <span style={{
              fontSize: 10.5, fontWeight: 600, color: 'var(--primary)',
              opacity: open ? 1 : 0, transition: 'opacity 0.15s ease',
            }}>
              {t('nav_live')}
            </span>
          )}
        </div>
        {open && (
          <span style={{
            fontSize: 10, color: 'var(--muted-foreground)', opacity: 0.6,
            transition: 'opacity 0.15s ease',
          }}>
            {t('version')}
          </span>
        )}
      </div>
    </div>
  )
}
