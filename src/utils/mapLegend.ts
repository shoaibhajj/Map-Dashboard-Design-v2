import type { Vehicle, VehicleStatus } from '../data/vehicles'

export type MapLegendMode = 'status' | 'metric'

export interface MapColorRange {
  id: string
  min: number
  max: number
  color: string
}

export interface MetricOption {
  key: string
  label: string
  unit: string
  source: 'vehicle' | 'gps' | 'sensor'
  kind: 'percent' | 'temperature' | 'voltage' | 'speed' | 'distance' | 'duration' | 'count' | 'number'
  min?: number
  max?: number
  step: number
}

export interface MapLegendConfig {
  mode: MapLegendMode
  metricKey: string
  statusColors: Record<VehicleStatus, string>
  ranges: MapColorRange[]
  noDataColor: string
}

const STORAGE_KEY = 'fleet-map-legend-settings-v1'

export const DEFAULT_MAP_LEGEND: MapLegendConfig = {
  mode: 'status',
  metricKey: 'speed',
  statusColors: {
    moving: '#16a34a',
    idle: '#ef4444',
    offline: '#6b7280',
  },
  ranges: [
    { id: 'speed-low', min: 0, max: 60, color: '#16a34a' },
    { id: 'speed-medium', min: 60, max: 100, color: '#f59e0b' },
    { id: 'speed-high', min: 100, max: 300, color: '#ef4444' },
  ],
  noDataColor: '#94a3b8',
}

export function getDefaultMetricRanges(option: MetricOption): MapColorRange[] {
  const presets: Record<string, Array<[number, number, string]>> = {
    fuelLevel: [[0, 30, '#ef4444'], [30, 70, '#f59e0b'], [70, 100, '#16a34a']],
    batteryPercent: [[0, 20, '#ef4444'], [20, 50, '#f59e0b'], [50, 100, '#16a34a']],
    batteryVoltage: [[0, 12, '#ef4444'], [12, 12.6, '#f59e0b'], [12.6, 14.8, '#16a34a'], [14.8, 20, '#ef4444']],
    speed: [[0, 60, '#16a34a'], [60, 100, '#f59e0b'], [100, 300, '#ef4444']],
    satellites: [[0, 4, '#ef4444'], [4, 8, '#f59e0b'], [8, 50, '#16a34a']],
    refrigerator_temperature: [[-30, -18, '#3b82f6'], [-18, -10, '#16a34a'], [-10, -5, '#f59e0b'], [-5, 10, '#ef4444']],
  }
  const preset = presets[option.key]
  if (preset) return preset.map(([min, max, color], index) => ({ id: `${option.key}-${index}`, min, max, color }))

  if (option.kind === 'temperature' && /engine/i.test(option.label)) {
    return [
      { id: `${option.key}-cool`, min: option.min ?? 0, max: 70, color: '#f59e0b' },
      { id: `${option.key}-normal`, min: 70, max: 100, color: '#16a34a' },
      { id: `${option.key}-hot`, min: 100, max: option.max ?? 120, color: '#ef4444' },
    ]
  }
  if (option.unit === 'psi' && /oil pressure/i.test(option.label)) {
    return [
      { id: `${option.key}-low`, min: option.min ?? 0, max: 20, color: '#ef4444' },
      { id: `${option.key}-normal`, min: 20, max: 60, color: '#16a34a' },
      { id: `${option.key}-high`, min: 60, max: option.max ?? 80, color: '#f59e0b' },
    ]
  }
  if (option.kind === 'percent') {
    const min = option.min ?? 0
    const max = option.max ?? 100
    const span = max - min
    return [
      { id: `${option.key}-low`, min, max: min + span * 0.3, color: '#ef4444' },
      { id: `${option.key}-medium`, min: min + span * 0.3, max: min + span * 0.7, color: '#f59e0b' },
      { id: `${option.key}-high`, min: min + span * 0.7, max, color: '#16a34a' },
    ]
  }
  if (option.kind === 'voltage' && /battery/i.test(option.label)) {
    return [
      { id: `${option.key}-low`, min: option.min ?? 0, max: 11.8, color: '#ef4444' },
      { id: `${option.key}-medium`, min: 11.8, max: 12.4, color: '#f59e0b' },
      { id: `${option.key}-normal`, min: 12.4, max: 14.8, color: '#16a34a' },
      { id: `${option.key}-high`, min: 14.8, max: option.max ?? 20, color: '#ef4444' },
    ]
  }

  let min = option.min ?? 0
  let max = option.max ?? 100
  if (option.kind === 'temperature' && /engine/i.test(option.label)) { min = option.min ?? 0; max = option.max ?? 120 }
  if (min >= max) { min = 0; max = 100 }
  const span = max - min
  const split1 = min + span * 0.6
  const split2 = min + span * 0.85
  return [
    { id: `${option.key}-low`, min, max: split1, color: '#16a34a' },
    { id: `${option.key}-mid`, min: split1, max: split2, color: '#f59e0b' },
    { id: `${option.key}-high`, min: split2, max, color: '#ef4444' },
  ]
}

