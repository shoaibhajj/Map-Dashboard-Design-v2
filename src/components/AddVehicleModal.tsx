import { FormEvent, useState } from 'react'
import { Vehicle, VehicleStatus, VehicleType } from '../data/vehicles'
import { useLanguage } from '../contexts/LanguageContext'
import type { FleetGroup } from '../data/fleetEntities'
import { getFleetGroupDisplayName, getGroupDepth } from '../utils/fleetGroups'

interface Props {
  groups: FleetGroup[]
  onClose: () => void
  onAdd: (vehicle: Vehicle) => void
}

const emptyRoute = { outbound: [], events: [] }

export default function AddVehicleModal({ groups, onClose, onAdd }: Props) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [plate, setPlate] = useState('')
  const [driver, setDriver] = useState('')
  const [location, setLocation] = useState('')
  const [zone, setZone] = useState('Central Riyadh')
  const [groupId, setGroupId] = useState(() => groups.find(group => group.id === 'riyadh-central')?.id ?? groups.find(group => group.parentId !== null)?.id ?? groups[0]?.id ?? '')
  const [vehicleType, setVehicleType] = useState<VehicleType>('truck')
  const [status, setStatus] = useState<VehicleStatus>('offline')
  const [fuelLevel, setFuelLevel] = useState(100)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const vehicle: Vehicle = {
      id: `v${Date.now()}`,
      name: name.trim(),
      plate: plate.trim().toUpperCase(),
      driver: driver.trim() || 'Unassigned',
      vehicleType,
      groupId: groupId || null,
      zone,
      status,
      speed: 0,
      fuelLevel,
      lastUpdate: t('just_now'),
      location: location.trim(),
      lat: 24.7136,
      lng: 46.6753,
      odometer: 0,
      engineHours: 0,
      tripDistance: 0,
      tripDuration: '—',
      tripStart: '—',
      sensors: [],
      tripHistory: [],
      route: emptyRoute,
      telemetry: {
        towing: false,
        gpsState: status === 'offline' ? 'offline' : 'online',
        batteryPercent: 100,
        batteryVoltage: 12.8,
        satellites: status === 'offline' ? 0 : 8,
        driverAuthorization: driver.trim() ? 'authorized' : 'unknown',
        waslState: 'not_registered',
        actualWeightTons: null,
        weightLimitTons: null,
        cameraState: 'not_installed',
      },
    }
    onAdd(vehicle)
  }

  return (
    <div className="vehicle-modal-backdrop" role="presentation" onMouseDown={event => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="vehicle-modal" role="dialog" aria-modal="true" aria-labelledby="add-vehicle-title">
        <div className="vehicle-modal-header">
          <div>
            <div className="vehicle-modal-eyebrow">{t('fleet_setup')}</div>
            <div className="vehicle-modal-title" id="add-vehicle-title">{t('add_vehicle')}</div>
            <p>{t('add_vehicle_description')}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t('ctrl_close')}>×</button>
        </div>

        <form onSubmit={submit}>
          <div className="vehicle-form-grid">
            <label className="vehicle-form-field">
              <span>{t('lbl_vehicle_name')}</span>
              <input required value={name} onChange={event => setName(event.target.value)} placeholder={t('vehicle_name_placeholder')} autoFocus />
            </label>
            <label className="vehicle-form-field">
              <span>{t('lbl_plate')}</span>
              <input required value={plate} onChange={event => setPlate(event.target.value)} placeholder="CA-0000-X" />
            </label>
            <label className="vehicle-form-field">
              <span>{t('lbl_driver')}</span>
              <input value={driver} onChange={event => setDriver(event.target.value)} placeholder={t('driver_optional')} />
            </label>
            <label className="vehicle-form-field">
              <span>{t('filter_vehicle_type')}</span>
              <select value={vehicleType} onChange={event => setVehicleType(event.target.value as VehicleType)}>
                <option value="truck">{t('type_truck')}</option>
                <option value="van">{t('type_van')}</option>
                <option value="car">{t('type_car')}</option>
                <option value="motorcycle">{t('type_motorcycle')}</option>
              </select>
            </label>
            <label className="vehicle-form-field">
              <span>{t('group_zone')}</span>
              <select value={zone} onChange={event => setZone(event.target.value)}>
                <option value="Central Riyadh">{t('zone_central')}</option>
                <option value="North Riyadh">{t('zone_north')}</option>
                <option value="South Riyadh">{t('zone_south')}</option>
                <option value="East Riyadh">{t('zone_east')}</option>
                <option value="West Riyadh">{t('zone_west')}</option>
              </select>
            </label>
            <label className="vehicle-form-field">
              <span>{t('vehicle_group')}</span>
              <select required value={groupId} onChange={event => setGroupId(event.target.value)}>
                {groups.map(group => <option key={group.id} value={group.id}>{`${'— '.repeat(getGroupDepth(group, groups))}${getFleetGroupDisplayName(group, t)}`}</option>)}
              </select>
            </label>
            <label className="vehicle-form-field">
              <span>{t('lbl_status')}</span>
              <select value={status} onChange={event => setStatus(event.target.value as VehicleStatus)}>
                <option value="moving">{t('status_moving')}</option>
                <option value="idle">{t('status_idle')}</option>
                <option value="offline">{t('status_offline')}</option>
              </select>
            </label>
            <label className="vehicle-form-field vehicle-form-wide">
              <span>{t('lbl_location')}</span>
              <input required value={location} onChange={event => setLocation(event.target.value)} placeholder={t('location_placeholder')} />
            </label>
            <label className="vehicle-form-field vehicle-form-wide">
              <span>{t('filter_fuel_level')} <b>{fuelLevel}%</b></span>
              <input type="range" min="0" max="100" step="5" value={fuelLevel} onChange={event => setFuelLevel(Number(event.target.value))} />
            </label>
          </div>
          <div className="vehicle-modal-actions">
            <button type="button" className="modal-secondary" onClick={onClose}>{t('ctrl_dismiss')}</button>
            <button type="submit" className="modal-primary">{t('create_vehicle')}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
