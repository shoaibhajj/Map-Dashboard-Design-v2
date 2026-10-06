import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Vehicle } from '../data/vehicles'
import { useLanguage } from '../contexts/LanguageContext'
// The artwork is optional: a checkout without the Git LFS object can still build.
const fleetTruckImage = Object.values(import.meta.glob('../assets/fleet-truck.png', {
  eager: true,
  query: '?url',
  import: 'default',
}))[0] as string | undefined

type CardId = 'overview' | 'trip' | 'location' | 'activity' | 'camera' | 'gps'
type IconName = 'grip' | 'edit' | 'focus' | 'share' | 'close' | 'trip' | 'clock' | 'driver' | 'phone' | 'pin' | 'copy' | 'flag' | 'activity' | 'camera' | 'gps' | 'battery' | 'satellite' | 'report' | 'plate' | 'id' | 'engine' | 'link' | 'route' | 'speed' | 'fuel' | 'pause' | 'chevron'

interface Props {
  vehicle: Vehicle
  onClose: () => void
  onFocus: () => void
  onShowTrip: () => void
  onUpdate: (vehicle: Vehicle) => void
}

const iconPaths: Record<IconName, React.ReactNode> = {
  grip: <><circle cx="8" cy="6" r="1" fill="currentColor"/><circle cx="16" cy="6" r="1" fill="currentColor"/><circle cx="8" cy="12" r="1" fill="currentColor"/><circle cx="16" cy="12" r="1" fill="currentColor"/><circle cx="8" cy="18" r="1" fill="currentColor"/><circle cx="16" cy="18" r="1" fill="currentColor"/></>,
  edit: <><path d="m4 20 4-1 11-11-3-3L5 16l-1 4Z"/><path d="m14 7 3 3"/></>,
  focus: <><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/><circle cx="12" cy="12" r="3"/></>,
  share: <><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/></>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  trip: <><path d="M4 18V7h12l4 4v7H4Z"/><circle cx="8" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M16 8v4h4"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></>,
  driver: <><circle cx="12" cy="8" r="3"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></>,
  phone: <path d="M7 3h3l1 5-2 1c1 3 3 5 6 6l1-2 5 1v3c0 2-2 4-4 4C9 20 4 15 3 7c0-2 2-4 4-4Z"/>,
  pin: <><path d="M12 21s6-5 6-11a6 6 0 1 0-12 0c0 6 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></>,
  copy: <><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/></>,
  flag: <><path d="M5 21V4"/><path d="M5 5h11l-2 4 2 4H5"/></>,
  activity: <path d="M3 20V10M9 20V4M15 20v-7M21 20V7"/>,
  camera: <><path d="M4 8h4l2-2h5l2 2h3v11H4V8Z"/><circle cx="12" cy="13" r="3"/></>,
  gps: <><path d="M12 8v12M9 20h6M10 12h4M8 16h8"/><circle cx="12" cy="6" r="1.5"/><path d="M7 3a7 7 0 0 0 0 6M17 3a7 7 0 0 1 0 6"/></>,
  battery: <><rect x="3" y="7" width="16" height="11" rx="2"/><path d="M19 11h2v3h-2"/></>,
  satellite: <><path d="m4 16 5-5 5 5-5 5-5-5ZM14 6l5-4 4 5-5 5-4-6Z"/><path d="M15 18a5 5 0 0 0 5-5M15 22a9 9 0 0 0 9-9"/></>,
  report: <><path d="M4 20V4h16v16H4Z"/><path d="M8 16v-4M12 16V8M16 16v-6"/></>,
  plate: <><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="7" cy="10" r="1"/><circle cx="17" cy="10" r="1"/><path d="M8 15h8"/></>,
  id: <><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="10" r="2"/><path d="M5 16c.5-2 1.5-3 3-3s2.5 1 3 3M14 9h4M14 13h4"/></>,
  engine: <><path d="M7 8h9l3 3v6H7l-2-3H3v-4h3l1-2Z"/><path d="M10 8V5h4v3M19 12h2v4h-2"/></>,
  link: <><path d="M10 13a4 4 0 0 0 5.7 0l2.1-2.1a4 4 0 0 0-5.7-5.7L11 6.3"/><path d="M14 11a4 4 0 0 0-5.7 0l-2.1 2.1a4 4 0 0 0 5.7 5.7l1.1-1.1"/></>,
  route: <><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18c6 0 2-12 8-12"/></>,
  speed: <><path d="M4 16a8 8 0 1 1 16 0"/><path d="m12 14 4-4"/><circle cx="12" cy="14" r="1"/></>,
  fuel: <><path d="M5 21V4h9v17M5 10h9M14 7h2l3 3v8a2 2 0 0 0 2 2"/></>,
  pause: <><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>,
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>
}

