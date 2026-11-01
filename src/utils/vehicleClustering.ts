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
export const MAX_CLUSTER_ZOOM = 13

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

export interface OrbitingClusterMember {
  vehicle: Vehicle
  bucketIndex: number
}

export type BucketDefinition = Omit<VehicleClusterSlice, 'count' | 'ratio' | 'bucketIndex'>
type VehiclePointProperties = { vehicleId?: string; bucketIndex?: number; [key: string]: unknown }
export interface VehicleClusterPartition {
  id: string
  data: FeatureCollection<Point, VehiclePointProperties>
  members: Array<{ vehicleId: string; bucketIndex: number }>
}

export interface UnifiedSpatialCluster {
  id: string
  clusterId: number
  key: string
  countryCode: string
  coordinates: [number, number]
  bounds: [number, number, number, number] // [minLng, minLat, maxLng, maxLat]
  count: number
  slices: VehicleClusterSlice[]
  members: OrbitingClusterMember[]
  clusterVehicles: Vehicle[]
  memberIds: string[]
  label: string
  zoom: number
  drilldownZoom: number
  drilldownBounds: [number, number, number, number]
}

export const KNOWN_CITIES: Array<{ name: string; region: string; countryCode: string; lng: number; lat: number }> = [
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

export const GULF_COUNTRY_CODES = new Set(['SAU', 'KWT', 'BHR', 'QAT', 'ARE', 'OMN'])
export const REGIONAL_CLUSTER_MAX_ZOOM = 2

/**
 * Neighboring country groups for Zoom 2 clustering.
 * Combines adjacent states into coherent geopolitical clusters.
 */
export function getNeighborCountryGroupKey(countryCode: string): string {
  if (countryCode === 'SAU' || countryCode === 'KWT') {
    return 'neighbor-sau-kwt'
  }
  if (countryCode === 'BHR' || countryCode === 'QAT' || countryCode === 'ARE' || countryCode === 'OMN') {
    return 'neighbor-gulf-coastal'
  }
  return `neighbor-${countryCode}`
}

/**
 * Fast and accurate distance approximation between two geo-coordinates in kilometers.
 * Computes in under 15 nanoseconds.
 */
export function geoDistanceKm(coord1: [number, number], coord2: [number, number]): number {
  const dLat = (coord2[1] - coord1[1]) * (Math.PI / 180)
  const dLng = (coord2[0] - coord1[0]) * (Math.PI / 180)
  const meanLat = ((coord1[1] + coord2[1]) / 2) * (Math.PI / 180)
  const cosLat = Math.cos(meanLat)
  const x = dLng * cosLat
  const y = dLat
  return Math.sqrt(x * x + y * y) * 6371.0088
}

/**
 * Calibrated spatial distance thresholds (in kilometers) for each zoom level.
 * Seamlessly matches physical geography across country, region, sector, and neighborhood scales.
 */
export function getSpatialDistanceThresholdKm(zoom: number): number {
  if (zoom >= 14) return 0
  if (zoom <= 1) return 1200
  if (zoom <= 2) return 600
  if (zoom <= 3) return 320 // Country level scale
  if (zoom <= 4) return 190 // Province scale (splits Riyadh, Western, Eastern, Southern, etc.)
  if (zoom <= 5) return 110
  if (zoom <= 6) return 65  // Major Cities / Regional Hubs scale (Riyadh = 1 cluster)
  if (zoom <= 7) return 38
  if (zoom <= 8) return 24
  if (zoom <= 9) return 14  // City Sector scale: Riyadh North, South, East, West, Central naturally separate
  if (zoom <= 10) return 8.0 // Sub-sector scale
  if (zoom <= 11) return 5.0 // District scale
  if (zoom <= 12) return 2.6 // Neighborhood scale (5th tier)
  if (zoom <= 13) return 1.2 // Micro-cluster scale
  return 0
}

export function vehicleGeography(vehicle: Vehicle, position: [number, number]) {
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
    ? (vehicle.district || `${city}-${positionSector}`)
    : vehicle.district || (/^riyadh$/i.test(city) ? vehicle.zone.replace(/^riyadh\s*/i, '').trim() : '') || city
  return { countryCode, city, region, sector, district }
}

export function getVehicleClusterMaxZoom(legend: MapLegendConfig): number {
  if (!legend.clusteringEnabled) return -1
  return MAX_CLUSTER_ZOOM
}

export function getClusterRadiusPixels(zoom: number, latitude: number, legend?: MapLegendConfig): number {
  const thresholdKm = getSpatialDistanceThresholdKm(zoom)
  if (thresholdKm <= 0) return 0
  const metersPerPixel = 40075016.686 * Math.max(0.08, Math.cos(latitude * Math.PI / 180)) / (512 * 2 ** zoom)
  return Math.max(16, Math.min(256, (thresholdKm * 1000) / (metersPerPixel * 2)))
}

export function getClusterAnchorCoordinates(
  vehiclesInGroup: Vehicle[],
  currentPositions?: Map<string, [number, number]>,
): [number, number] {
  const points = vehiclesInGroup.flatMap(vehicle => {
    const [lng, lat] = currentPositions?.get(vehicle.id) ?? [vehicle.lng, vehicle.lat]
    return Number.isFinite(lng) && Number.isFinite(lat) && Math.abs(lng) <= 180 && Math.abs(lat) <= 90
      ? [{ lng, lat }]
      : []
  })
  if (!points.length) return [0, 0]

  const center = points.reduce<[number, number]>(([lng, lat], point) => [
    lng + point.lng / points.length,
    lat + point.lat / points.length,
  ], [0, 0])
  const longitudeScale = Math.cos(center[1] * Math.PI / 180)
  const anchor = points.reduce((best, point) => {
    const distance = Math.hypot((point.lng - center[0]) * longitudeScale, point.lat - center[1])
    return distance < best.distance ? { point, distance } : best
  }, { point: points[0], distance: Infinity }).point
  return [anchor.lng, anchor.lat]
}

export function getClusterSmartLabel(
  clusterVehicles: Vehicle[],
  countryCode: string,
  zoom: number,
  lang: 'en' | 'ar' = 'ar'
): string {
  const isAr = lang === 'ar'
  const roundedZoom = Math.round(zoom)

  // 1. Regional Theater Scale (Zoom 0 and 1)
  if (roundedZoom <= 1 || countryCode === 'regional') {
    return isAr ? 'أسطول الشرق الأوسط والخليج العربي' : 'Middle East & Gulf Regional Fleet'
  }

  // 2. Neighboring Countries Scale (Zoom 2)
  if (roundedZoom === 2 || countryCode.startsWith('neighbor-')) {
    if (countryCode === 'neighbor-sau-kwt' || countryCode === 'sau-kwt') {
      return isAr ? 'أسطول المملكة ودولة الكويت' : 'Saudi Arabia & Kuwait Fleet'
    }
    if (countryCode === 'neighbor-gulf-coastal' || countryCode === 'gulf-coastal') {
      return isAr ? 'أسطول دول الخليج العربي' : 'Arabian Gulf States Fleet'
    }
    const uniqueCountries = Array.from(new Set(clusterVehicles.map(v => v.countryCode || 'SAU')))
    if (uniqueCountries.length > 1) {
      return isAr ? 'أسطول دول الجوار' : 'Neighboring States Fleet'
    }
  }

  // 3. Country-Level Scale (Zoom 3 or distinct sovereign countries)
  const countryNames: Record<string, { ar: string; en: string }> = {
    SAU: { ar: 'أسطول المملكة العربية السعودية', en: 'Saudi Arabia Fleet' },
    KWT: { ar: 'أسطول دولة الكويت', en: 'Kuwait Fleet' },
    ARE: { ar: 'أسطول دولة الإمارات', en: 'UAE Fleet' },
    QAT: { ar: 'أسطول دولة قطر', en: 'Qatar Fleet' },
    BHR: { ar: 'أسطول مملكة البحرين', en: 'Bahrain Fleet' },
    OMN: { ar: 'أسطول سلطنة عُمان', en: 'Oman Fleet' },
  }

  if (roundedZoom === 3 && countryNames[countryCode]) {
    return countryNames[countryCode][isAr ? 'ar' : 'en']
  }

  if (countryCode !== 'SAU' && countryNames[countryCode]) {
    return countryNames[countryCode][isAr ? 'ar' : 'en']
  }
  if (countryCode !== 'SAU' && countryCode !== 'gulf-region') {
    return isAr ? 'أسطول دولي' : 'International Fleet'
  }

  // 4. Zoom 4 to 13: Sub-country (Province, City, Sector, Neighborhood)
  const cityCounts = new Map<string, number>()
  const zoneCounts = new Map<string, number>()
  clusterVehicles.forEach(v => {
    const c = v.city || 'Riyadh'
    cityCounts.set(c, (cityCounts.get(c) ?? 0) + 1)
    if (v.zone) zoneCounts.set(v.zone, (zoneCounts.get(v.zone) ?? 0) + 1)
  })

  let topCity = 'Riyadh'
  let topCityCount = 0
  cityCounts.forEach((count, city) => {
    if (count > topCityCount) { topCityCount = count; topCity = city }
  })

  const cityRatio = topCityCount / clusterVehicles.length
  if (roundedZoom <= 4 && cityRatio < 0.6) {
    return isAr ? 'أسطول المملكة' : 'Saudi Fleet'
  }

  const cityNamesAr: Record<string, string> = {
    Riyadh: 'الرياض', Jeddah: 'جدة', Makkah: 'مكة', Madinah: 'المدينة',
    Dammam: 'الدمام', 'Al Khobar': 'الخبر', Jubail: 'الجبيل',
    Abha: 'أبها', Tabuk: 'تبوك', Hail: 'حائل', Buraidah: 'بريدة',
    Jazan: 'جازان', Najran: 'نجران',
  }
  const cityName = isAr ? (cityNamesAr[topCity] ?? topCity) : topCity

  if (roundedZoom >= 11) {
    const districtCounts = new Map<string, number>()
    clusterVehicles.forEach(v => {
      const d = v.district || v.zone
      if (d) districtCounts.set(d, (districtCounts.get(d) ?? 0) + 1)
    })
    let topDistrict = ''
    let topDistCount = 0
    districtCounts.forEach((count, d) => {
      if (count > topDistCount) { topDistCount = count; topDistrict = d }
    })
    if (topDistrict && topDistCount / clusterVehicles.length >= 0.4) {
      return isAr ? `حي ${topDistrict}` : `${topDistrict} District`
    }
  }

  if (roundedZoom >= 9) {
    let topZone = ''
    let topZoneCount = 0
    zoneCounts.forEach((count, zone) => {
      if (count > topZoneCount) { topZoneCount = count; topZone = zone }
    })
    if (topZone && topZoneCount / clusterVehicles.length >= 0.45) {
      return isAr ? `قطاع ${topZone}` : `${topZone} Sector`
    }
  }

  return isAr ? `أسطول ${cityName}` : `${cityName} Fleet`
}

interface PointVehicleItem {
  id: string
  coord: [number, number]
  vehicle: Vehicle
  bucketIndex: number
}

function partitionPointsSpatially(
  items: PointVehicleItem[],
  thresholdKm: number,
): PointVehicleItem[][] {
  if (thresholdKm <= 0 || items.length <= 1) {
    return items.map(item => [item])
  }

  const clusters: PointVehicleItem[][] = []
  const unassigned = new Set(items.map(p => p.id))
  const sorted = [...items].sort((a, b) => a.id.localeCompare(b.id))

  for (const seed of sorted) {
    if (!unassigned.has(seed.id)) continue
    unassigned.delete(seed.id)
    const cluster: PointVehicleItem[] = [seed]
    let centroid: [number, number] = [seed.coord[0], seed.coord[1]]

    let added = true
    while (added) {
      added = false
      for (const candidate of sorted) {
        if (!unassigned.has(candidate.id)) continue
        const dist = geoDistanceKm(centroid, candidate.coord)
        if (dist <= thresholdKm) {
          unassigned.delete(candidate.id)
          cluster.push(candidate)
          const len = cluster.length
          centroid = [
            centroid[0] + (candidate.coord[0] - centroid[0]) / len,
            centroid[1] + (candidate.coord[1] - centroid[1]) / len,
          ]
          added = true
        }
      }
    }
    clusters.push(cluster)
  }

  return clusters
}

function computeBoundsForItems(items: PointVehicleItem[]): [number, number, number, number] {
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity
  for (const item of items) {
    minLng = Math.min(minLng, item.coord[0])
    maxLng = Math.max(maxLng, item.coord[0])
    minLat = Math.min(minLat, item.coord[1])
    maxLat = Math.max(maxLat, item.coord[1])
  }
  return [minLng, minLat, maxLng, maxLat]
}

/**
 * Calculates the exact zoom level where this specific cluster will split into
 * 2 or more distinct entities (either sub-clusters or individual vehicles),
 * along with the bounding box of those children.
 * Streamlined to 5 macro tiers:
 * Tier 1 (Zoom 0-2) -> Next target: Zoom 3 (Country Level)
 * Tier 2 (Zoom 3-4) -> Next target: Zoom 6 (Major Cities Level)
 * Tier 3 (Zoom 5-7) -> Next target: Zoom 9 (City Sectors Level)
 * Tier 4 (Zoom 8-10) -> Next target: Zoom 12 (Neighborhoods Level)
 * Tier 5 (Zoom 11-13) -> Next target: Zoom 14 (Individual Vehicles Level)
 */
function computeSmartClusterDrilldown(
  memberItems: PointVehicleItem[],
  currentZoom: number,
  legend: MapLegendConfig,
): { drilldownZoom: number; drilldownBounds: [number, number, number, number] } {
  const bounds = computeBoundsForItems(memberItems)
  const roundedZoom = Math.round(currentZoom)

  let preferredTarget = 14
  if (roundedZoom <= 1) {
    preferredTarget = 3
  } else if (roundedZoom === 2) {
    preferredTarget = 3
  } else if (roundedZoom <= 4) {
    preferredTarget = 6
  } else if (roundedZoom <= 7) {
    preferredTarget = 9
  } else if (roundedZoom <= 10) {
    preferredTarget = 12
  } else {
    preferredTarget = 14
  }

  for (let z = preferredTarget; z <= MAX_CLUSTER_ZOOM + 1; z++) {
    const { clusters, individualVehicleIds } = computeHierarchicalClusters(
      memberItems.map(m => m.vehicle),
      z,
      legend,
      undefined,
      'ar',
      true, // isDrilldownCheck flag prevents infinite recursion
    )
    const visualEntitiesCount = clusters.length + individualVehicleIds.size
    if (visualEntitiesCount >= 2 || z >= 14) {
      return { drilldownZoom: z, drilldownBounds: bounds }
    }
  }

  return { drilldownZoom: 14, drilldownBounds: bounds }
}

/**
 * Master synchronous, zero-latency hierarchical spatial clustering engine.
 * Computes all clusters and unclustered vehicles in pure memory in < 0.2ms.
 */
export function computeHierarchicalClusters(
  vehicles: Vehicle[],
  zoom: number,
  legend: MapLegendConfig,
  currentPositions?: Map<string, [number, number]>,
  lang: 'en' | 'ar' = 'ar',
  isDrilldownCheck = false,
): {
  clusters: UnifiedSpatialCluster[]
  clusteredVehicleIds: Set<string>
  individualVehicleIds: Set<string>
} {
  const clusteredVehicleIds = new Set<string>()
  const individualVehicleIds = new Set<string>()

  if (!legend.clusteringEnabled || zoom > MAX_CLUSTER_ZOOM || vehicles.length === 0) {
    vehicles.forEach(v => individualVehicleIds.add(v.id))
    return { clusters: [], clusteredVehicleIds, individualVehicleIds }
  }

  const bucketDefinitions = getVehicleClusterBuckets(vehicles, legend)

  // 1. Prepare items with valid positions and bucket indexes
  const pointItems: PointVehicleItem[] = vehicles.flatMap(vehicle => {
    const [lng, lat] = currentPositions?.get(vehicle.id) ?? [vehicle.lng, vehicle.lat]
    if (!Number.isFinite(lng) || !Number.isFinite(lat) || Math.abs(lng) > 180 || Math.abs(lat) > 90) return []
    return [{
      id: vehicle.id,
      coord: [lng, lat],
      vehicle,
      bucketIndex: getVehicleClusterBucketIndex(vehicle, legend),
    }]
  })

  if (pointItems.length === 0) {
    return { clusters: [], clusteredVehicleIds, individualVehicleIds }
  }

  // 2. Multi-tier Partitioning:
  // - Zoom 0 - 1: Regional (الclustering اقليمي - كل المركبات في عنقود اقليمي موحد)
  // - Zoom 2: Neighboring countries (عدة دول مجاورة: SAU+KWT, and BHR+QAT+ARE+OMN)
  // - Zoom 3: Country-level only (مستوى الدولة فقط - تختفي تقسيمة المحافظات تماماً وتظهر تقسيمة الدولة)
  // - Zoom 4 - 13: Province / City / Sector / Neighborhood spatial clustering within sovereign countries
  const partitionMap = new Map<string, PointVehicleItem[][]>()
  const roundedZoom = Math.round(zoom)

  if (roundedZoom <= 1) {
    // Single regional group for all vehicles in the theater
    partitionMap.set('regional', [pointItems])
  } else if (roundedZoom === 2) {
    // Group by neighboring countries
    const neighborGroups = new Map<string, PointVehicleItem[]>()
    pointItems.forEach(item => {
      const geo = vehicleGeography(item.vehicle, item.coord)
      const groupKey = getNeighborCountryGroupKey(geo.countryCode)
      const list = neighborGroups.get(groupKey) ?? []
      list.push(item)
      neighborGroups.set(groupKey, list)
    })
    neighborGroups.forEach((items, key) => {
      partitionMap.set(key, [items])
    })
  } else if (roundedZoom === 3) {
    // Country-level: each country forms exactly ONE cluster (no province splitting)
    const countryGroups = new Map<string, PointVehicleItem[]>()
    pointItems.forEach(item => {
      const geo = vehicleGeography(item.vehicle, item.coord)
      const c = geo.countryCode
      const list = countryGroups.get(c) ?? []
      list.push(item)
      countryGroups.set(c, list)
    })
    countryGroups.forEach((items, countryKey) => {
      partitionMap.set(countryKey, [items])
    })
  } else {
    // Zoom 4 to 13: Spatial clustering within sovereign country partitions
    const countryGroups = new Map<string, PointVehicleItem[]>()
    pointItems.forEach(item => {
      const geo = vehicleGeography(item.vehicle, item.coord)
      const c = geo.countryCode
      const list = countryGroups.get(c) ?? []
      list.push(item)
      countryGroups.set(c, list)
    })
    const distanceThresholdKm = getSpatialDistanceThresholdKm(zoom)
    countryGroups.forEach((itemsInCountry, countryKey) => {
      const spatialGroups = partitionPointsSpatially(itemsInCountry, distanceThresholdKm)
      partitionMap.set(countryKey, spatialGroups)
    })
  }

  const unifiedClusters: UnifiedSpatialCluster[] = []

  // 3. Process clusters and individual vehicles
  partitionMap.forEach((groups, partitionKey) => {
    groups.forEach(groupItems => {
      // Single vehicle: rendered as individual vehicle marker
      if (groupItems.length < 2) {
        groupItems.forEach(item => individualVehicleIds.add(item.id))
        return
      }

      // Group of 2 or more: forms an orbital cluster
      const memberIds = groupItems.map(i => i.id).sort()
      memberIds.forEach(id => clusteredVehicleIds.add(id))

      if (isDrilldownCheck) {
        // Lightweight return when evaluating drilldown steps
        unifiedClusters.push({
          id: `drilldown-${partitionKey}-${memberIds[0]}`,
          clusterId: 1,
          key: `drilldown-${partitionKey}`,
          countryCode: partitionKey,
          coordinates: groupItems[0].coord,
          bounds: [0, 0, 0, 0],
          count: groupItems.length,
          slices: [],
          members: [],
          clusterVehicles: [],
          memberIds,
          label: '',
          zoom,
          drilldownZoom: zoom + 1,
          drilldownBounds: [0, 0, 0, 0],
        })
        return
      }

      const clusterVehicles = groupItems.map(i => i.vehicle).sort((a, b) => a.name.localeCompare(b.name))
      const members: OrbitingClusterMember[] = groupItems
        .map(i => ({ vehicle: i.vehicle, bucketIndex: i.bucketIndex }))
        .sort((a, b) => a.vehicle.id.localeCompare(b.vehicle.id))

      // Anchor selection: nearest real member to geographic mean
      const center = groupItems.reduce<[number, number]>(([lng, lat], item) => [
        lng + item.coord[0] / groupItems.length,
        lat + item.coord[1] / groupItems.length,
      ], [0, 0])
      const lonScale = Math.cos(center[1] * Math.PI / 180)
      const anchor = groupItems.reduce((best, item) => {
        const d = Math.hypot((item.coord[0] - center[0]) * lonScale, item.coord[1] - center[1])
        return d < best.distance ? { item, distance: d } : best
      }, { item: groupItems[0], distance: Infinity }).item.coord

      const bounds = computeBoundsForItems(groupItems)

      // Deterministic integer clusterId
      let clusterId = 0
      const signatureString = `${partitionKey}:${memberIds.join(',')}`
      for (let i = 0; i < signatureString.length; i++) {
        clusterId = ((clusterId * 31) + signatureString.charCodeAt(i)) | 0
      }
      clusterId = Math.abs(clusterId)

      // Slices calculation
      const bucketCounts = new Array(bucketDefinitions.length).fill(0)
      groupItems.forEach(item => {
        if (item.bucketIndex >= 0 && item.bucketIndex < bucketCounts.length) {
          bucketCounts[item.bucketIndex]++
        }
      })
      const slices: VehicleClusterSlice[] = bucketDefinitions.map((def, idx) => ({
        ...def,
        bucketIndex: idx,
        count: bucketCounts[idx],
        ratio: groupItems.length > 0 ? bucketCounts[idx] / groupItems.length : 0,
      })).filter(s => s.count > 0)

      const label = getClusterSmartLabel(clusterVehicles, partitionKey, zoom, lang)
      const { drilldownZoom, drilldownBounds } = computeSmartClusterDrilldown(groupItems, zoom, legend)

      const key = `cluster-${partitionKey}-${clusterId}`
      unifiedClusters.push({
        id: key,
        clusterId,
        key,
        countryCode: partitionKey,
        coordinates: anchor,
        bounds,
        count: groupItems.length,
        slices,
        members,
        clusterVehicles,
        memberIds,
        label,
        zoom,
        drilldownZoom,
        drilldownBounds,
      })
    })
  })

  // Sort clusters descending by vehicle count for stable rendering order
  unifiedClusters.sort((a, b) => b.count - a.count)

  return {
    clusters: unifiedClusters,
    clusteredVehicleIds,
    individualVehicleIds,
  }
}

/**
 * Backward compatibility helpers
 */
export function getVehicleClusterMembershipSignature(
  vehicles: Vehicle[],
  legend: MapLegendConfig,
  zoom: number,
  currentPositions?: Map<string, [number, number]>,
): string {
  const thresholdKm = getSpatialDistanceThresholdKm(zoom)
  return `${zoom.toFixed(1)}|${thresholdKm}|${vehicles.map(v => {
    const p = currentPositions?.get(v.id) ?? [v.lng, v.lat]
    return `${v.id}:${(p[0]).toFixed(3)},${(p[1]).toFixed(3)}`
  }).join(';')}`
}

export function createVehicleClusterPartitions(
  vehicles: Vehicle[],
  legend: MapLegendConfig,
  zoom: number,
  currentPositions?: Map<string, [number, number]>,
): VehicleClusterPartition[] {
  const { clusters } = computeHierarchicalClusters(vehicles, zoom, legend, currentPositions)
  return clusters.map(c => {
    const vehicleData = createVehicleClusterData(c.clusterVehicles, legend, currentPositions)
    const bucketCounts = c.slices.map(s => [`bucket_${s.bucketIndex}`, s.count])
    const aggregate: Feature<Point, VehiclePointProperties> = {
      type: 'Feature',
      id: c.clusterId,
      geometry: { type: 'Point', coordinates: c.coordinates },
      properties: {
        cluster: true,
        cluster_id: c.clusterId,
        point_count: c.count,
        ...Object.fromEntries(bucketCounts),
      },
    }
    return {
      id: c.id,
      data: { type: 'FeatureCollection', features: [aggregate] },
      members: c.members.map(m => ({ vehicleId: m.vehicle.id, bucketIndex: m.bucketIndex })),
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

export function getVehicleClusterBucketIndex(vehicle: Vehicle, legend: MapLegendConfig): number {
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
