import { Vehicle } from '../data/vehicles'
import { useLanguage } from '../contexts/LanguageContext'
import FuelGauge from './FuelGauge'
import SpeedGauge from './SpeedGauge'

interface Props {
  vehicle: Vehicle
  expanded: boolean
  minimized: boolean
  focused: boolean
  onExpand: () => void
  onMinimize: () => void
  onClose: () => void
  onActivate?: () => void
  dragHandleProps: React.HTMLAttributes<HTMLDivElement>
  isDragging: boolean
}

const statusConfig: Record<string, { color: string; bg: string }> = {
  moving:  { color: '#16a34a', bg: 'rgba(22,163,74,0.10)' },
  idle:    { color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
  offline: { color: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
}

function GripIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="5" r="1.2" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="9" cy="19" r="1.2" fill="currentColor"/>
      <circle cx="15" cy="5" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="19" r="1.2" fill="currentColor"/>
    </svg>
  )
}

function CtrlBtn({ onClick, title, children }: { onClick: (e: React.MouseEvent) => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(e) }}
      title={title}
      style={{
        width: 23, height: 23, borderRadius: 5,
        border: '1px solid var(--border)', background: 'var(--secondary)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--muted-foreground)', flexShrink: 0, transition: 'background 0.12s',
      }}
    >
      {children}
    </button>
  )
}

export default function VehicleFlowCard({ vehicle, expanded, minimized, focused, onExpand, onMinimize, onClose, onActivate, dragHandleProps, isDragging }: Props) {
  const { t } = useLanguage()
  const cfg = statusConfig[vehicle.status]
  const speed = vehicle.status === 'moving' ? vehicle.speed : 0

  return (
    <div
      onClick={onActivate}
      style={{
        background: 'color-mix(in srgb, var(--card) 98%, transparent)',
        backdropFilter: 'blur(18px)',
        border: focused ? `2px solid var(--primary)` : '1px solid var(--border)',
        borderRadius: 11,
        boxShadow: focused
          ? '0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent), 0 3px 16px rgba(0,0,0,0.10)'
          : isDragging ? '0 16px 48px rgba(0,0,0,0.22)' : '0 3px 16px rgba(0,0,0,0.10)',
        overflow: 'hidden',
        opacity: isDragging ? 0.88 : 1,
        transition: 'box-shadow 0.2s, border-color 0.2s, opacity 0.15s',
        animation: 'card-in 0.2s cubic-bezier(0.4,0,0.2,1)',
        cursor: onActivate ? 'pointer' : 'default',
      }}
    >
      <style>{`@keyframes card-in { from { opacity:0; transform:translateX(12px) scale(0.97); } to { opacity:1; transform:scale(1); } }`}</style>

      {/* Focused indicator strip */}
      {focused && <div style={{ height: 2, background: 'var(--primary)', width: '100%' }} />}

      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '8px 8px 8px 6px',
        borderBottom: minimized ? 'none' : '1px solid var(--border)',
      }}>
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          onClick={e => e.stopPropagation()}
          style={{ cursor: 'grab', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', padding: '2px 2px', borderRadius: 4, flexShrink: 0, userSelect: 'none', opacity: 0.5, ...dragHandleProps.style }}
        >
          <GripIcon />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: cfg.bg, borderRadius: 99, padding: '2px 7px', flexShrink: 0 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color }}>{t(`status_${vehicle.status}` as any)}</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {vehicle.name}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--muted-foreground)' }}>{vehicle.plate}</div>
        </div>

        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          <CtrlBtn onClick={() => onExpand()} title={expanded ? t('ctrl_collapse') : t('ctrl_expand')}>
            {expanded
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>
              : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            }
          </CtrlBtn>
          <CtrlBtn onClick={() => onMinimize()} title={minimized ? t('ctrl_restore') : t('ctrl_minimize')}>
            {minimized
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            }
          </CtrlBtn>
          <CtrlBtn onClick={() => onClose()} title={t('ctrl_close')}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </CtrlBtn>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Speed gauge + trip distance */}
          <div style={{ display: 'flex', padding: '6px 10px 4px', borderBottom: '1px solid var(--border)', alignItems: 'center', gap: 6 }}>
            <div style={{ flexShrink: 0 }}>
              <SpeedGauge speed={speed} maxSpeed={120} size={88} />
            </div>
            <div style={{ width: 1, height: 36, background: 'var(--border)', flexShrink: 0 }} />
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--foreground)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                {vehicle.status !== 'offline' ? vehicle.tripDistance : '—'}
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--muted-foreground)', marginTop: 3 }}>
                {t('lbl_trip')} (km)
              </div>
            </div>
          </div>

          {/* Expanded details */}
          {expanded && (
            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 9, animation: 'card-in 0.16s ease' }}>
              <Field label={t('lbl_driver')} value={vehicle.driver} />
              <Field label={t('lbl_location')} value={vehicle.location} small />
              <FuelGauge level={vehicle.fuelLevel} showLabel />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <Field label={t('lbl_duration')} value={vehicle.tripDuration} />
                <Field label={t('lbl_started')} value={vehicle.tripStart} />
                <Field label={t('lbl_odometer')} value={`${vehicle.odometer.toLocaleString()} km`} mono />
                <Field label={t('lbl_last_update')} value={vehicle.lastUpdate} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Field({ label, value, small, mono }: { label: string; value: string; small?: boolean; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: small ? 11.5 : 13, fontWeight: 500, color: 'var(--foreground)', lineHeight: 1.35, fontFamily: mono ? 'var(--font-mono)' : 'inherit' }}>
        {value}
      </div>
    </div>
  )
}
