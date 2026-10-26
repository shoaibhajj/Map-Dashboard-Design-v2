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
type VehiclePointProperties = { vehicleId?: string; bucketIndex?: number; [key: string]: unknown }
export interface VehicleClusterPartition {
  id: string
  data: FeatureCollection<Point, VehiclePointProperties>
  members: Array<{ vehicleId: string; bucketIndex: number }>
}

const KNOWN_CITIES: Array<{ name: string; region: string; countryCode: string; lng: number; lat: number }> = [
  { name: 'Riyadh', region: 'Riyadh', countryCode: 'SAU', lng: 46.6753, lat: 24.7136 },
  { name: 'Jeddah', region: 'Makkah', countryCode: 'SAU', lng: 39.1925, lat: 21.4858 },
  { name: 'Makkah', region: 'Makkah', countryCode: 'SAU', lng: 39.8579, lat: 21.3891 },
  { name: 'Madinah', region: 'Madinah', countryCode: 'SAU', lng: 39.6111, lat: 24.4672 },
  { name: 'Dammam', region: 'Eastern Province', countryCode: 'SAU', lng: 50.0888, lat: 26.4207 },
  { name: 'Al Khobar', region: 'Eastern Province', countryCode: 'SAU', lng: 50.2083, lat: 26.2172 },
  { name: 'Jubail', region: 'Eastern Province', countryCode: 'SAU', lng: 49.6583, lat: 27.0174 },
  { name: 'Abha', region: 'Asir', countryCode: 'SAU', lng: 42.5053, lat: 18.2164 },
  { name: 'Tabuk', region: 'Tabuk', countryCode: 'SAU', lng: 36.555, lat: 28.3838 },
  { name: 'Hail', region: 'Hail', countryCode: 'SAU', lng: 41.7208, lat: 27.5114 },
  { name: 'Buraidah', region: 'Qassim', countryCode: 'SAU', lng: 43.9818, lat: 26.3592 },
  { name: 'Jazan', region: 'Jazan', countryCode: 'SAU', lng: 42.5611, lat: 16.8894 },
  { name: 'Najran', region: 'Najran', countryCode: 'SAU', lng: 44.2289, lat: 17.565 },
  { name: 'Kuwait City', region: 'Kuwait', countryCode: 'KWT', lng: 47.9774, lat: 29.3759 },
  { name: 'Manama', region: 'Bahrain', countryCode: 'BHR', lng: 50.5876, lat: 26.2235 },
  { name: 'Doha', region: 'Qatar', countryCode: 'QAT', lng: 51.531, lat: 25.2854 },
  { name: 'Abu Dhabi', region: 'Abu Dhabi', countryCode: 'ARE', lng: 54.3773, lat: 24.4539 },
  { name: 'Muscat', region: 'Muscat', countryCode: 'OMN', lng: 58.3829, lat: 23.588 },
]

const COUNTRY_CLUSTER_CENTERS: Record<string, [number, number]> = {
  SAU: [45.1, 23.9],
  KWT: [47.6, 29.3],
  BHR: [50.55, 26.1],
  QAT: [51.2, 25.3],
  ARE: [54.2, 24.1],
  OMN: [56.1, 21.3],
}

function vehicleGeography(vehicle: Vehicle, position: [number, number]) {
  const nearest = KNOWN_CITIES.reduce((best, city) => {
    const distance = Math.hypot((position[0] - city.lng) * Math.cos(position[1] * Math.PI / 180), position[1] - city.lat)
    return distance < best.distance ? { city, distance } : best
  }, { city: KNOWN_CITIES[0], distance: Infinity })
  const explicitCountry = vehicle.countryCode
  const countryCode = explicitCountry || (nearest.distance < 2.3 ? nearest.city.countryCode : `UNK-${vehicle.id}`)
  const city = vehicle.city || (countryCode === 'SAU' ? nearest.city.name : nearest.city.name)
  const region = vehicle.administrativeRegion || (countryCode === 'SAU' && nearest.distance < 2.3 ? nearest.city.region : city)
  const locationText = `${vehicle.zone} ${vehicle.location} ${vehicle.groupId ?? ''}`.toLowerCase()
  const directional = vehicle.geographicSector || (locationText.match(/north|northern/) ? 'north'
    : locationText.match(/south|southern/) ? 'south'
      : locationText.match(/east|eastern/) ? 'east'
        : locationText.match(/west|western/) ? 'west'
          : undefined)
  const deltaLng = position[0] - nearest.city.lng
  const deltaLat = position[1] - nearest.city.lat
  const positionSector = Math.max(Math.abs(deltaLng), Math.abs(deltaLat)) < 0.06 ? 'central'
    : Math.abs(deltaLat) >= Math.abs(deltaLng) ? (deltaLat > 0 ? 'north' : 'south')
      : deltaLng > 0 ? 'east' : 'west'
  const sector = vehicle.status === 'moving' ? positionSector : directional ?? 'central'
  const district = vehicle.status === 'moving'
    ? `${city}-${Math.floor(position[0] / 0.04)}-${Math.floor(position[1] / 0.04)}`
    : vehicle.district || (/^riyadh$/i.test(city) ? vehicle.zone.replace(/^riyadh\s*/i, '').trim() : '') || city
  return { countryCode, city, region, sector, district }
}

