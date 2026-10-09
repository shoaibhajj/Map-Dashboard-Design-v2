import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Vehicle } from '../data/vehicles'
import { defaultFilter, FleetFilter } from '../types'
import { TranslationKey } from '../i18n/strings'
import { useLanguage } from '../contexts/LanguageContext'
import { formatTelemetryTimestamp } from '../utils/formatTelemetryTimestamp'

interface Props {
  vehicles: Vehicle[]
  filter: FleetFilter
  onFilterChange: (filter: FleetFilter) => void
  onVehicleSelect: (v: Vehicle) => void
  onAddVehicle: () => void
  onClose: () => void
  compact: boolean
  onToggleCompact: () => void
}

type FilterStatus = 'all' | 'moving' | 'idle' | 'offline'
type GroupBy = 'status' | 'driver' | 'zone' | 'type' | 'selection'
type IndicatorStyle = 'uniform' | 'symbols'
type IconName = 'search' | 'plus' | 'refresh' | 'filter' | 'chevron' | 'close' | 'collapse' | 'expand' | 'pin' | 'copy' | 'appearance' | 'vehicle' | 'transmitter' | 'satellite' | 'battery' | 'guard' | 'wasl' | 'camera' | 'weight' | 'speed' | 'truck' | 'van' | 'car' | 'motorcycle'
type HealthTone = 'good' | 'warning' | 'bad' | 'muted'

const statusClass: Record<Vehicle['status'], string> = {
  moving: 'is-moving',
  idle: 'is-idle',
  offline: 'is-offline',
}

const iconPaths: Record<IconName, React.ReactNode> = {
  search: <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.2 4.2"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  refresh: <><path d="M20 7v5h-5"/><path d="M18.3 16a7 7 0 1 1 .2-8.2L20 12"/></>,
  filter: <path d="M4 6h16l-6.3 7.2v5.2l-3.4 1.7v-6.9L4 6Z"/>,
  chevron: <path d="m8 10 4 4 4-4"/>,
  close: <path d="m7 7 10 10M17 7 7 17"/>,
  collapse: <><path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5"/><path d="M8 8 4 4m12 4 4-4M8 16l-4 4m12-4 4 4"/></>,
  expand: <><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/><path d="m3 3 5 5m13-5-5 5M3 21l5-5m13 5-5-5"/></>,
  pin: <><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></>,
  copy: <><rect x="8" y="8" width="10" height="11" rx="2"/><path d="M15 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
  appearance: <><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 15h2M14 15h2"/><circle cx="6" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="6" cy="15" r="1" fill="currentColor" stroke="none"/></>,
  vehicle: <><path d="m5 11 2-4h10l2 4 2 2v4H3v-4l2-2Z"/><path d="M7 11h10M6 14h.01M18 14h.01"/><path d="M6 17v2M18 17v2"/></>,
  transmitter: <><path d="M12 8v12M9 20h6M10 12h4M8 16h8"/><circle cx="12" cy="6" r="1.5"/><path d="M7.5 3.5a6.4 6.4 0 0 0 0 5M16.5 3.5a6.4 6.4 0 0 1 0 5M4.5 1a10 10 0 0 0 0 10M19.5 1a10 10 0 0 1 0 10"/></>,
  satellite: <><path d="m4 16 5-5 5 5-5 5-5-5ZM14 6l5-4 4 5-5 5-4-6Z"/><path d="M15 18a5 5 0 0 0 5-5M15 22a9 9 0 0 0 9-9"/></>,
  battery: <><rect x="3" y="6" width="17" height="12" rx="2"/><path d="M20 10h2v4h-2"/></>,
  guard: <><path d="M8 7h8l1-3-5-2-5 2 1 3Z"/><circle cx="12" cy="10" r="3"/><path d="M6 21v-2a6 6 0 0 1 12 0v2M9 7h6"/></>,
  wasl: <><path d="M10 13a4 4 0 0 0 5.7 0l2.1-2.1a4 4 0 0 0-5.7-5.7L11 6.3"/><path d="M14 11a4 4 0 0 0-5.7 0l-2.1 2.1a4 4 0 0 0 5.7 5.7l1.1-1.1"/></>,
  camera: <><path d="M4 8h4l1.5-2h5L16 8h4v11H4V8Z"/><circle cx="12" cy="13" r="3"/></>,
  weight: <><path d="M12 3v17M6 21h12M4 7h16M5 7l-3 8m3-8 3 8m11-8-3 8m3-8 3 8"/><path d="M2 15a3.5 3.5 0 0 0 7 0Zm13 0a3.5 3.5 0 0 0 7 0Z"/></>,
  speed: <><path d="M4 17a8 8 0 1 1 16 0"/><path d="m12 13 4-4"/><circle cx="12" cy="13" r="1"/></>,
  truck: <><path d="M3 7h11v10H3V7ZM14 10h4l3 3v4h-7v-7Z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></>,
  van: <><path d="M4 7h11l4 5v5H4V7Z"/><path d="M15 8v4h4"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/></>,
  car: <><path d="m5 11 2-4h10l2 4 2 2v4H3v-4l2-2Z"/><path d="M7 11h10"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></>,
  motorcycle: <><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="m6 17 4-7h4l4 7M9 17h5l-3-7M14 7h3"/></>,
}

