import { useState, useRef, useEffect, type CSSProperties, type MouseEvent } from 'react'
import type { Vehicle } from '../data/vehicles'
import type { VehicleClusterSlice } from '../utils/vehicleClustering'
import { Tilt } from './core/tilt'

export interface OrbitingClusterMember {
  vehicle: Vehicle
  bucketIndex: number
}

interface Props {
  count: number
  slices: VehicleClusterSlice[]
  members: OrbitingClusterMember[]
  clusterVehicles: Vehicle[]
  statusColors: Record<string, string>
  clusterLabel: string
  zoom: number
  lang: 'en' | 'ar'
  onClusterClick: () => void
  onVehicleSelect: (vehicle: Vehicle) => void
}

export function getOrbitalClusterScale(_ringCount: number, _zoom: number): number {
  return 1
}

export function getOrbitalClusterSize(_ringCount: number, _zoom: number): number {
  return 76 // 76px compact, high-precision footprint
}

type FilterKey = 'all' | 'moving' | 'idle' | 'offline' | 'towed'
type CardVariant = 'pure' | 'tinted'

function getVehicleStatusKey(v: Vehicle): 'towed' | 'moving' | 'idle' | 'offline' {
  if (v.telemetry?.towing) return 'towed'
  if (v.status === 'moving') return 'moving'
  if (v.status === 'idle') return 'idle'
  return 'offline'
}

function getStatusLabel(key: string, lang: 'en' | 'ar'): string {
  if (key === 'moving') return lang === 'ar' ? 'متحركة' : 'Moving'
  if (key === 'idle') return lang === 'ar' ? 'متوقفة' : 'Idle'
  if (key === 'offline') return lang === 'ar' ? 'غير متصلة' : 'Offline'
  if (key === 'towed') return lang === 'ar' ? 'مسحوبة' : 'Towed'
  return lang === 'ar' ? 'الكل' : 'All'
}

function getStatusIcon(key: string): string {
  if (key === 'moving') return '▶'
  if (key === 'idle') return '⏸'
  if (key === 'towed') return '⚠'
  return '✕'
}

function getStatusRgb(key: string): string {
  if (key === 'moving') return '34, 197, 94'
  if (key === 'idle') return '249, 115, 22'
  if (key === 'towed') return '234, 179, 8'
  return '100, 116, 139'
}

