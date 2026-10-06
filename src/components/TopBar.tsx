import { useState, useRef, useEffect } from 'react'
import { Vehicle } from '../data/vehicles'
import { useLanguage } from '../contexts/LanguageContext'

interface Props {
  darkMode: boolean
  onToggleDark: () => void
  vehicles: Vehicle[]
  onVehicleSelect: (v: Vehicle) => void
  onOpenFilter: () => void
  filterActive: boolean
  hideFleetControls?: boolean
  hideRightControls?: boolean
}

const statusDot: Record<string, string> = {
  moving: '#16a34a',
  idle: '#9ca3af',
  offline: '#ef4444',
}

export default function TopBar({ darkMode, onToggleDark, vehicles, onVehicleSelect, onOpenFilter, filterActive, hideFleetControls = false, hideRightControls = false }: Props) {
  const { t, lang, setLang, isRTL } = useLanguage()
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [showResults, setShowResults] = useState(false)
  const [focused, setFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)

  const chipFilters = [
    { id: 'all',     labelKey: 'filter_all' as const },
    { id: 'moving',  labelKey: 'filter_moving' as const },
    { id: 'idle',    labelKey: 'filter_idle' as const },
    { id: 'offline', labelKey: 'filter_offline' as const },
  ]

  const filtered = searchQuery.length > 0
    ? vehicles.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.driver.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const movingCount = vehicles.filter(v => v.status === 'moving').length

  const glassStyle = {
    background: 'color-mix(in srgb, var(--card) 96%, transparent)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    boxShadow: '0 2px 16px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
  }

  const ctrlBtnStyle = {
    width: 38, height: 38, borderRadius: 9,
    border: '1px solid var(--border)',
    background: 'color-mix(in srgb, var(--card) 96%, transparent)',
    backdropFilter: 'blur(16px)',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--muted-foreground)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.09)',
    transition: 'color 0.15s, background 0.15s',
  }

  return (
    <div style={{
      position: 'absolute',
      top: 10, left: 10, right: 10,
      zIndex: 30,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      pointerEvents: 'none',
      flexDirection: isRTL ? 'row-reverse' : 'row',
    }}>

      {!hideFleetControls && <>
      {/* Left pill: search + filter chips */}
      <div style={{
        ...glassStyle,
        display: 'flex', alignItems: 'center', gap: 0,
        flex: 1, maxWidth: 560,
        pointerEvents: 'all',
        overflow: 'visible', position: 'relative',
      }}>
        {/* Search area */}
        <div ref={searchRef} style={{ position: 'relative', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', height: 40 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowResults(true) }}
              onFocus={() => { setFocused(true); setShowResults(true) }}
              placeholder={t('search_placeholder')}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13.5, color: 'var(--foreground)', width: '100%', fontFamily: 'var(--font-sans)', letterSpacing: '-0.01em' }}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowResults(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', padding: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          {/* Results dropdown */}
          {showResults && filtered.length > 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: -1, right: -1, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', zIndex: 99, overflow: 'hidden' }}>
              <div style={{ padding: '6px 10px 4px', fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
                {filtered.length} {filtered.length !== 1 ? t('n_results') : t('n_result')}
              </div>
              {filtered.map((v, i) => (
                <button key={v.id}
                  onClick={() => { onVehicleSelect(v); setSearchQuery(''); setShowResults(false) }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'transparent', border: 'none', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: statusDot[v.status], flexShrink: 0, boxShadow: `0 0 6px ${statusDot[v.status]}80` }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{v.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted-foreground)' }}>{v.plate} · {v.driver !== 'Unassigned' ? v.driver : t('no_driver')}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    <span style={{ fontSize: 12, color: statusDot[v.status], fontWeight: 600 }}>{t(`status_${v.status}` as any)}</span>
                    {v.status === 'moving' && <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>{v.speed} {t('kmh')}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 22, background: 'var(--border)', flexShrink: 0, margin: '0 2px' }} />

        {/* Status filter chips */}
        <div style={{ display: 'flex', gap: 2, padding: '4px 6px' }}>
          {chipFilters.map(f => (
            <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{
              padding: '5px 10px', borderRadius: 6, border: '1px solid',
              borderColor: activeFilter === f.id ? 'var(--primary)' : 'transparent',
              background: activeFilter === f.id ? 'var(--primary)' : 'transparent',
              color: activeFilter === f.id ? '#fff' : 'var(--muted-foreground)',
              fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
            }}>
              {f.id !== 'all' && (
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: activeFilter === f.id ? '#fff' : statusDot[f.id], opacity: 0.9 }} />
              )}
              {t(f.labelKey)}
              {f.id !== 'all' && (
                <span style={{ fontSize: 10.5, fontWeight: 700, opacity: 0.75 }}>
                  {vehicles.filter(v => v.status === f.id).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Live indicator */}
      <div style={{
        ...glassStyle,
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '0 14px', height: 40,
        pointerEvents: 'all',
      }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 8px #16a34a', animation: 'livePulse 2s ease-in-out infinite' }} />
        <style>{`@keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>
          {movingCount} <span style={{ fontWeight: 400, color: 'var(--muted-foreground)' }}>{t('n_active')}</span>
        </span>
      </div>

      {/* Filter button — separate, after the live indicator */}
      <button
        onClick={onOpenFilter}
        title={t('filter_btn')}
        style={{
          ...glassStyle,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 14px', height: 40,
          pointerEvents: 'all',
          cursor: 'pointer',
          borderColor: filterActive ? 'var(--primary)' : 'var(--border)',
          background: filterActive
            ? 'color-mix(in srgb, var(--primary) 13%, var(--card))'
            : 'color-mix(in srgb, var(--card) 96%, transparent)',
          color: filterActive ? 'var(--primary)' : 'var(--muted-foreground)',
          fontSize: 13, fontWeight: 600,
          transition: 'all 0.15s',
          flexShrink: 0,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        {t('filter_btn')}
        {filterActive && (
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
        )}
      </button>
      </>}

      <div style={{ flex: 1 }} />

      {/* Right controls */}
      {!hideRightControls && <div style={{ display: 'flex', gap: 6, alignItems: 'center', pointerEvents: 'all', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          title={t('language_toggle')}
          style={{ ...ctrlBtnStyle, width: 'auto', padding: '0 11px', fontSize: 12.5, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.01em' }}
        >
          {t('language_toggle')}
        </button>

        {/* Dark mode */}
        <button onClick={onToggleDark} title={darkMode ? t('light_mode') : t('dark_mode')} style={ctrlBtnStyle}>
          {darkMode ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* Notifications */}
        <button title={t('notifications')} style={{ ...ctrlBtnStyle, position: 'relative' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <div style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', border: '1.5px solid var(--card)' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#ef4444', animation: 'livePulse 1.8s ease infinite' }} />
          </div>
        </button>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'color-mix(in srgb, var(--card) 96%, transparent)', backdropFilter: 'blur(16px)', border: '1px solid var(--border)', borderRadius: 9, padding: '4px 10px 4px 5px', boxShadow: '0 2px 10px rgba(0,0,0,0.09)', cursor: 'pointer' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, var(--primary) 0%, #15803d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>AD</div>
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>Alex D.</div>
            <div style={{ fontSize: 10.5, color: 'var(--muted-foreground)' }}>{t('fleet_admin')}</div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 2 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>}
    </div>
  )
}
