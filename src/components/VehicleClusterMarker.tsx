import { useState, type CSSProperties } from 'react'
import type { Vehicle } from '../data/vehicles'
import type { VehicleClusterSlice } from '../utils/vehicleClustering'

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

const FIRST_ORBIT_RADIUS = 54
const ORBIT_GAP = 42
const MIN_CLUSTER_SIZE = 22
const MAX_CLUSTER_SIZE = 260
const MIN_CLUSTER_ZOOM = 0
const COUNTRY_ZOOM = 4
const MAX_CLUSTER_ZOOM = 12

function getBaseOrbitalClusterSize(ringCount: number) {
  const outerRadius = FIRST_ORBIT_RADIUS + Math.max(0, ringCount - 1) * ORBIT_GAP
  return Math.max(156, Math.ceil((outerRadius + 25) * 2))
}

export function getOrbitalClusterScale(ringCount: number, zoom: number) {
  const baseSize = getBaseOrbitalClusterSize(ringCount)
  const normalizedZoom = Math.max(MIN_CLUSTER_ZOOM, Math.min(MAX_CLUSTER_ZOOM, zoom))
  const zoomSize = normalizedZoom <= COUNTRY_ZOOM
    ? 34 + (normalizedZoom / COUNTRY_ZOOM) * (72 - 34)
    : 72 + ((normalizedZoom - COUNTRY_ZOOM) / (MAX_CLUSTER_ZOOM - COUNTRY_ZOOM)) * (MAX_CLUSTER_SIZE - 72)
  return Math.min(1, zoomSize / baseSize)
}

export function getOrbitalClusterSize(ringCount: number, zoom: number) {
  return Math.ceil(getBaseOrbitalClusterSize(ringCount) * getOrbitalClusterScale(ringCount, zoom))
}

function statusLabel(vehicle: Vehicle, lang: 'en' | 'ar') {
  if (vehicle.telemetry.towing) return lang === 'ar' ? 'مسحوبة' : 'Towed'
  if (vehicle.status === 'moving') return lang === 'ar' ? 'متحركة' : 'Moving'
  if (vehicle.status === 'idle') return lang === 'ar' ? 'متوقفة' : 'Idle'
  return lang === 'ar' ? 'غير متصلة' : 'Offline'
}

function sliceLabel(slice: VehicleClusterSlice, lang: 'en' | 'ar') {
  if (slice.kind === 'moving') return lang === 'ar' ? 'متحركة' : 'Moving'
  if (slice.kind === 'idle') return lang === 'ar' ? 'متوقفة' : 'Idle'
  if (slice.kind === 'offline') return lang === 'ar' ? 'غير متصلة' : 'Offline'
  if (slice.kind === 'towing') return lang === 'ar' ? 'مسحوبة' : 'Towed'
  return slice.label
}

function OrbitTooltip({ vehicle, lang }: { vehicle: Vehicle; lang: 'en' | 'ar' }) {
  return (
    <span className="orbital-cluster-tooltip" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <strong className="orbital-cluster-tooltip-name">{vehicle.name}</strong>
      <span className="orbital-cluster-tooltip-meta">
        <span>{vehicle.plate}</span>
        <span>{statusLabel(vehicle, lang)}</span>
      </span>
      <span className="orbital-cluster-tooltip-location">{vehicle.location}</span>
      <span className="orbital-cluster-tooltip-speed">
        {lang === 'ar' ? 'السرعة' : 'Speed'}: {vehicle.speed} km/h
      </span>
    </span>
  )
}