function Icon({ name, size = 18, filled = false }: { name: IconName; size?: number; filled?: boolean }) {
  return (
    <svg className="fleet-icon" width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name]}
    </svg>
  )
}

function StatusTip({ className, label, detail, children }: {
  className: string
  label: string
  detail: string | string[]
  children: React.ReactNode
}) {
  const anchorRef = useRef<HTMLSpanElement>(null)
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)
  const detailLines = Array.isArray(detail) ? detail : [detail]
  const show = () => {
    const rect = anchorRef.current?.getBoundingClientRect()
    if (!rect) return
    const halfWidth = 110
    setPosition({
      left: Math.max(halfWidth + 8, Math.min(window.innerWidth - halfWidth - 8, rect.left + rect.width / 2)),
      top: rect.top - 8,
    })
  }
  return (
    <span ref={anchorRef} className={className} tabIndex={0} aria-label={`${label}: ${detailLines.join('. ')}`} onMouseEnter={show} onMouseLeave={() => setPosition(null)} onFocus={show} onBlur={() => setPosition(null)}>
      {children}
      {position && createPortal(
        <span className="floating-status-tooltip" role="tooltip" style={{ left: position.left, top: position.top }}>
          <strong>{label}</strong>
          <span className="floating-status-tooltip-details">
            {detailLines.map((line, index) => <span key={`${index}-${line}`}>{line}</span>)}
          </span>
        </span>,
        document.body,
      )}
    </span>
  )
}

function TooltipIcon({ tone, label, detail, icon, indicatorStyle }: { tone: HealthTone; label: string; detail: string; icon: IconName; indicatorStyle: IndicatorStyle }) {
  return (
    <StatusTip className={`health-icon health-${tone}`} label={label} detail={detail}>
      {indicatorStyle === 'uniform' ? <span className="health-marker" aria-hidden="true" /> : <Icon name={icon} size={17} />}
    </StatusTip>
  )
}

function VehicleStateStatus({ towing, tone, label, detail, indicatorStyle }: { towing: boolean; tone: HealthTone; label: string; detail: string; indicatorStyle: IndicatorStyle }) {
  return <StatusTip className={`health-icon health-${tone}`} label={label} detail={detail}>
    {indicatorStyle === 'uniform' ? <span className="health-marker" aria-hidden="true" /> : towing ? <svg className="tow-indicator" viewBox="0 0 52 38" aria-hidden="true">
      <path d="M2 17h17v12H2V17Zm2-8h10l5 8H2l2-8Z" fill="currentColor" />
      <circle cx="7" cy="31" r="4" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="m17 16 14-12 2 3-12 11v7h-4v-9Z" fill="currentColor" />
      <path d="m30 21 3-7h10l4 7 3 2v6H27v-6l3-2Zm4-4-1.5 4h12L42 17h-8Z" fill="currentColor" />
      <circle cx="33" cy="30" r="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="45" cy="30" r="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg> : <Icon name="vehicle" size={17} />}
  </StatusTip>
}