function VehicleImage({ alt = '', className, iconSize = 44 }: { alt?: string; className: string; iconSize?: number }) {
  const [unavailable, setUnavailable] = useState(!fleetTruckImage)
  if (unavailable || !fleetTruckImage) {
    return <div className={`${className} vehicle-image-fallback`} role="img" aria-label={alt || 'Vehicle image unavailable'}><Icon name="trip" size={iconSize}/></div>
  }
  return <img className={className} src={fleetTruckImage} alt={alt} onError={() => setUnavailable(true)}/>
}

function ActionButton({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return <button className="vehicle-detail-action" onClick={onClick} title={label} aria-label={label}><Icon name={icon} size={16}/></button>
}

function CardShell({ id, title, icon, children, dragging, dragHandleProps, status, actions }: {
  id: CardId
  title: string
  icon: IconName
  children: React.ReactNode
  dragging: boolean
  dragHandleProps: React.HTMLAttributes<HTMLDivElement>
  status?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <section className={`vehicle-detail-card${dragging ? ' is-dragging' : ''}`} data-card-id={id}>
      <div className={`vehicle-detail-card-header${id === 'trip' ? ' vehicle-detail-card-header-trip' : ''}`}>
        <div className="vehicle-detail-drag" {...dragHandleProps}><Icon name="grip" size={15}/></div>
        <span className="vehicle-detail-title-icon"><Icon name={icon} size={18}/></span>
        <strong>{title}</strong>
        {status}
        {actions}
      </div>
      {children}
    </section>
  )
}

export default function FloatingVehicleDetails({ vehicle, onClose, onFocus, onShowTrip, onUpdate }: Props) {
  const { t } = useLanguage()
  const [order, setOrder] = useState<CardId[]>(['overview', 'trip', 'location', 'activity', 'camera', 'gps'])
  const [dragging, setDragging] = useState<CardId | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const dragAllowed = useRef(false)

  const cards = useMemo<Record<CardId, React.ReactNode>>(() => ({
    overview: <OverviewCard vehicle={vehicle} onClose={onClose} onFocus={onFocus} onShowTrip={onShowTrip} onEdit={() => setEditOpen(true)} onDragReady={() => { dragAllowed.current = true }} />,
    trip: <TripCard vehicle={vehicle} />,
    location: <LocationCard vehicle={vehicle} onFocus={onFocus} />,
    activity: <ActivityCard />,
    camera: <CameraCard vehicle={vehicle} />,
    gps: <GpsCard vehicle={vehicle} onFocus={onFocus} />,
  }), [vehicle, onClose, onFocus, onShowTrip])

  const handleDropOver = (event: React.DragEvent, id: CardId) => {
    event.preventDefault()
    if (!dragging || dragging === id) return
    setOrder(current => {
      const next = [...current]
      const from = next.indexOf(dragging)
      const to = next.indexOf(id)
      next.splice(to, 0, next.splice(from, 1)[0])
      return next
    })
  }

  return (
    <>
      <div className="floating-vehicle-stack" aria-label={t('vehicle_control_system')}>
        {order.map(id => (
          <div
            key={id}
            draggable
            onDragStart={event => {
              if (!dragAllowed.current) { event.preventDefault(); return }
              setDragging(id)
              event.dataTransfer.effectAllowed = 'move'
            }}
            onDragOver={event => handleDropOver(event, id)}
            onDragEnd={() => { setDragging(null); dragAllowed.current = false }}
          >
            {id === 'overview' ? cards[id] : (
              <CardShell
                id={id}
                title={id === 'trip' ? (vehicle.status === 'moving' ? t('current_trip') : t('last_trip')) : id === 'location' ? t('location_card') : id === 'activity' ? t('todays_activity') : id === 'camera' ? t('camera_activity') : t('gps_device')}
                icon={id === 'trip' ? 'trip' : id === 'location' ? 'pin' : id === 'activity' ? 'activity' : id === 'camera' ? 'camera' : 'gps'}
                dragging={dragging === id}
                status={id === 'trip' ? <span className={`detail-trip-status is-${vehicle.status}`}><span />{vehicle.status === 'moving' ? t('nav_live') : t(`status_${vehicle.status}` as any)}</span> : undefined}
                actions={id === 'location' ? <div className="detail-location-header-actions"><ActionButton icon="copy" label={t('copy_location')} onClick={() => navigator.clipboard?.writeText(`${vehicle.location}\n${vehicle.lat.toFixed(4)}, ${vehicle.lng.toFixed(4)}`)}/></div> : id === 'activity' ? <button className="activity-report-button" type="button"><Icon name="report" size={15}/><span>{t('view_report')}</span><Icon name="chevron" size={14}/></button> : undefined}
                dragHandleProps={{ onMouseDown: () => { dragAllowed.current = true }, onMouseUp: () => { dragAllowed.current = false } }}
              >
                {cards[id]}
              </CardShell>
            )}
          </div>
        ))}
      </div>
      {editOpen && <EditVehicleModal vehicle={vehicle} onClose={() => setEditOpen(false)} onSave={updated => { onUpdate(updated); setEditOpen(false) }} />}
    </>
  )
}

function OverviewCard({ vehicle, onClose, onFocus, onShowTrip, onEdit, onDragReady }: { vehicle: Vehicle; onClose: () => void; onFocus: () => void; onShowTrip: () => void; onEdit: () => void; onDragReady: () => void }) {
  const { t } = useLanguage()
  const violation = vehicle.speed > 75
  const statusText = vehicle.telemetry.towing ? t('telemetry_towed') : vehicle.status === 'moving' ? t('status_moving') : vehicle.status === 'idle' ? t('telemetry_stopped') : t('status_offline')
  const initials = vehicle.driver === 'Unassigned' ? '—' : vehicle.driver.split(' ').map(part => part[0]).join('').slice(0, 2)
  const share = async () => {
    const text = `${vehicle.name} · ${vehicle.plate} · ${vehicle.location}`
    try {
      if (navigator.share) await navigator.share({ title: vehicle.name, text })
      else await navigator.clipboard?.writeText(text)
    } catch { /* Sharing can be cancelled by the user. */ }
  }
  const shareLocation = () => navigator.clipboard?.writeText(`${vehicle.location}\n${vehicle.lat}, ${vehicle.lng}`)
  const showTrip = () => {
    onShowTrip()
    document.querySelector('[data-card-id="trip"]')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
  return (
    <section className="vehicle-detail-card vehicle-overview-card premium-overview-card">
      <div className="vehicle-overview-toolbar">
        <div className="vehicle-detail-drag" onMouseDown={onDragReady}><Icon name="grip" size={15}/></div>
        <span className={`detail-status-pill is-${vehicle.status}`}><span/>{statusText}</span>
        <div className="vehicle-overview-actions">
          <ActionButton icon="edit" label={t('edit_vehicle')} onClick={onEdit}/>
          <ActionButton icon="focus" label={t('focus_map')} onClick={onFocus}/>
          <ActionButton icon="share" label={t('share_vehicle')} onClick={share}/>
          <ActionButton icon="close" label={t('ctrl_close')} onClick={onClose}/>
        </div>
      </div>
      <div className="premium-overview-main">
        <div className="premium-overview-info">
          <div className="premium-vehicle-heading"><strong>{vehicle.name}</strong></div>
          <OverviewInfo icon="plate" label={t('lbl_plate')} value={vehicle.plate}/>
          <OverviewInfo icon="id" label="Operational ID" value={`FA-${vehicle.id.replace(/\D/g, '').padStart(3, '0')}`}/>
          <div className="premium-info-row">
            <span className="premium-driver-avatar">{initials}</span>
            <div><small>{t('lbl_driver')}</small><strong>{vehicle.driver === 'Unassigned' ? t('no_driver') : vehicle.driver}</strong></div>
          </div>
        </div>
        <div className="premium-vehicle-stage">
          <VehicleImage className="premium-truck-visual" alt={`${vehicle.name} ${vehicle.vehicleType}`} iconSize={56}/>
          <div className="premium-running-module">
            <span><Icon name="trip" size={22}/></span>
            <div><strong>{statusText}</strong><small>{vehicle.status === 'moving' ? 'Since 17 minutes ago' : vehicle.lastUpdate}</small></div>
            <div className="premium-engine-hours"><Icon name="engine" size={19}/><div><small>{t('lbl_engine_hours')}</small><b>{vehicle.engineHours.toLocaleString()} {t('h')}</b></div></div>
          </div>
        </div>
      </div>
      <div className="premium-instrument-grid">
        <SpeedInstrument speed={vehicle.speed} violation={violation}/>
        <FuelInstrument level={vehicle.fuelLevel}/>
      </div>
      <div className="premium-overview-footer">
        <button onClick={share}><Icon name="share" size={16}/><span>{t('share_vehicle')}</span></button>
        <button onClick={shareLocation}><Icon name="link" size={16}/><span>{t('share_location')}</span></button>
        <button onClick={onFocus}><Icon name="focus" size={16}/><span>{t('focus_map')}</span></button>
        <button onClick={showTrip}><Icon name="route" size={16}/><span>{vehicle.status === 'moving' ? t('current_trip') : t('last_trip')}</span></button>
      </div>
    </section>
  )
}

function OverviewInfo({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return <div className="premium-info-row"><span><Icon name={icon} size={18}/></span><div><small>{label}</small><strong>{value}</strong></div></div>
}

function SpeedInstrument({ speed, violation }: { speed: number; violation: boolean }) {
  const { t } = useLanguage()
  const progress = Math.min(100, speed / 120 * 100)
  return (
    <div className="premium-instrument premium-speed-instrument">
      <div className="premium-instrument-heading"><span><Icon name="speed" size={18}/>{t('lbl_speed')}</span><small><b>80</b> {t('kmh')} limit</small></div>
      <div className={`premium-speed-dial${violation ? ' is-violation' : ''}`}>
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="46" fill="none" stroke="var(--muted)" strokeWidth="12" strokeDasharray="78 22" pathLength="100" transform="rotate(130 60 60)"/>
          <circle cx="60" cy="60" r="46" fill="none" stroke="var(--danger)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${progress * .78} 100`} pathLength="100" transform="rotate(130 60 60)"/>
        </svg>
        <strong>{speed}</strong><span>{t('kmh')}</span>
      </div>
    </div>
  )
}

function FuelInstrument({ level }: { level: number }) {
  const { t } = useLanguage()
  const percentage = Math.max(0, Math.min(100, Math.round(level)))
  const needleAngle = -90 + percentage * 1.8
  const liters = Math.round(percentage * 10)
  const marks = Array.from({ length: 11 }, (_, index) => {
    const angle = (-180 + index * 18) * Math.PI / 180
    const major = index % 5 === 0
    return {
      x1: 90 + Math.cos(angle) * (major ? 46 : 50),
      y1: 82 + Math.sin(angle) * (major ? 46 : 50),
      x2: 90 + Math.cos(angle) * 57,
      y2: 82 + Math.sin(angle) * 57,
      major,
    }
  })
  return (
    <div className="premium-instrument premium-fuel-instrument">
      <div className="premium-instrument-heading"><span><Icon name="fuel" size={18}/>{t('lbl_fuel')}</span></div>
      <div className="premium-fuel-gauge">
        <svg viewBox="0 0 180 106" aria-hidden="true">
          <defs><linearGradient id="fuel-gauge-gradient" x1="27" y1="0" x2="153" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="var(--danger)"/><stop offset="28%" stopColor="var(--warning)"/><stop offset="55%" stopColor="var(--success)"/><stop offset="100%" stopColor="var(--success)"/></linearGradient></defs>
          <path d="M27 82A63 63 0 0 1 153 82" pathLength="100" fill="none" stroke="var(--muted)" strokeWidth="9" strokeLinecap="round"/>
          <path d="M27 82A63 63 0 0 1 153 82" pathLength="100" fill="none" stroke="url(#fuel-gauge-gradient)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${percentage} 100`}/>
          {marks.map((mark, index) => <line key={index} x1={mark.x1} y1={mark.y1} x2={mark.x2} y2={mark.y2} stroke={mark.major ? 'var(--muted-foreground)' : 'var(--border)'} strokeWidth={mark.major ? 1.8 : 1.2} strokeLinecap="round"/>)}
          <line x1="90" y1="82" x2="90" y2="34" stroke="var(--foreground)" strokeWidth="3" strokeLinecap="round" transform={`rotate(${needleAngle} 90 82)`}/>
          <circle cx="90" cy="82" r="6" fill="var(--foreground)"/><circle cx="90" cy="82" r="2" fill="var(--card)"/>
          <text x="18" y="102" fill="var(--danger)" fontSize="9" fontWeight="800">E</text>
          <text x="90" y="35" textAnchor="middle" fill="var(--muted-foreground)" fontSize="8" fontWeight="700">½</text>
          <text x="156" y="102" textAnchor="end" fill="var(--success)" fontSize="9" fontWeight="800">F</text>
          <path d="M132 56v12m0-12h6a3 3 0 0 1 3 3v11m-9-2h7m2-9 3 3v8a2 2 0 0 0 2 2" fill="none" stroke="var(--muted-foreground)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="premium-fuel-reading"><strong>{percentage}%</strong><span>{liters.toLocaleString()} L / 1,000 L</span></div>
      </div>
    </div>
  )
}

function TripCard({ vehicle }: { vehicle: Vehicle }) {
  const { t } = useLanguage()
  const [profileOpen, setProfileOpen] = useState(false)
  const digits = Math.round(vehicle.odometer).toString().padStart(7, '0').split('')
  const driverInitials = vehicle.driver === 'Unassigned' ? '—' : vehicle.driver.split(' ').map(part => part[0]).join('').slice(0, 2)
  const driverName = vehicle.driver === 'Unassigned' ? t('no_driver') : vehicle.driver

  useEffect(() => {
    if (!profileOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [profileOpen])

  return (
    <>
      <div className="detail-card-body detail-trip-layout">
        <div className="detail-trip-metrics">
          <div className="detail-trip-metric detail-trip-odometer">
            <div className="detail-trip-odometer-heading"><span className="detail-trip-metric-icon"><Icon name="trip" size={18}/></span><small>{t('lbl_odometer')}</small></div>
            <div className="detail-trip-odometer-value">{digits.map((digit, index) => <span key={index}>{digit}</span>)}<b>{t('km')}</b></div>
          </div>
          <div className="detail-trip-metric detail-trip-secondary-metric">
            <span className="detail-trip-metric-icon"><Icon name="clock" size={15}/></span>
            <div className="detail-trip-metric-copy"><small>{t('running_time')}</small><strong>{vehicle.tripDuration}</strong></div>
          </div>
          <div className="detail-trip-metric detail-trip-secondary-metric">
            <span className="detail-trip-metric-icon"><Icon name="route" size={15}/></span>
            <div className="detail-trip-metric-copy"><small>{t('lbl_distance')}</small><strong>{vehicle.tripDistance.toFixed(1)} km</strong></div>
          </div>
        </div>
        <div className="detail-trip-driver-row">
          <div className="detail-trip-driver">
            <span className="detail-trip-avatar">{driverInitials}</span>
            <div><small>{t('lbl_driver')}</small><strong>{driverName}</strong></div>
          </div>
          <div className="detail-trip-phone">
            <span className="detail-trip-metric-icon"><Icon name="phone" size={15}/></span>
            <div><small>{t('driver_phone')}</small><strong>+1 415 123 4567</strong></div>
          </div>
        </div>
        <button className="detail-trip-profile-button" type="button" disabled={vehicle.driver === 'Unassigned'} draggable={false} onMouseDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); setProfileOpen(true) }}>
          <Icon name="driver" size={16}/><span>{t('view_driver_profile')}</span>
        </button>
      </div>
      {profileOpen && createPortal(
        <div className="driver-profile-overlay" role="presentation" onMouseDown={() => setProfileOpen(false)}>
          <section className="driver-profile-dialog" role="dialog" aria-modal="true" aria-labelledby="driver-profile-title" onMouseDown={event => event.stopPropagation()}>
            <header className="driver-profile-heading">
              <span className="detail-trip-avatar">{driverInitials}</span>
              <div><small>{t('lbl_driver')}</small><strong id="driver-profile-title">{driverName}</strong></div>
              <button type="button" aria-label={t('ctrl_close')} onClick={() => setProfileOpen(false)}><Icon name="close" size={17}/></button>
            </header>
            <div className="driver-profile-fields">
              <div><small>{t('driver_phone')}</small><strong>+1 415 123 4567</strong></div>
              <div><small>{t('lbl_vehicle_name')}</small><strong>{vehicle.name}</strong></div>
              <div><small>{t('lbl_plate')}</small><strong>{vehicle.plate}</strong></div>
            </div>
          </section>
        </div>,
        document.body,
      )}
    </>
  )
}

function LocationCard({ vehicle, onFocus }: { vehicle: Vehicle; onFocus: () => void }) {
  const { t } = useLanguage()
  const copyCoordinates = () => navigator.clipboard?.writeText(`${vehicle.lat.toFixed(4)}, ${vehicle.lng.toFixed(4)}`)
  const copyLocation = () => navigator.clipboard?.writeText(`${vehicle.location}\n${vehicle.lat.toFixed(4)}, ${vehicle.lng.toFixed(4)}`)
  return (
    <div className="detail-card-body detail-location-layout">
      <div className="detail-location-information">
        <div className="detail-location-field">
          <span className="detail-location-icon"><Icon name="focus" size={20}/></span>
          <div><small>{t('lbl_location')}</small><strong>{vehicle.location}</strong></div>
        </div>
        <div className="detail-location-coordinate-row">
          <span className="detail-location-icon"><Icon name="pin" size={19}/></span>
          <div><small>{t('coordinates')}</small><strong>{vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}</strong></div>
          <button type="button" onClick={copyCoordinates} title={t('copy_coordinates')} aria-label={t('copy_coordinates')}><Icon name="copy" size={16}/></button>
        </div>
        <div className="detail-location-divider"/>
        <div className="detail-location-destination">
          <span className="detail-location-destination-icon"><Icon name="flag" size={19}/></span>
          <div><small>{t('next_destination_poi')}</small><strong>Port of Oakland</strong><span>12.5 km away · ETA 25 min</span></div>
        </div>
      </div>
      <div className="detail-location-map-column">
        <div className="detail-location-map" role="img" aria-label={`${vehicle.location} route to Port of Oakland`}>
          <span className="detail-location-map-label">San Francisco</span>
          <svg viewBox="0 0 240 160" preserveAspectRatio="none" aria-hidden="true">
            <path className="detail-location-route-halo" d="M34 112 60 99 79 106 96 76 121 85 142 65 162 72 184 47 209 42"/>
            <path className="detail-location-route" d="M34 112 60 99 79 106 96 76 121 85 142 65 162 72 184 47 209 42"/>
          </svg>
          <span className="detail-location-current-marker"/>
          <span className="detail-location-destination-marker"><Icon name="flag" size={20}/></span>
          <button type="button" onClick={onFocus} title={t('focus_map')} aria-label={t('focus_map')}><Icon name="focus" size={17}/></button>
          <span className="detail-location-map-caption">Port of Oakland</span>
        </div>
        <button className="detail-location-map-button" type="button" onClick={() => window.open(`https://www.google.com/maps?q=${vehicle.lat},${vehicle.lng}`, '_blank')}>
          <Icon name="focus" size={16}/>{t('show_on_map')}
        </button>
      </div>
    </div>
  )
}

function ActivityCard() {
  const { t } = useLanguage()
  const metrics = [
    { icon: 'route' as const, tone: 'green', value: '632 km', label: t('total_distance'), trend: '12%', direction: 'up' },
    { icon: 'clock' as const, tone: 'blue', value: '8h 24m', label: t('running_time'), trend: '5%', direction: 'up' },
    { icon: 'pause' as const, tone: 'orange', value: '2h 18m', label: t('stop_time'), trend: '8%', direction: 'up' },
    { icon: 'activity' as const, tone: 'purple', value: '1h 12m', label: t('idle_time'), trend: '14%', direction: 'down' },
  ]
  const segments = [
    ['run', 18], ['idle', 1], ['run', 2], ['stop', 10], ['idle', 2], ['run', 4], ['idle', 1],
    ['stop', 1], ['run', 14], ['stop', 4], ['idle', 4], ['run', 12], ['stop', 3], ['idle', 6], ['run', 18],
  ] as const
  return (
    <div className="detail-card-body">
      <div className="activity-kpi-grid">
        {metrics.map(metric => (
          <div key={metric.label} className={`activity-kpi is-${metric.tone}`}>
            <span className="activity-kpi-icon"><Icon name={metric.icon} size={16}/></span>
            <strong>{metric.value}</strong>
            <small>{metric.label}</small>
            <span className={`activity-kpi-trend is-${metric.direction}`}><b>{metric.direction === 'up' ? '↑' : '↓'} {metric.trend}</b><small>{t('vs_yesterday')}</small></span>
          </div>
        ))}
      </div>
      <div className="activity-timeline" role="img" aria-label={t('activity_timeline')}>
        {segments.map(([type, share], index) => <span key={index} className={type} style={{ flexGrow: share }} />)}
      </div>
      <div className="activity-time-scale"><span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>24:00</span></div>
      <div className="activity-legend">
        <div className="run"><i/><div><span>{t('status_moving')}</span><strong>68% <small>(8h 24m)</small></strong></div></div>
        <div className="stop"><i/><div><span>{t('telemetry_stopped')}</span><strong>18% <small>(2h 18m)</small></strong></div></div>
        <div className="idle"><i/><div><span>{t('status_idle')}</span><strong>14% <small>(1h 12m)</small></strong></div></div>
      </div>
    </div>
  )
}

function CameraCard({ vehicle }: { vehicle: Vehicle }) {
  const { t } = useLanguage()
  const state = vehicle.telemetry.cameraState
  const stateLabel = state === 'working' ? t('telemetry_working') : state === 'not_working' ? t('telemetry_not_working') : t('telemetry_not_installed')
  const cameraCount = state === 'working' ? '2' : '0'
  return (
    <div className="detail-card-body camera-card-body">
      <div className="camera-gallery">
        <div className="camera-tile camera-tile-feature">
          <div className="camera-scene"><VehicleImage className="camera-vehicle-visual"/></div>
          <span className="camera-live-badge"><i/>{t('live')}</span>
          <button className="camera-expand-button" type="button" aria-label={t('focus_map')}><Icon name="focus" size={14}/></button>
          <span className="camera-tile-caption"><Icon name="camera" size={14}/>Camera 1 · Front View</span>
        </div>
        <div className="camera-gallery-side">
          <div className="camera-tile camera-tile-small is-rear">
            <div className="camera-scene"><VehicleImage className="camera-vehicle-visual"/></div>
            <span className="camera-tile-caption"><Icon name="camera" size={12}/>Camera 2 · Rear View</span>
          </div>
          <div className="camera-tile camera-tile-small is-side">
            <div className="camera-scene"><VehicleImage className="camera-vehicle-visual"/></div>
            <span className="camera-tile-caption"><Icon name="camera" size={12}/>Camera 3 · Side View</span>
          </div>
          <div className="camera-tile camera-tile-small camera-more-tile">
            <div className="camera-scene"><VehicleImage className="camera-vehicle-visual"/></div>
            <span className="camera-more-count">+1</span><span className="camera-more-label">{t('more_cameras')}</span>
          </div>
        </div>
      </div>
      <div className="camera-summary">
        <div className={`camera-status-banner is-${state}`}><i/><div><strong>{stateLabel}</strong><small>{state === 'working' ? t('camera_all_online') : t('camera_check_status')}</small></div><Icon name="chevron" size={16}/></div>
        <div className="camera-stat-row"><span className="camera-stat-icon"><Icon name="camera" size={18}/></span><div><strong>{cameraCount} {t('cameras')}</strong><small>{t('camera_active_total')}</small></div></div>
        <div className="camera-stat-row"><span className="camera-stat-icon"><Icon name="clock" size={18}/></span><div><small>{t('last_activity')}</small><strong>3 min ago</strong></div></div>
        <button className="camera-view-button" type="button"><Icon name="camera" size={17}/>{t('view_cameras')}<Icon name="chevron" size={15}/></button>
      </div>
    </div>
  )
}

function GpsCard({ vehicle, onFocus }: { vehicle: Vehicle; onFocus: () => void }) {
  const { t } = useLanguage()
  const telemetry = vehicle.telemetry
  const online = telemetry.gpsState === 'online'
  const deviceId = `GV300-${vehicle.id.slice(-3).padStart(3, '0')}`
  const signalLabel = online ? t('signal_strong') : t('gps_weak')
  return (
    <div className="detail-card-body gps-card-body">
      <div className="gps-main-row">
        <div className="gps-device-visual" aria-hidden="true"><span className="gps-device-cable"/><span className="gps-device-unit"><i/><b>GV300</b></span></div>
        <div className={`gps-online-card${online ? ' is-online' : telemetry.gpsState === 'weak' ? ' is-weak' : ' is-offline'}`}>
          <div><i/><strong>{online ? t('gps_online') : telemetry.gpsState === 'weak' ? t('gps_weak') : t('telemetry_not_connected')}</strong></div>
          <small>{t('last_signal')} {vehicle.lastUpdate}</small>
        </div>
        <div className="gps-device-meta">
          <div><small>{t('device_id')}</small><div className="gps-device-id"><strong>{deviceId}</strong><button type="button" onClick={() => navigator.clipboard?.writeText(deviceId)} aria-label={t('copy_device_id')}><Icon name="copy" size={14}/></button></div></div>
          <div><small>{t('device_model')}</small><strong>Queclink GV300</strong></div>
        </div>
      </div>
      <div className="gps-metrics">
        <div className="gps-metric"><span className="gps-metric-icon is-blue"><Icon name="satellite" size={20}/></span><div><strong>{telemetry.satellites}</strong><small>{t('telemetry_satellites')}</small></div><span className="gps-signal-bars" aria-hidden="true"><i/><i/><i/><i/></span></div>
        <div className="gps-metric"><span className="gps-metric-icon is-green"><Icon name="battery" size={21}/></span><div><strong>{telemetry.batteryPercent ?? 0}%</strong><small>{t('device_battery')}</small></div></div>
        <div className="gps-metric"><span className="gps-strength-bars" aria-hidden="true"><i/><i/><i/><i/></span><div><strong>{signalLabel}</strong><small>{t('signal_quality')}</small></div></div>
        <div className="gps-metric"><span className="gps-metric-icon is-blue"><Icon name="gps" size={20}/></span><div><strong>4G</strong><small>{t('network')}</small></div></div>
      </div>
      <div className="gps-footer">
        <div className="gps-last-update"><span className="gps-footer-icon is-blue"><Icon name="clock" size={19}/></span><div><small>{t('lbl_last_update')}</small><strong>{vehicle.lastUpdate}</strong></div></div>
        <button className="gps-current-location" type="button" onClick={onFocus}><span className="gps-footer-icon"><Icon name="pin" size={19}/></span><div><small>{t('lbl_location')}</small><strong>{vehicle.location}</strong></div><Icon name="chevron" size={18}/></button>
      </div>
    </div>
  )
}

function DetailMetric({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return <div className="detail-metric"><Icon name={icon} size={18}/><div><small>{label}</small><strong>{value}</strong></div></div>
}

function EditVehicleModal({ vehicle, onClose, onSave }: { vehicle: Vehicle; onClose: () => void; onSave: (vehicle: Vehicle) => void }) {
  const { t } = useLanguage()
  const [name, setName] = useState(vehicle.name)
  const [plate, setPlate] = useState(vehicle.plate)
  const [driver, setDriver] = useState(vehicle.driver === 'Unassigned' ? '' : vehicle.driver)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSave({ ...vehicle, name: name.trim(), plate: plate.trim().toUpperCase(), driver: driver.trim() || 'Unassigned' })
  }
  return (
    <div className="vehicle-edit-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <form className="vehicle-edit-modal" onSubmit={submit}>
        <div><strong>{t('edit_vehicle')}</strong><button type="button" onClick={onClose}><Icon name="close" size={16}/></button></div>
        <label>{t('lbl_vehicle_name')}<input value={name} onChange={event => setName(event.target.value)} required/></label>
        <label>{t('lbl_plate')}<input value={plate} onChange={event => setPlate(event.target.value)} required/></label>
        <label>{t('lbl_driver')}<input value={driver} onChange={event => setDriver(event.target.value)}/></label>
        <footer><button type="button" onClick={onClose}>{t('ctrl_dismiss')}</button><button type="submit">{t('save_changes')}</button></footer>
      </form>
    </div>
  )
}