export default function VehicleClusterMarker({ count, slices, members, clusterVehicles, statusColors, clusterLabel, zoom, lang, onClusterClick, onVehicleSelect }: Props) {
  const [showVehicleList, setShowVehicleList] = useState(false)
  const compact = zoom >= 3 && zoom < 5
  const scale = getOrbitalClusterScale(slices.length, zoom)
  const size = getOrbitalClusterSize(slices.length, zoom)
  const center = size / 2
  const totalLabel = count.toLocaleString(lang === 'ar' ? 'ar' : 'en')
  const groups = slices.map((slice, index) => ({
    slice,
    radius: FIRST_ORBIT_RADIUS + index * ORBIT_GAP,
    vehicles: members.filter(member => member.bucketIndex === slice.bucketIndex),
  }))

  const coreScale = Math.max(0.42, Math.min(1, size / 44))
  const statusGroups = [
    { key: 'moving', color: statusColors.moving ?? '#16a34a', vehicles: clusterVehicles.filter(vehicle => !vehicle.telemetry.towing && vehicle.status === 'moving') },
    { key: 'idle', color: statusColors.idle ?? '#f97316', vehicles: clusterVehicles.filter(vehicle => !vehicle.telemetry.towing && vehicle.status === 'idle') },
    { key: 'offline', color: statusColors.offline ?? '#64748b', vehicles: clusterVehicles.filter(vehicle => !vehicle.telemetry.towing && vehicle.status === 'offline') },
    { key: 'towed', color: statusColors.towed ?? '#f59e0b', vehicles: clusterVehicles.filter(vehicle => vehicle.telemetry.towing) },
  ].filter(group => group.vehicles.length > 0)
  const compactCircumference = 2 * Math.PI * 22
  let consumedLength = 0
  return (
    <div className="orbital-cluster" style={{
      width: size,
      height: size,
      '--orbit-scale': scale,
      '--orbit-inverse-scale': 1 / scale,
      '--orbit-core-scale': coreScale,
      '--orbit-core-inverse-scale': 1 / coreScale,
    } as CSSProperties} role="group" aria-label={lang === 'ar' ? `مجموعة تضم ${totalLabel} مركبة` : `Cluster of ${totalLabel} vehicles`}>
      <button
        type="button"
        className={`orbital-cluster-core-hit${compact ? ' is-compact' : ''}${showVehicleList ? ' has-vehicle-list' : ''}`}
        onMouseEnter={() => compact && setShowVehicleList(true)}
        onMouseLeave={() => setShowVehicleList(false)}
        onFocus={() => compact && setShowVehicleList(true)}
        onBlur={() => setShowVehicleList(false)}
        onClick={event => {
          event.stopPropagation()
          onClusterClick()
        }}
        aria-label={lang === 'ar' ? `تكبير ${clusterLabel} تضم ${totalLabel} مركبة` : `Zoom into ${clusterLabel}, ${totalLabel} vehicles`}
      >
        {compact && showVehicleList ? (
          <span className="orbital-cluster-vehicle-list" role="tooltip" dir={lang === 'ar' ? 'rtl' : 'ltr'} onClick={event => event.stopPropagation()} onWheel={event => event.stopPropagation()}>
            <strong>{lang === 'ar' ? `${totalLabel} مركبة` : `${totalLabel} vehicles`}</strong>
            <span className="orbital-cluster-vehicle-list-rows">
              <span className="orbital-cluster-vehicle-list-heading">
                <span>{lang === 'ar' ? 'المركبة' : 'Vehicle'}</span>
                <span>{lang === 'ar' ? 'السرعة' : 'Speed'}</span>
                <span>{lang === 'ar' ? 'آخر تحديث' : 'Last update'}</span>
              </span>
              {clusterVehicles.map(vehicle => {
                const isTowed = Boolean(vehicle.telemetry.towing)
                const color = isTowed ? statusColors.towed : statusColors[vehicle.status]
                return <span className="orbital-cluster-vehicle-list-row" key={vehicle.id} style={{ '--vehicle-status-color': color ?? '#64748b' } as CSSProperties}>
                  <span className="orbital-cluster-vehicle-list-name" title={vehicle.name}><i />{vehicle.name}</span>
                  <span className="orbital-cluster-vehicle-list-speed">{vehicle.speed} km/h</span>
                  <span className="orbital-cluster-vehicle-list-update">{vehicle.lastUpdate || (lang === 'ar' ? 'غير متاح' : 'Unavailable')}</span>
                </span>
              })}
            </span>
          </span>
        ) : (
          <span className="orbital-cluster-summary-tooltip" role="tooltip" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <strong>{clusterLabel}</strong>
            <span>{lang === 'ar' ? `المجموع: ${totalLabel} مركبة` : `Total: ${totalLabel} vehicles`}</span>
            {slices.map(slice => <span key={slice.key}>{sliceLabel(slice, lang)}: {slice.count}</span>)}
          </span>
        )}
      </button>

      {compact && <svg className="orbital-cluster-compact-ring" viewBox="0 0 52 52" aria-hidden="true">
        <circle className="orbital-cluster-compact-track" cx="26" cy="26" r="22" />
        {statusGroups.map(group => {
          const length = Math.max(0, compactCircumference * group.vehicles.length / Math.max(1, clusterVehicles.length) - 2)
          const offset = -consumedLength
          consumedLength += compactCircumference * group.vehicles.length / Math.max(1, clusterVehicles.length)
          return <circle key={group.key} className="orbital-cluster-compact-segment" cx="26" cy="26" r="22" stroke={group.color} strokeDasharray={`${length} ${compactCircumference}`} strokeDashoffset={offset} />
        })}
      </svg>}

      {!compact && groups.map(({ slice, radius, vehicles }, ringIndex) => {
        const laneStyle = {
          left: `${center}px`,
          top: `${center}px`,
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          '--orbit-color': slice.color,
          '--orbit-index': ringIndex,
          '--orbit-delay': `${ringIndex * -0.55}s`,
          '--orbit-scale': scale,
          '--orbit-inverse-scale': 1 / scale,
        } as CSSProperties

        return (
          <div
            className="orbital-cluster-lane"
            data-orbit-index={ringIndex}
            data-orbit-outermost={ringIndex === groups.length - 1 ? 'true' : undefined}
            key={slice.key}
            style={laneStyle}
          >
            <div className="orbital-cluster-rotor">
              <span className="orbital-cluster-ring-path" />
              <svg className="orbital-cluster-ring-hit" viewBox={`0 0 ${radius * 2} ${radius * 2}`} aria-label={lang === 'ar' ? `${sliceLabel(slice, lang)}: ${slice.count} مركبة` : `${sliceLabel(slice, lang)}: ${slice.count} vehicles`}>
                <circle cx={radius} cy={radius} r={radius - 2} fill="none" stroke="transparent" strokeWidth="18" pointerEvents="stroke" />
              </svg>
              <span className="orbital-cluster-ring-tooltip" role="tooltip" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <strong>{sliceLabel(slice, lang)}</strong>
                <span>{lang === 'ar' ? `${slice.count} مركبة` : `${slice.count} vehicles`}</span>
              </span>
              {vehicles.map(({ vehicle, bucketIndex }, index) => {
                const phase = (index / Math.max(1, vehicles.length)) * 360 + ringIndex * 137.5
                const nodeStyle = {
                  '--orbit-phase': `${phase}deg`,
                  '--orbit-radius': `${radius}px`,
                  '--orbit-color': slice.color,
                } as CSSProperties
                const accessibleLabel = lang === 'ar'
                  ? `${vehicle.name}، ${vehicle.plate}، ${statusLabel(vehicle, lang)}. اضغط لفتح التفاصيل`
                  : `${vehicle.name}, ${vehicle.plate}, ${statusLabel(vehicle, lang)}. Select to open details`

                return (
                  <span className="orbital-cluster-node" key={vehicle.id} style={nodeStyle}>
                    <span className="orbital-cluster-node-upright">
                      <button
                        type="button"
                        className="orbital-cluster-vehicle"
                        aria-label={accessibleLabel}
                        data-vehicle-id={vehicle.id}
                        data-bucket-index={bucketIndex}
                        onClick={event => {
                          event.stopPropagation()
                          onVehicleSelect(vehicle)
                        }}
                      >
                        <span className="orbital-cluster-vehicle-dot" />
                        <OrbitTooltip vehicle={vehicle} lang={lang} />
                      </button>
                    </span>
                  </span>
                )
              })}
            </div>
          </div>
        )
      })}

      <span className="orbital-cluster-count" aria-hidden="true">{totalLabel}</span>
    </div>
  )
}