function BatteryStatus({ vehicle, indicatorStyle }: { vehicle: Vehicle; indicatorStyle: IndicatorStyle }) {
  const { t } = useLanguage()
  const level = vehicle.telemetry.batteryPercent
  const segments = level === null ? 0 : Math.ceil(level / 20)
  const tone: HealthTone = level === null ? 'muted' : level <= 20 ? 'bad' : level <= 60 ? 'warning' : 'good'
  const voltage = vehicle.telemetry.batteryVoltage
  const detail = level === null ? t('telemetry_unavailable') : `${level}% (${segments}/5 ${t('battery_bars')})${voltage === null ? '' : ` · ${voltage.toFixed(1)}V`}`
  if (indicatorStyle === 'uniform') return <TooltipIcon tone={tone} label={t('icon_battery')} detail={detail} icon="battery" indicatorStyle={indicatorStyle} />
  return <StatusTip className={`health-icon dynamic-battery health-${tone}`} label={t('icon_battery')} detail={detail}>
    <svg viewBox="0 0 34 22" aria-hidden="true">
      <rect x="1.5" y="2" width="28" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M30 8h3v6h-3" fill="currentColor" />
      {[0, 1, 2, 3, 4].map(index => <rect key={index} x={4 + index * 5} y="5" width="3.5" height="12" rx="1" fill="currentColor" opacity={index < segments ? 1 : .14} />)}
    </svg>
  </StatusTip>
}

function GnssStatus({ vehicle, indicatorStyle }: { vehicle: Vehicle; indicatorStyle: IndicatorStyle }) {
  const { t } = useLanguage()
  const count = vehicle.telemetry.satellites
  const tone: HealthTone = count === 0 ? 'muted' : count <= 3 ? 'bad' : count <= 6 ? 'warning' : 'good'
  const detail = `${count} ${t('telemetry_satellites')} · ${count > 0 ? t('satellites_connected') : t('telemetry_not_connected')}`
  if (indicatorStyle === 'uniform') return <TooltipIcon tone={tone} label={t('icon_satellites')} detail={detail} icon="satellite" indicatorStyle={indicatorStyle} />
  return <StatusTip className={`health-icon gnss-strength health-${tone}`} label={t('icon_satellites')} detail={detail}>
    <Icon name="satellite" size={16} /><b>{count}<small>sat</small></b>
  </StatusTip>
}

function timestampDetail(timestamp: string | null | undefined, lang: 'en' | 'ar', now: number, t: (key: TranslationKey) => string): string[] {
  const formatted = formatTelemetryTimestamp(timestamp, lang, now, t('just_now'))
  if (!formatted) return [`${t('value_last_updated')}: ${t('update_time_unavailable')}`]
  return [`${t('value_last_updated')}: ${formatted.absolute}`, formatted.relative]
}

function WeightStatus({ vehicle, now }: { vehicle: Vehicle; now: number }) {
  const { t, lang } = useLanguage()
  const actual = vehicle.telemetry.actualWeightTons
  const limit = vehicle.telemetry.weightLimitTons
  const ratio = actual !== null && limit !== null ? actual / limit : null
  const tone: HealthTone = ratio === null ? 'muted' : ratio > 1 ? 'bad' : ratio >= .9 ? 'warning' : 'good'
  const weightDetail = actual === null || limit === null ? t('telemetry_unavailable') : `${actual.toFixed(1)}t / ${limit.toFixed(1)}t ${t('weight_allowed')}`
  const detail = [weightDetail, ...timestampDetail(vehicle.telemetry.weightUpdatedAt, lang, now, t)]
  const displayValue = actual === null ? 'N/A' : `${actual.toFixed(1)}t`
  return (
    <StatusTip className={`weight-indicator health-${tone}`} label={t('icon_weight')} detail={detail}>
      <strong>{displayValue}</strong>
    </StatusTip>
  )
}

