import { useState, useRef, useEffect, type CSSProperties } from 'react'
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
  const [popupPlacement, setPopupPlacement] = useState<'top' | 'bottom'>('top')
  const [popupMaxHeight, setPopupMaxHeight] = useState(260)

  const markerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<number | null>(null)

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }

    const marker = markerRef.current
    const markerBounds = marker?.getBoundingClientRect()
    const mapBounds = marker?.closest('.mapboxgl-map')?.getBoundingClientRect()
    const viewportTop = mapBounds?.top ?? 0
    const viewportBottom = mapBounds?.bottom ?? window.innerHeight
    const spaceAbove = Math.max(0, (markerBounds?.top ?? viewportTop) - viewportTop)
    const spaceBelow = Math.max(0, viewportBottom - (markerBounds?.bottom ?? viewportBottom))
    const placement = spaceAbove >= 260
      ? 'top'
      : spaceBelow >= 260
        ? 'bottom'
        : spaceAbove >= spaceBelow ? 'top' : 'bottom'
    const availableSpace = placement === 'top' ? spaceAbove : spaceBelow

    setPopupPlacement(placement)
    setPopupMaxHeight(Math.max(96, Math.min(260, availableSpace - 12)))
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

  const handlePopupMouseEnter = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setActiveFilter('all')
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

  // 1. Group vehicles by status
  const totalCount = clusterVehicles.length || count || 1
  type StatusGroup = {
    key: FilterKey
    color: string
    vehicles: Vehicle[]
    label: string
  }

  const rawGroups: StatusGroup[] = [
    {
      key: 'moving',
      color: statusColors.moving || '#22c55e',
      vehicles: clusterVehicles.filter(v => !v.telemetry?.towing && v.status === 'moving'),
      label: getStatusLabel('moving', lang),
    },
    {
      key: 'idle',
      color: statusColors.idle || '#f97316',
      vehicles: clusterVehicles.filter(v => !v.telemetry?.towing && v.status === 'idle'),
      label: getStatusLabel('idle', lang),
    },
    {
      key: 'offline',
      color: statusColors.offline || '#64748b',
      vehicles: clusterVehicles.filter(v => !v.telemetry?.towing && v.status === 'offline'),
      label: getStatusLabel('offline', lang),
    },
    {
      key: 'towed',
      color: statusColors.towed || '#eab308',
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
      ref={markerRef}
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
        onDoubleClick={e => {
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
          onDoubleClick={e => {
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
          className="donut-popup-overlay"
          data-placement={popupPlacement}
          style={{ '--popup-max-height': `${popupMaxHeight}px` } as CSSProperties}
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={e => e.stopPropagation()}
          onWheel={e => e.stopPropagation()}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Cluster label and current status filter */}
          <div className="donut-popup-toolbar">
            {activeFilter !== 'all' && activeGroup ? (
              <span
                className="donut-filter-chip is-active"
                style={{ '--filter-color': activeGroup.color } as CSSProperties}
              >
                <i aria-hidden="true" />
                <span>{activeGroup.label}</span>
                <span className="opacity-75">· {visibleVehicles.length}</span>
              </span>
            ) : (
              <span className="donut-filter-chip is-muted">
                {clusterLabel} · {totalCount}
              </span>
            )}
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
                  '--status-badge-bg': `rgba(${statusRgb}, 0.14)`,
                } as CSSProperties

                return (
                  <Tilt
                    key={vehicle.id}
                    rotationFactor={6}
                    isRevese
                    springOptions={{ stiffness: 400, damping: 28 }}
                    className="capsule-tilt-wrapper"
                  >
                    <div
                      className="capsule-card is-pure-pill"
                      style={inlineStyle}
                      onClick={e => {
                        e.stopPropagation()
                        onVehicleSelect(vehicle)
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${vehicle.name}, ${statusName}`}
                    >
                      {/* Segment 1: Identity & Pod */}
                      <div className="capsule-segment-identity">
                        <div className="capsule-icon-pod">
                          <span>{iconSymbol}</span>
                        </div>
                        <div className="capsule-meta-names">
                          <div className="capsule-vname">
                            <span className="capsule-name-text">{vehicle.name}</span>
                            <span className="capsule-status-tag">{statusName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Hairline Vertical Divider */}
                      <div className="capsule-divider" />

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