function getClusterLevel(zoom: number, legend: MapLegendConfig) {
  if (legend.clusterGrouping === 'distance') return 'country'
  const settings = legend.clusterZoomSettings
  const countryMax = settings.countryMaxZoom
  const regionMax = Math.max(countryMax, settings.regionMaxZoom)
  const sectorMax = Math.max(regionMax, settings.sectorMaxZoom)
  if (zoom <= countryMax) return 'country'
  if (zoom <= regionMax) return 'region'
  if (zoom <= sectorMax) return 'sector'
  return 'neighborhood'
}

export function getVehicleClusterMaxZoom(legend: MapLegendConfig) {
  if (!legend.clusteringEnabled) return -1
  if (legend.clusterGrouping === 'distance') return Math.max(1, ...legend.clusterZoomSettings.distanceRanges.map(range => range.maxZoom))
  return Math.max(legend.clusterZoomSettings.countryMaxZoom, legend.clusterZoomSettings.regionMaxZoom,
    legend.clusterZoomSettings.sectorMaxZoom, legend.clusterZoomSettings.neighborhoodMaxZoom)
}

function getPartitionKey(vehicle: Vehicle, position: [number, number], level: string) {
  const geo = vehicleGeography(vehicle, position)
  if (level === 'country') return `${geo.countryCode}`
  if (level === 'region') return `${geo.countryCode}:${geo.region}`
  if (level === 'sector') return `${geo.countryCode}:${geo.region}:${geo.city}:${geo.sector}`
  return `${geo.countryCode}:${geo.region}:${geo.city}:${geo.district}`
}

export function getClusterRadiusPixels(zoom: number, latitude: number, legend: MapLegendConfig) {
  if (legend.clusterGrouping !== 'distance') return 84
  const orderedRanges = [...legend.clusterZoomSettings.distanceRanges].sort((a, b) => a.maxZoom - b.maxZoom)
  const range = orderedRanges.find(item => zoom <= item.maxZoom)
    ?? orderedRanges[orderedRanges.length - 1]
  const metersPerPixel = 40075016.686 * Math.max(0.08, Math.cos(latitude * Math.PI / 180)) / (512 * 2 ** zoom)
  return Math.max(8, Math.min(512, (range?.radiusKm ?? 6) * 1000 / metersPerPixel))
}

export function createVehicleClusterPartitions(
  vehicles: Vehicle[],
  legend: MapLegendConfig,
  zoom: number,
  currentPositions?: Map<string, [number, number]>,
): VehicleClusterPartition[] {
  const level = getClusterLevel(zoom, legend)
  const groups = new Map<string, Vehicle[]>()
  vehicles.forEach(vehicle => {
    const position = currentPositions?.get(vehicle.id) ?? [vehicle.lng, vehicle.lat]
    const key = getPartitionKey(vehicle, position, level)
    const group = groups.get(key) ?? []
    group.push(vehicle)
    groups.set(key, group)
  })
  return [...groups.entries()].map(([key, vehiclesInGroup]) => {
    const id = `${level}-${key}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-')
    const vehicleData = createVehicleClusterData(vehiclesInGroup, legend, currentPositions)
    const members = vehicleData.features.flatMap(feature =>
      typeof feature.properties.vehicleId === 'string' && Number.isFinite(feature.properties.bucketIndex)
        ? [{ vehicleId: feature.properties.vehicleId, bucketIndex: Number(feature.properties.bucketIndex) }]
        : [],
    )

    if (legend.clusterGrouping !== 'administrative') return { id, data: vehicleData, members }

    let clusterId = 0
    for (const character of key) clusterId = (clusterId * 31 + character.charCodeAt(0)) | 0
    clusterId = Math.abs(clusterId)
    const memberCenter = vehicleData.features.reduce<[number, number]>((sum, feature) => [
      sum[0] + feature.geometry.coordinates[0] / Math.max(1, vehicleData.features.length),
      sum[1] + feature.geometry.coordinates[1] / Math.max(1, vehicleData.features.length),
    ], [0, 0])
    const coordinates = level === 'country'
      ? COUNTRY_CLUSTER_CENTERS[key] ?? memberCenter
      : memberCenter
    const bucketCounts = getVehicleClusterBuckets(vehiclesInGroup, legend).map((_, bucketIndex) => [
      `bucket_${bucketIndex}`,
      members.filter(member => member.bucketIndex === bucketIndex).length,
    ])
    const aggregate: Feature<Point, VehiclePointProperties> = {
      type: 'Feature',
      id: clusterId,
      geometry: { type: 'Point', coordinates },
      properties: {
        cluster: true,
        cluster_id: clusterId,
        point_count: members.length,
        ...Object.fromEntries(bucketCounts),
      },
    }
    return {
      id,
      data: { type: 'FeatureCollection', features: [aggregate] },
      members,
    }
  })
}

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
  const ranges: BucketDefinition[] = legend.ranges.map((range: MapColorRange, index) => ({
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