function toggleValue<T extends string>(values: T[], value: T) {
  return values.includes(value) ? values.filter(item => item !== value) : [...values, value]
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="fleet-filter-section"><strong>{label}</strong>{children}</div>
}

function FilterChips<T extends string>({ options, selected, onToggle }: {
  options: { value: T; label: string; dot?: string }[]
  selected: T[]
  onToggle: (value: T) => void
}) {
  return (
    <div className="fleet-filter-chips">
      {options.map(option => (
        <button key={option.value} className={selected.includes(option.value) ? 'is-active' : ''} onClick={() => onToggle(option.value)}>
          {option.dot && <span className={`status-dot ${option.dot}`} />}
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default function VehicleListPanel({ vehicles, filter, onFilterChange, onVehicleSelect, onAddVehicle, onClose, compact, onToggleCompact }: Props) {
  const { t, isRTL } = useLanguage()
  const [now, setNow] = useState(() => Date.now())
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [groupBy, setGroupBy] = useState<GroupBy>('status')
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['moving', 'idle', 'offline']))
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['v001']))
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [localFilter, setLocalFilter] = useState<FleetFilter>(filter)
  const [refreshing, setRefreshing] = useState(false)
  const [notice, setNotice] = useState('')
  const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle>(() => {
    try { return window.localStorage.getItem('fleet-vehicle-indicator-style') === 'symbols' ? 'symbols' : 'uniform' }
    catch { return 'uniform' }
  })
  const [indicatorStyleOpen, setIndicatorStyleOpen] = useState(false)

  useEffect(() => setLocalFilter(filter), [filter])
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    try { window.localStorage.setItem('fleet-vehicle-indicator-style', indicatorStyle) }
    catch { /* Keep the selected style for this session if storage is unavailable. */ }
  }, [indicatorStyle])

  const filtered = useMemo(() => vehicles.filter(v => {
    const q = query.toLowerCase()
    const matchesQuery = !q || v.name.toLowerCase().includes(q) || v.plate.toLowerCase().includes(q) || v.driver.toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter
    const matchesGlobal = (filter.statuses.length === 0 || filter.statuses.includes(v.status))
      && (filter.types.length === 0 || filter.types.includes(v.vehicleType))
      && (filter.zones.length === 0 || filter.zones.includes(v.zone))
      && v.fuelLevel >= filter.minFuel
      && (filter.driversOnly === 'all'
        || (filter.driversOnly === 'assigned' && v.driver !== 'Unassigned')
        || (filter.driversOnly === 'unassigned' && v.driver === 'Unassigned'))
    return matchesQuery && matchesStatus && matchesGlobal
  }), [vehicles, filter, query, statusFilter])

  const groups = useMemo(() => {
    const buckets = new Map<string, Vehicle[]>()
    filtered.forEach(vehicle => {
      let key: string = vehicle.status
      if (groupBy === 'driver') key = vehicle.driver
      if (groupBy === 'zone') key = vehicle.zone
      if (groupBy === 'type') key = vehicle.vehicleType
      if (groupBy === 'selection') key = selectedIds.has(vehicle.id) ? 'selected' : 'other'
      buckets.set(key, [...(buckets.get(key) || []), vehicle])
    })
    const statusOrder = ['moving', 'idle', 'offline']
    return [...buckets.entries()].sort(([a], [b]) => groupBy === 'status' ? statusOrder.indexOf(a) - statusOrder.indexOf(b) : a.localeCompare(b))
  }, [filtered, groupBy, selectedIds])

  const toggleGroup = (key: string) => setOpenGroups(current => {
    const next = new Set(current)
    next.has(key) ? next.delete(key) : next.add(key)
    return next
  })

  const toggleSelected = (id: string) => setSelectedIds(current => {
    const next = new Set(current)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const groupLabel = (key: string) => {
    const labels: Record<string, string> = {
      moving: t('status_moving'), idle: t('status_idle'), offline: t('status_offline'),
      selected: t('group_selected'), other: t('group_other'),
      van: t('type_van'), truck: t('type_truck'), car: t('type_car'), motorcycle: t('type_motorcycle'),
    }
    return labels[key] || key
  }

  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2200)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    showNotice(t('fleet_refreshed'))
    window.setTimeout(() => setRefreshing(false), 650)
  }

  const statusTabs: { status: FilterStatus; label: TranslationKey }[] = [
    { status: 'all', label: 'filter_all' },
    { status: 'moving', label: 'filter_moving' },
    { status: 'idle', label: 'filter_idle' },
    { status: 'offline', label: 'filter_offline' },
  ]
  const allVisibleSelected = filtered.length > 0 && filtered.every(vehicle => selectedIds.has(vehicle.id))
  const toggleAllVisible = () => setSelectedIds(current => {
    const next = new Set(current)
    filtered.forEach(vehicle => allVisibleSelected ? next.delete(vehicle.id) : next.add(vehicle.id))
    return next
  })
  const changeGroupBy = (value: GroupBy) => {
    setGroupBy(value)
    setOpenGroups(new Set(value === 'status' ? ['moving', 'idle', 'offline'] : vehicles.map(vehicle => value === 'driver' ? vehicle.driver : value === 'zone' ? vehicle.zone : value === 'type' ? vehicle.vehicleType : selectedIds.has(vehicle.id) ? 'selected' : 'other')))
  }
  const filterFlyout = filtersOpen ? createPortal(
    <aside className={`fleet-filter-flyout${compact ? ' is-panel-compact' : ''}`} dir={isRTL ? 'rtl' : 'ltr'} aria-label={t('filter_title')}>
      <div className="fleet-filter-flyout-header">
        <div><Icon name="filter" size={18} /><strong>{t('filter_title')}</strong></div>
        <button onClick={() => setFiltersOpen(false)} aria-label={t('ctrl_close')} title={t('ctrl_close')}><Icon name="close" size={16} /></button>
      </div>
      <div className="fleet-filter-panel">
        <FilterSection label={t('group_by')}>
          <label className="fleet-select filter-group-select">
            <select value={groupBy} onChange={event => changeGroupBy(event.target.value as GroupBy)}>
              <option value="status">{t('filter_status')}</option>
              <option value="driver">{t('lbl_driver')}</option>
              <option value="zone">{t('group_zone')}</option>
              <option value="type">{t('filter_vehicle_type')}</option>
              <option value="selection">{t('group_custom_selection')}</option>
            </select>
            <Icon name="chevron" size={16} />
          </label>
        </FilterSection>
        <FilterSection label={t('filter_status')}>
          <FilterChips options={[
            { value: 'moving', label: t('status_moving'), dot: 'is-moving' },
            { value: 'idle', label: t('status_idle'), dot: 'is-idle' },
            { value: 'offline', label: t('status_offline'), dot: 'is-offline' },
          ]} selected={localFilter.statuses} onToggle={value => setLocalFilter(current => ({ ...current, statuses: toggleValue(current.statuses, value) }))} />
        </FilterSection>
        <FilterSection label={t('filter_fuel_level')}>
          <div className="filter-range"><input type="range" min="0" max="80" step="10" value={localFilter.minFuel} onChange={event => setLocalFilter(current => ({ ...current, minFuel: Number(event.target.value) }))} /><b>{localFilter.minFuel}%+</b></div>
        </FilterSection>
        <FilterSection label={t('filter_driver')}>
          <div className="filter-segmented">
            {(['all', 'assigned', 'unassigned'] as const).map(value => <button key={value} className={localFilter.driversOnly === value ? 'is-active' : ''} onClick={() => setLocalFilter(current => ({ ...current, driversOnly: value }))}>{value === 'all' ? t('filter_any') : value === 'assigned' ? t('filter_assigned') : t('filter_unassigned')}</button>)}
          </div>
        </FilterSection>
        <div className="filter-actions">
          <button onClick={() => setLocalFilter(defaultFilter)}>{t('filter_reset')}</button>
          <button onClick={() => { onFilterChange(localFilter); setFiltersOpen(false) }}>{t('filter_apply')}</button>
        </div>
      </div>
    </aside>,
    document.body,
  ) : null

  return (
    <>
    <section className="fleet-panel" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="fleet-panel-header">
        <div className="fleet-command-row">
          <label className="fleet-search">
            <Icon name="search" size={17} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('search_name_plate')} aria-label={t('search_placeholder')} />
            {query && <button onClick={() => setQuery('')} aria-label={t('clear_search')}><Icon name="close" size={14} /></button>}
          </label>
          <button className="fleet-primary-action" onClick={onAddVehicle}>
            <Icon name="plus" size={16} /><span>{t('add_vehicle')}</span>
          </button>
          <button className={`fleet-icon-button${refreshing ? ' is-spinning' : ''}`} onClick={handleRefresh} aria-label={t('refresh')} title={t('refresh')}><Icon name="refresh" size={16} /></button>
          <button className="fleet-icon-button fleet-panel-size-button" onClick={onToggleCompact} aria-label={compact ? t('panel_expand') : t('panel_compact')} title={compact ? t('panel_expand') : t('panel_compact')}><Icon name={compact ? 'expand' : 'collapse'} size={16} /></button>
          <button className="fleet-icon-button" onClick={onClose} aria-label={t('ctrl_close')} title={t('ctrl_close')}><Icon name="close" size={16} /></button>
        </div>

        <div className="fleet-status-row">
          <div className="fleet-tabs" role="tablist" aria-label={t('filter_status')}>
            {statusTabs.map(tab => {
              const count = tab.status === 'all' ? vehicles.length : vehicles.filter(v => v.status === tab.status).length
              return (
                <button key={tab.status} role="tab" aria-selected={statusFilter === tab.status} className={statusFilter === tab.status ? 'is-active' : ''} onClick={() => {
                  setStatusFilter(tab.status)
                  if (tab.status === 'all') toggleAllVisible()
                }}>
                  {tab.status === 'all'
                    ? <span className={`tab-check${allVisibleSelected ? ' is-checked' : ''}`} aria-hidden="true">{allVisibleSelected ? '✓' : ''}</span>
                    : <span className={`status-dot ${statusClass[tab.status]}`} />}
                  {t(tab.label)} <span>{count}</span>
                </button>
              )
            })}
          </div>
          <button className={`fleet-filter-button${filtersOpen ? ' is-active' : ''}`} onClick={() => setFiltersOpen(value => !value)}>
            <Icon name="filter" size={18} /><span>{t('filter_btn')}</span>{(filter.statuses.length + filter.types.length + filter.zones.length + (filter.minFuel > 0 ? 1 : 0) + (filter.driversOnly !== 'all' ? 1 : 0)) > 0 && <span className="filter-active-dot" />}
          </button>
          <div className="indicator-style-control">
            <button className={`fleet-icon-button${indicatorStyleOpen ? ' is-active' : ''}`} onClick={() => setIndicatorStyleOpen(open => !open)} aria-label={t('vehicle_indicator_style')} title={t('vehicle_indicator_style')} aria-expanded={indicatorStyleOpen}>
              <Icon name="appearance" size={17} />
            </button>
            {indicatorStyleOpen && <div className="indicator-style-menu" role="group" aria-label={t('vehicle_indicator_style')}>
              {(['uniform', 'symbols'] as const).map(style => <button key={style} className={indicatorStyle === style ? 'is-selected' : ''} onClick={() => { setIndicatorStyle(style); setIndicatorStyleOpen(false) }}>
                <span className={`indicator-style-preview ${style}`} aria-hidden="true">{style === 'uniform' ? <i /> : <><i /><b /><em /></>}</span>
                <span>{style === 'uniform' ? t('indicator_uniform') : t('indicator_symbols')}</span>
                {indicatorStyle === style && <span className="indicator-style-check" aria-hidden="true">✓</span>}
              </button>)}
            </div>}
          </div>
        </div>

        {notice && <div className="fleet-notice" role="status">{notice}</div>}
      </div>

      <div className="fleet-list">
        <div className="vehicle-metrics-header" aria-label="Vehicle metrics">
          <span className="metric-header-spacer" aria-hidden="true" />
          <span className="metric-header-spacer" aria-hidden="true" />
          <span className="metric-header-icon" title={t('lbl_speed')} aria-label={t('lbl_speed')}><Icon name="speed" size={20}/></span>
          <span className="metric-header-icon" title={t('icon_weight')} aria-label={t('icon_weight')}><Icon name="weight" size={20}/></span>
          <div className="vehicle-health-header">
            {([
              ['vehicle', 'icon_engine'], ['transmitter', 'icon_gps'], ['battery', 'icon_battery'],
              ['satellite', 'icon_satellites'], ['guard', 'icon_authorization'], ['wasl', 'icon_wasl'], ['camera', 'icon_camera'],
            ] as const).map(([icon, label]) => <span className="metric-header-icon" key={icon} title={t(label)} aria-label={t(label)}><Icon name={icon} size={20}/></span>)}
          </div>
        </div>
        {groups.length === 0 && <div className="fleet-empty">{t('no_vehicles')}</div>}
        {groups.map(([key, groupVehicles]) => {
          const isOpen = openGroups.has(key)
          const groupStatus = key === 'moving' || key === 'idle' || key === 'offline' ? key : undefined
          return (
            <div className="fleet-group" key={key}>
              <button className={`fleet-group-header${groupStatus ? ` group-${groupStatus}` : ''}`} onClick={() => toggleGroup(key)} aria-expanded={isOpen}>
                <span className={`fleet-group-chevron${isOpen ? ' is-open' : ''}`}><Icon name="chevron" size={16} /></span>
                {groupStatus ? <span className={`status-dot ${statusClass[groupStatus]}`} /> : <span className="group-marker" />}
                <strong>{groupLabel(key)}</strong>
                <span>{groupVehicles.length}</span>
                {groupStatus === 'moving' && <small>{t('fleet_live_tracking')}</small>}
              </button>
              {isOpen && <div className="fleet-group-cards">
                {groupVehicles.map(vehicle => (
                  <VehicleStatusCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    now={now}
                    indicatorStyle={indicatorStyle}
                    selected={selectedIds.has(vehicle.id)}
                    onSelect={() => onVehicleSelect(vehicle)}
                    onToggleSelected={() => toggleSelected(vehicle.id)}
                    onCopy={() => {
                      navigator.clipboard?.writeText(vehicle.location)
                      showNotice(t('location_copied'))
                    }}
                  />
                ))}
              </div>}
            </div>
          )
        })}
      </div>
    </section>
    {filterFlyout}
    </>
  )
}

