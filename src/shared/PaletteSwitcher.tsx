import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme, type PaletteId } from '../contexts/ThemeContext'

interface Props {
  variant?: 'pill' | 'corner' | 'nav'
}

const options: { id: PaletteId; swatch: string }[] = [
  { id: 'current', swatch: '#16a34a' },
  { id: 'tripmonitor', swatch: '#007560' },
]

export default function PaletteSwitcher({ variant = 'pill' }: Props) {
  const { t, isRTL } = useLanguage()
  const { paletteId, setPaletteId } = useTheme()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const buttonSize = variant === 'nav' ? 36 : 38

  return (
    <div ref={rootRef} style={{ position: 'relative', flex: '0 0 auto' }}>
      <button
        type="button"
        aria-label={t('palette_label')}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t('palette_label')}
        onClick={() => setOpen(value => !value)}
        style={{
          width: buttonSize,
          height: buttonSize,
          display: 'grid',
          placeItems: 'center',
          padding: 0,
          color: 'var(--primary)',
          background: variant === 'corner' || variant === 'nav' ? 'transparent' : 'color-mix(in srgb, var(--card) 96%, transparent)',
          border: '1px solid var(--border)',
          borderRadius: variant === 'nav' ? 9 : 10,
          boxShadow: variant === 'pill' ? '0 2px 10px rgba(0,0,0,.08)' : undefined,
          cursor: 'pointer',
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3a9 9 0 1 0 0 18h1.2a2.2 2.2 0 0 0 1.5-3.8 1.8 1.8 0 0 1 1.3-3.2H19a2 2 0 0 0 2-2A9 9 0 0 0 12 3Z" />
          <circle cx="7.5" cy="10" r=".8" fill="currentColor" />
          <circle cx="11" cy="7.2" r=".8" fill="currentColor" />
          <circle cx="15.2" cy="8.3" r=".8" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <div role="menu" aria-label={t('palette_label')} style={{
          position: 'absolute', top: 'calc(100% + 8px)', [isRTL ? 'left' : 'right']: 0, zIndex: 1300,
          display: 'grid', gap: 4, width: 208, padding: 6, color: 'var(--foreground)',
          background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12,
          boxShadow: 'var(--shadow-panel)',
        }}>
          {options.map(option => {
            const selected = paletteId === option.id
            return (
              <button key={option.id} type="button" role="menuitemradio" aria-checked={selected}
                onClick={() => { setPaletteId(option.id); setOpen(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', minHeight: 38, padding: '0 9px', textAlign: 'start', color: selected ? 'var(--primary)' : 'var(--foreground)', background: selected ? 'color-mix(in srgb, var(--primary) 9%, var(--card))' : 'transparent', border: 0, borderRadius: 8, font: 'inherit', fontSize: 12, fontWeight: selected ? 700 : 550, cursor: 'pointer' }}>
                <span aria-hidden="true" style={{ width: 15, height: 15, borderRadius: '50%', background: option.swatch, boxShadow: `0 0 0 3px color-mix(in srgb, ${option.swatch} 18%, transparent)` }} />
                <span style={{ flex: 1 }}>{t(option.id === 'current' ? 'palette_current' : 'palette_tripmonitor')}</span>
                {selected && <span aria-hidden="true">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