export function readMapLegendConfig(): MapLegendConfig {
  if (typeof window === 'undefined') return DEFAULT_MAP_LEGEND
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_MAP_LEGEND
    const parsed = JSON.parse(saved) as Partial<MapLegendConfig>
    return {
      ...DEFAULT_MAP_LEGEND,
      ...parsed,
      statusColors: { ...DEFAULT_MAP_LEGEND.statusColors, ...parsed.statusColors },
      ranges: Array.isArray(parsed.ranges) ? parsed.ranges : DEFAULT_MAP_LEGEND.ranges,
    }
  } catch {
    return DEFAULT_MAP_LEGEND
  }
}

export function saveMapLegendConfig(config: MapLegendConfig) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // The current prototype remains usable when browser storage is unavailable.
  }
}

export function getVehicleMetric(vehicle: Vehicle, metricKey: string): number | null {
  switch (metricKey) {
    case 'speed': return Number.isFinite(vehicle.speed) ? vehicle.speed : null
    case 'fuelLevel': return Number.isFinite(vehicle.fuelLevel) ? vehicle.fuelLevel : null
    case 'batteryPercent': return vehicle.telemetry.batteryPercent
    case 'batteryVoltage': return vehicle.telemetry.batteryVoltage
    case 'satellites': return Number.isFinite(vehicle.telemetry.satellites) ? vehicle.telemetry.satellites : null
    case 'odometer': return Number.isFinite(vehicle.odometer) ? vehicle.odometer : null
    case 'tripDistance': return Number.isFinite(vehicle.tripDistance) ? vehicle.tripDistance : null
    case 'engineHours': return Number.isFinite(vehicle.engineHours) ? vehicle.engineHours : null
    case 'actualWeightTons': return vehicle.telemetry.actualWeightTons
    case 'weightLimitTons': return vehicle.telemetry.weightLimitTons
    default: {
      const reading = vehicle.sensors.find(sensor => (sensor.key ?? `sensor:${sensor.label}`) === metricKey)
      if (!reading) return null
      if (typeof reading.current === 'number' && Number.isFinite(reading.current)) return reading.current
      if (!reading.value.trim()) return null
      const parsed = Number(reading.value)
      return Number.isFinite(parsed) ? parsed : null
    }
  }
}

export function getVehicleMapColor(vehicle: Vehicle, config: MapLegendConfig): string {
  if (config.mode === 'status') return config.statusColors[vehicle.status]
  const value = getVehicleMetric(vehicle, config.metricKey)
  if (value === null) return config.noDataColor
  const ordered = [...config.ranges].sort((a, b) => a.min - b.min)
  const range = ordered.find((item, index) => Number.isFinite(item.min) && Number.isFinite(item.max) && item.min <= item.max && value >= item.min && (value < item.max || (index === ordered.length - 1 && value <= item.max)))
  return range?.color ?? config.noDataColor
}

export function getMetricOptions(vehicles: Vehicle[]) {
  const options: MetricOption[] = [
    { key: 'speed', label: 'Speed', unit: 'km/h', source: 'vehicle', kind: 'speed', min: 0, max: 200, step: 1 },
    { key: 'fuelLevel', label: 'Fuel level', unit: '%', source: 'vehicle', kind: 'percent', min: 0, max: 100, step: 1 },
    { key: 'odometer', label: 'Odometer', unit: 'km', source: 'vehicle', kind: 'distance', min: 0, max: 1000000, step: 1 },
    { key: 'tripDistance', label: 'Trip distance', unit: 'km', source: 'vehicle', kind: 'distance', min: 0, max: 10000, step: 0.1 },
    { key: 'engineHours', label: 'Engine hours', unit: 'h', source: 'vehicle', kind: 'duration', min: 0, max: 100000, step: 1 },
    { key: 'actualWeightTons', label: 'Current weight', unit: 't', source: 'vehicle', kind: 'number', min: 0, max: 100, step: 0.1 },
    { key: 'weightLimitTons', label: 'Weight limit', unit: 't', source: 'vehicle', kind: 'number', min: 0, max: 100, step: 0.1 },
    { key: 'batteryPercent', label: 'Tracker battery', unit: '%', source: 'gps', kind: 'percent', min: 0, max: 100, step: 1 },
    { key: 'batteryVoltage', label: 'Battery voltage', unit: 'V', source: 'gps', kind: 'voltage', min: 0, max: 20, step: 0.1 },
    { key: 'satellites', label: 'Satellites', unit: '', source: 'gps', kind: 'count', min: 0, max: 50, step: 1 },
  ]
  const sensors = new Map<string, MetricOption>()
  vehicles.forEach(vehicle => vehicle.sensors.forEach(sensor => {
    const key = sensor.key ?? `sensor:${sensor.label}`
    const sensorValue = typeof sensor.current === 'number' && Number.isFinite(sensor.current) ? sensor.current : sensor.value.trim() ? Number(sensor.value.trim()) : Number.NaN
    if (!Number.isFinite(sensorValue)) return
    const unit = sensor.unit ?? ''
    const kind: MetricOption['kind'] = unit === '%' ? 'percent' : unit === '°C' || unit === '°F' ? 'temperature' : unit === 'V' ? 'voltage' : /km\/h/i.test(unit) ? 'speed' : /km|mi/i.test(unit) ? 'distance' : /rpm|psi/i.test(unit) ? 'number' : 'number'
    sensors.set(key, { key, label: sensor.label, unit, source: 'sensor', kind, min: sensor.min, max: sensor.max, step: kind === 'count' ? 1 : 0.1 })
  }))
  return [...options, ...sensors.values()]
}