function VehicleStatusCard({ vehicle, now, selected, indicatorStyle, onSelect, onToggleSelected, onCopy }: {
  vehicle: Vehicle
  now: number
  selected: boolean
  indicatorStyle: IndicatorStyle
  onSelect: () => void
  onToggleSelected: () => void
  onCopy: () => void
}) {
  const { t, lang } = useLanguage()
  const violation = vehicle.speed > 75
  const telemetry = vehicle.telemetry
  const vehicleTone: HealthTone = telemetry.towing ? 'warning' : vehicle.status === 'moving' ? 'good' : vehicle.status === 'idle' ? 'bad' : 'muted'
  const vehicleDetail = telemetry.towing ? t('telemetry_towed') : vehicle.status === 'moving' ? t('telemetry_running') : vehicle.status === 'idle' ? t('telemetry_stopped') : t('telemetry_unavailable')
  const gpsTone: HealthTone = telemetry.gpsState === 'online' ? 'good' : telemetry.gpsState === 'weak' ? 'warning' : telemetry.gpsState === 'offline' ? 'bad' : 'muted'
  const gpsDetail = `${telemetry.gpsState === 'online' ? t('gps_online') : telemetry.gpsState === 'weak' ? t('gps_weak') : telemetry.gpsState === 'offline' ? t('telemetry_no_signal') : t('telemetry_not_installed')} · ${t('last_signal')} ${vehicle.lastUpdate}`
  const driverTone: HealthTone = telemetry.driverAuthorization === 'authorized' ? 'good' : telemetry.driverAuthorization === 'unauthorized' ? 'bad' : 'muted'
  const driverDetail = telemetry.driverAuthorization === 'authorized' ? `${t('telemetry_authorized')} · ${vehicle.driver}` : telemetry.driverAuthorization === 'unauthorized' ? t('telemetry_unauthorized') : t('telemetry_no_driver')
  const waslTone: HealthTone = telemetry.waslState === 'connected' ? 'good' : telemetry.waslState === 'not_connected' ? 'bad' : 'muted'
  const waslStatusDetail = telemetry.waslState === 'connected' ? t('telemetry_compliant') : telemetry.waslState === 'not_connected' ? t('telemetry_not_connected') : t('telemetry_not_registered')
  const waslDetail = [waslStatusDetail, ...timestampDetail(telemetry.waslUpdatedAt, lang, now, t)]
  const cameraTone: HealthTone = telemetry.cameraState === 'working' ? 'good' : telemetry.cameraState === 'not_working' ? 'bad' : 'muted'
  const cameraDetail = telemetry.cameraState === 'working' ? t('telemetry_working') : telemetry.cameraState === 'not_working' ? t('telemetry_not_working') : t('telemetry_not_installed')

  return (
    <article
      className={`vehicle-card ${statusClass[vehicle.status]}${selected ? ' is-selected' : ''}`}
      onClick={onSelect}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${vehicle.name}, ${vehicle.plate}, ${vehicle.lastUpdate}`}
    >
      <div className="vehicle-card-main">
        <input
          className="vehicle-select-check"
          type="checkbox"
          checked={selected}
          onClick={event => event.stopPropagation()}
          onKeyDown={event => event.stopPropagation()}
          onChange={onToggleSelected}
          aria-label={`${t('toggle_selection')}: ${vehicle.name}`}
        />
        <div className="vehicle-identity">
          <div className="vehicle-name-line">
            <span className={`status-dot ${statusClass[vehicle.status]}`} />
            <strong>{vehicle.name}</strong>
            <time>{vehicle.lastUpdate}</time>
          </div>
          <button className="compact-location-copy" onClick={event => { event.stopPropagation(); onCopy() }} title={t('copy_location')} aria-label={`${t('copy_location')}: ${vehicle.location}`}>
            <Icon name="pin" size={12} /><span>{vehicle.location}</span><Icon name="copy" size={11} />
          </button>
        </div>
        <StatusTip className="speed-condition" label={t('lbl_speed')} detail={`${vehicle.speed} ${t('kmh')} · ${violation ? t('speed_condition_violation') : t('speed_condition_normal')}`}>
          <div className={`speed-sign${violation ? ' is-violation' : ''}`} aria-label={`${vehicle.speed} ${t('kmh')}${violation ? `, ${t('speed_violation')}` : ''}`}>
            <div><strong>{vehicle.speed}</strong><span>{t('kmh')}</span></div>
          </div>
        </StatusTip>
        <WeightStatus vehicle={vehicle} now={now} />
        <div className="vehicle-health-row">
          <VehicleStateStatus towing={telemetry.towing} tone={vehicleTone} label={t('icon_engine')} detail={vehicleDetail} indicatorStyle={indicatorStyle} />
          <TooltipIcon tone={gpsTone} label={t('icon_gps')} detail={gpsDetail} icon="transmitter" indicatorStyle={indicatorStyle} />
          <BatteryStatus vehicle={vehicle} indicatorStyle={indicatorStyle} />
          <GnssStatus vehicle={vehicle} indicatorStyle={indicatorStyle} />
          <TooltipIcon tone={driverTone} label={t('icon_authorization')} detail={driverDetail} icon="guard" indicatorStyle={indicatorStyle} />
          <TooltipIcon tone={waslTone} label={t('icon_wasl')} detail={waslDetail} icon="wasl" indicatorStyle={indicatorStyle} />
          <TooltipIcon tone={cameraTone} label={t('icon_camera')} detail={cameraDetail} icon="camera" indicatorStyle={indicatorStyle} />
        </div>
      </div>
    </article>
  )
}
