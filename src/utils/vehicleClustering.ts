import type { Feature, FeatureCollection, Point } from 'geojson'
import type { Vehicle } from '../data/vehicles'
import {
  getMetricOptions,
  getVehicleMetric,
  type MapColorRange,
  type MapLegendConfig,
} from './mapLegend'

export const VEHICLE_CLUSTER_SOURCE_ID = 'fleet-vehicle-clusters'
export const VEHICLE_CLUSTER_LAYER_ID = 'fleet-vehicle-cluster-index'

export interface VehicleClusterSlice {
  key: string
  label: string
  color: string
  count: number
  ratio: number
  bucketIndex: number
  kind: 'moving' | 'idle' | 'offline' | 'towing' | 'range' | 'no-data'
}

export interface VehicleClusterSummary {
  clusterId: number
  count: number
  coordinates: [number, number]
  slices: VehicleClusterSlice[]
}

type BucketDefinition = Omit<VehicleClusterSlice, 'count' | 'ratio' | 'bucketIndex'>
type VehiclePointProperties = { vehicleId: string; bucketIndex: number }

export function getVehicleClusterBuckets(vehicles: Vehicle[], legend: MapLegendConfig): BucketDefinition[] {
  if (legend.mode === 'status') {
    return [
      { key: 'moving', label: 'Moving', color: legend.statusColors.moving, kind: 'moving' },
      { key: 'idle', label: 'Idle', color: legend.statusColors.idle, kind: 'idle' },
      { key: 'offline', label: 'Offline', color: legend.statusColors.offline, kind: 'offline' },
      { key: 'towing', label: 'Towed', color: legend.statusColors.towed, kind: 'towing' },
    ]
  }

  const options = getMetricOptions(vehicles, legend.customSensors)
  const metricUnit = options.find(option => option.key === legend.metricKey)?.unit ?? ''
  const unit = legend.metricKey === 'fuelLevel' && legend.fuelUnit === 'liter' ? 'L' : metricUnit
  const ranges = legend.ranges.map((range: MapColorRange, index) => ({
    key: range.id || `range-${index + 1}`,
    label: `${formatNumber(range.min)}-${formatNumber(range.max)}${unit ? ` ${unit}` : ''}`,
    color: range.color.trim().toLowerCase(),
    kind: 'range' as const,
  }))
  ranges.push({
    key: 'no-reading',
    label: 'No reading',
    color: legend.noDataColor.trim().toLowerCase(),
    kind: 'no-data' as const,
  })
  return ranges
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(1)))
}

export function getVehicleClusterBucketIndex(vehicle: Vehicle, legend: MapLegendConfig) {
  if (legend.mode === 'status') {
    if (vehicle.telemetry?.towing) return 3
    return vehicle.status === 'moving' ? 0 : vehicle.status === 'idle' ? 1 : 2
  }

  const value = getVehicleMetric(vehicle, legend.metricKey, legend.fuelUnit, legend.fuelTankCapacityLiters, legend.customSensors)
  if (value === null) return legend.ranges.length

  const ordered = legend.ranges
    .map((range, index) => ({ range, index }))
    .sort((a, b) => a.range.min - b.range.min)
  const match = ordered.find(({ range }, index) =>
    Number.isFinite(range.min) && Number.isFinite(range.max) && value >= range.min &&
    (value < range.max || (index === ordered.length - 1 && value <= range.max)),
  )
  return match?.index ?? legend.ranges.length
}

export function createVehicleClusterData(
  vehicles: Vehicle[],
  legend: MapLegendConfig,
  currentPositions?: Map<string, [number, number]>,
): FeatureCollection<Point, VehiclePointProperties> {
  return {
    type: 'FeatureCollection',
    features: vehicles.map(vehicle => {
      const position = currentPositions?.get(vehicle.id) ?? [vehicle.lng, vehicle.lat]
      return {
        type: 'Feature',
        id: vehicle.id,
        geometry: { type: 'Point', coordinates: position },
        properties: {
          vehicleId: vehicle.id,
          bucketIndex: getVehicleClusterBucketIndex(vehicle, legend),
        },
      }
    }),
  }
}

export function getVehicleClusterProperties(bucketCount: number) {
  const properties: Record<string, [string, unknown]> = {}
  for (let index = 0; index < bucketCount; index++) {
    properties[`bucket_${index}`] = ['+', ['case', ['==', ['get', 'bucketIndex'], index], 1, 0]]
  }
  return properties
}

export function getVehicleClusterSummary(
  feature: Feature<Point>,
  vehicles: Vehicle[],
  legend: MapLegendConfig,
  bucketDefinitions = getVehicleClusterBuckets(vehicles, legend),
): VehicleClusterSummary | null {
  const properties = feature.properties as Record<string, unknown> | null
  const coordinates = feature.geometry?.coordinates
  const clusterId = Number(properties?.cluster_id)
  const count = Number(properties?.point_count)
  if (!properties || !coordinates || !Number.isFinite(clusterId) || !Number.isFinite(count)) return null

  const slices = bucketDefinitions.map((bucket, index) => {
    const sliceCount = Math.max(0, Number(properties[`bucket_${index}`]) || 0)
    return {
      ...bucket,
      bucketIndex: index,
      count: sliceCount,
      ratio: count > 0 ? sliceCount / count : 0,
    }
  }).filter(slice => slice.count > 0)

  return {
    clusterId,
    count,
    coordinates: [coordinates[0], coordinates[1]],
    slices,
  }
}