export default function VehicleClusterMarker({
  count,
  slices: _slices,
  members: _members,
  clusterVehicles,
  statusColors,
  clusterLabel,
  zoom: _zoom,
  lang,
  onClusterClick,
  onVehicleSelect,
}: Props) {
  const [showPopup, setShowPopup] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [cardVariant, setCardVariant] = useState<CardVariant>(() => {
    try {
      const saved = localStorage.getItem('cluster_card_variant')
      return saved === 'tinted' ? 'tinted' : 'pure'
    } catch {
      return 'pure'
    }
  })
  const [showPanelBackdrop, setShowPanelBackdrop] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cluster_list_backdrop') === 'true'
    } catch {
      return false
    }
  })

  const popupRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<number | null>(null)

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setShowPopup(true)
  }

  const handleMouseLeave = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
    }
    closeTimerRef.current = window.setTimeout(() => {
      setShowPopup(false)
      setActiveFilter('all')
    }, 240)
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  // Prevent map wheel zoom when scrolling over popup
  useEffect(() => {
    const el = popupRef.current
    if (!el || !showPopup) return
    const stopWheel = (e: WheelEvent) => {
      e.stopPropagation()
    }
    el.addEventListener('wheel', stopWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', stopWheel)
    }
  }, [showPopup])

  const toggleVariant = (variant: CardVariant, e: MouseEvent) => {
    e.stopPropagation()
    setCardVariant(variant)
    try {
      localStorage.setItem('cluster_card_variant', variant)
    } catch {
      // ignore
    }
  }

  const toggleBackdrop = (e: MouseEvent) => {
    e.stopPropagation()
    setShowPanelBackdrop(prev => {
      const next = !prev
      try {
        localStorage.setItem('cluster_list_backdrop', String(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  // 1. Group vehicles by status
  const totalCount = clusterVehicles.length || count || 1
  type StatusGroup = {
    key: FilterKey
    color: string
    rgb: string
    vehicles: Vehicle[]
    label: string
  }

  const rawGroups: StatusGroup[] = [
    {
      key: 'moving',
      color: statusColors.moving || '#22c55e',
      rgb: getStatusRgb('moving'),
      vehicles: clusterVehicles.filter(v => !v.telemetry?.towing && v.status === 'moving'),
      label: getStatusLabel('moving', lang),
    },
    {
      key: 'idle',
      color: statusColors.idle || '#f97316',
      rgb: getStatusRgb('idle'),
      vehicles: clusterVehicles.filter(v => !v.telemetry?.towing && v.status === 'idle'),
      label: getStatusLabel('idle', lang),
    },
    {
      key: 'offline',
      color: statusColors.offline || '#64748b',
      rgb: getStatusRgb('offline'),
      vehicles: clusterVehicles.filter(v => !v.telemetry?.towing && v.status === 'offline'),
      label: getStatusLabel('offline', lang),
    },
    {
      key: 'towed',
      color: statusColors.towed || '#eab308',
      rgb: getStatusRgb('towed'),
      vehicles: clusterVehicles.filter(v => Boolean(v.telemetry?.towing)),
      label: getStatusLabel('towed', lang),
    },
  ]
  const groups = rawGroups.filter(g => g.vehicles.length > 0)

  // 2. Compute Donut Arcs
  const radius = 31
  const circ = 2 * Math.PI * radius // ~194.78
  const gap = groups.length > 1 ? 3.5 : 0
  let consumedCirc = 0

  const activeGroup = groups.find(g => g.key === activeFilter)
  const displayCount = activeFilter === 'all' ? totalCount : activeGroup ? activeGroup.vehicles.length : totalCount
  const coreLabel = lang === 'ar' ? 'مركبة' : 'Vehicles'

  // 3. Filter vehicles for popup
  const visibleVehicles = activeFilter === 'all'
    ? clusterVehicles
    : clusterVehicles.filter(v => getVehicleStatusKey(v) === activeFilter)

  return (
    <div
      className="donut-cluster-marker"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="group"
      aria-label={lang === 'ar' ? `${clusterLabel}: ${totalCount} مركبة` : `${clusterLabel}: ${totalCount} vehicles`}
    >
      {/* Cluster Node (Donut Gauge) */}
      <div
        className="donut-cluster-wrapper"
        onClick={e => {
          e.stopPropagation()
          onClusterClick()
        }}
      >
        <svg className="donut-cluster-svg" viewBox="0 0 76 76" width="76" height="76">
          <circle className="donut-cluster-track" cx="38" cy="38" r={radius} />
          {groups.map(group => {
            const arcLength = (group.vehicles.length / totalCount) * circ
            const strokeLength = Math.max(0, arcLength - gap)
            const offset = -consumedCirc
            consumedCirc += arcLength
            const isActive = activeFilter === group.key

            return (
              <circle
                key={group.key}
                className={`donut-cluster-segment${isActive ? ' is-active' : ''}`}
                cx="38"
                cy="38"
                r={radius}
                stroke={group.color}
                strokeWidth={isActive ? 9.5 : 6.5}
                strokeDasharray={`${strokeLength} ${circ}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                onMouseEnter={e => {
                  e.stopPropagation()
                  setActiveFilter(group.key)
                }}
              />
            )
          })}
        </svg>

        {/* Center Core Disc */}
        <button
          type="button"
          className={`donut-core-disc${activeFilter === 'all' ? ' is-active' : ''}`}
          onMouseEnter={e => {
            e.stopPropagation()
            setActiveFilter('all')
          }}
          onClick={e => {
            e.stopPropagation()
            onClusterClick()
          }}
          aria-label={lang === 'ar' ? `تكبير ${clusterLabel}` : `Zoom into ${clusterLabel}`}
        >
          <span
            className="donut-core-count"
            style={{
              color: activeGroup ? activeGroup.color : undefined,
            }}
          >
            {displayCount}
          </span>
        </button>
      </div>

      {/* Floating Tactical Capsule Stack (Free-floating cards with 3D Tilt) */}
      {showPopup && (
        <div
          ref={popupRef}
          className={`donut-popup-overlay${showPanelBackdrop ? ' has-panel-backdrop' : ''}`}
          onClick={e => e.stopPropagation()}
          onWheel={e => e.stopPropagation()}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Minimal Floating Toolbar (Filter Chip + Mini Switchers) */}
          <div className="donut-popup-toolbar">
            {activeFilter !== 'all' && activeGroup ? (
              <span
                className="donut-filter-chip"
                style={{
                  color: activeGroup.color,
                  borderColor: `rgba(${activeGroup.rgb}, 0.45)`,
                  background: `rgba(${activeGroup.rgb}, 0.16)`,
                }}
              >
                <span>{activeGroup.label}</span>
                <span className="opacity-75">· {visibleVehicles.length}</span>
              </span>
            ) : (
              <span className="donut-filter-chip is-muted">
                {clusterLabel} · {totalCount}
              </span>
            )}

            <div className="donut-toolbar-actions">
              {/* Button 1: Backdrop Panel Visibility Switcher */}
              <button
                type="button"
                className={`donut-mini-switcher${showPanelBackdrop ? ' is-active' : ''}`}
                onClick={toggleBackdrop}
                title={
                  lang === 'ar'
                    ? (showPanelBackdrop ? 'إخفاء خلفية القائمة (وضع البطاقات الحرة)' : 'إظهار خلفية لوحية للقائمة')
                    : (showPanelBackdrop ? 'Hide list backdrop (free floating mode)' : 'Show panel backdrop for list')
                }
                aria-label={lang === 'ar' ? 'تبديل خلفية القائمة' : 'Toggle list backdrop'}
              >
                {showPanelBackdrop ? (
                  /* Icon: Filled panel */
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" fillOpacity="0.28" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                  </svg>
                ) : (
                  /* Icon: Transparent frame */
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="4" />
                    <path d="m3 3 18 18" opacity="0.6" />
                  </svg>
                )}
              </button>

              {/* Button 2: Card Style Switcher (Pure Dark vs Tinted Hybrid) */}
              <button
                type="button"
                className="donut-mini-switcher"
                onClick={e => toggleVariant(cardVariant === 'pure' ? 'tinted' : 'pure', e)}
                title={
                  lang === 'ar'
                    ? (cardVariant === 'pure' ? 'التبديل إلى النمط الملون (Style 2)' : 'التبديل إلى النمط الداكن (Style 1)')
                    : (cardVariant === 'pure' ? 'Switch to Tinted Hybrid' : 'Switch to Pure Dark')
                }
                aria-label={lang === 'ar' ? 'تبديل نمط الكبسولة' : 'Switch card style'}
              >
                {cardVariant === 'pure' ? (
                  /* Icon representing Tinted style (palette/layers) */
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z" />
                  </svg>
                ) : (
                  /* Icon representing Pure dark capsule style */
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="6" width="18" height="12" rx="6" />
                    <line x1="12" y1="6" x2="12" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Floating Staggered/Stacked Vehicle Cards with 3D Tilt */}
          <div
            className="donut-popup-list"
            onWheel={e => e.stopPropagation()}
          >
            {visibleVehicles.length === 0 ? (
              <div className="capsule-empty-hint">
                {lang === 'ar' ? 'لا توجد مركبات في هذا القسم' : 'No vehicles in this status'}
              </div>
            ) : (
              visibleVehicles.map(vehicle => {
                const statusKey = getVehicleStatusKey(vehicle)
                const statusColor = statusColors[statusKey] || (statusKey === 'moving' ? '#22c55e' : statusKey === 'idle' ? '#f97316' : statusKey === 'towed' ? '#eab308' : '#64748b')
                const statusRgb = getStatusRgb(statusKey)
                const statusName = getStatusLabel(statusKey, lang)
                const iconSymbol = getStatusIcon(statusKey)

                const inlineStyle = {
                  '--status-color': statusColor,
                  '--status-glow': `rgba(${statusRgb}, 0.28)`,
                  '--status-border': `rgba(${statusRgb}, 0.38)`,
                  '--status-bg-strong': `rgba(${statusRgb}, 0.18)`,
                  '--status-bg-soft': `rgba(${statusRgb}, 0.06)`,
                  '--status-badge-bg': `rgba(${statusRgb}, 0.14)`,
                } as CSSProperties

                const cardClass = cardVariant === 'tinted'
                  ? 'capsule-card is-tinted-pill'
                  : 'capsule-card is-pure-pill'

                return (
                  <Tilt
                    key={vehicle.id}
                    rotationFactor={6}
                    isRevese
                    springOptions={{ stiffness: 400, damping: 28 }}
                    className="capsule-tilt-wrapper"
                  >
                    <div
                      className={cardClass}
                      style={inlineStyle}
                      onClick={e => {
                        e.stopPropagation()
                        onVehicleSelect(vehicle)
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${vehicle.name}, ${vehicle.driver || ''}, ${statusName}`}
                    >
                      {/* Segment 1: Identity & Pod */}
                      <div className="capsule-segment-identity">
                        <div
                          className="capsule-icon-pod"
                          style={{
                            background: cardVariant === 'tinted' ? `rgba(${statusRgb}, 0.24)` : undefined,
                            borderColor: cardVariant === 'tinted' ? `rgba(${statusRgb}, 0.42)` : undefined,
                          }}
                        >
                          <span>{iconSymbol}</span>
                        </div>
                        <div className="capsule-meta-names">
                          <div className="capsule-vname">
                            <span>{vehicle.name}</span>
                            <span className="capsule-status-tag">{statusName}</span>
                          </div>
                          {vehicle.driver ? (
                            <div className="capsule-vdriver">
                              {vehicle.driver}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Hairline Vertical Divider */}
                      <div
                        className="capsule-divider"
                        style={{
                          background: cardVariant === 'tinted' ? `rgba(${statusRgb}, 0.35)` : undefined,
                        }}
                      />

                      {/* Segment 2: Telemetry */}
                      <div className="capsule-segment-telemetry">
                        <div className="capsule-speed-badge">
                          <span>{vehicle.speed} {lang === 'ar' ? 'كم/س' : 'km/h'}</span>
                        </div>
                        <div className="capsule-time-badge">
                          {vehicle.lastUpdate || (lang === 'ar' ? 'الآن' : 'Now')}
                        </div>
                      </div>
                    </div>
                  </Tilt>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
