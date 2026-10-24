import type { CSSProperties } from 'react'
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
  lang: 'en' | 'ar'
  onClusterClick: () => void
  onVehicleSelect: (vehicle: Vehicle) => void
}

const FIRST_ORBIT_RADIUS = 54
const ORBIT_GAP = 42

export function getOrbitalClusterSize(ringCount: number) {
  const outerRadius = FIRST_ORBIT_RADIUS + Math.max(0, ringCount - 1) * ORBIT_GAP
  return Math.max(156, Math.ceil((outerRadius + 25) * 2))
}

function statusLabel(vehicle: Vehicle, lang: 'en' | 'ar') {
  if (vehicle.telemetry.towing) return lang === 'ar' ? 'مسحوبة' : 'Towed'
  if (vehicle.status === 'moving') return lang === 'ar' ? 'متحركة' : 'Moving'
  if (vehicle.status === 'idle') return lang === 'ar' ? 'متوقفة' : 'Idle'
  return lang === 'ar' ? 'غير متصلة' : 'Offline'
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

export default function VehicleClusterMarker({ count, slices, members, lang, onClusterClick, onVehicleSelect }: Props) {
  const size = getOrbitalClusterSize(slices.length)
  const center = size / 2
  const totalLabel = count.toLocaleString(lang === 'ar' ? 'ar' : 'en')
  const groups = slices.map((slice, index) => ({
    slice,
    radius: FIRST_ORBIT_RADIUS + index * ORBIT_GAP,
    vehicles: members.filter(member => member.bucketIndex === slice.bucketIndex),
  })).filter(group => group.vehicles.length > 0)

  return (
    <div className="orbital-cluster" style={{ width: size, height: size }} role="group" aria-label={lang === 'ar' ? `مجموعة تضم ${totalLabel} مركبة` : `Cluster of ${totalLabel} vehicles`}>
      <button
        type="button"
        className="orbital-cluster-core-hit"
        onClick={event => {
          event.stopPropagation()
          onClusterClick()
        }}
        aria-label={lang === 'ar' ? `تكبير مجموعة تضم ${totalLabel} مركبة` : `Zoom into cluster of ${totalLabel} vehicles`}
      />

      {groups.map(({ slice, radius, vehicles }, ringIndex) => {
        const laneStyle = {
          left: `${center}px`,
          top: `${center}px`,
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          '--orbit-color': slice.color,
          '--orbit-index': ringIndex,
          '--orbit-delay': `${ringIndex * -0.55}s`,
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
