import { useState, useRef, useEffect, useCallback } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { Feature, Point } from 'geojson'
import * as mapboxgl from 'mapbox-gl'
import { Vehicle } from '../data/vehicles'
import { MAPBOX_TOKEN } from '../config/mapbox'
import { getVehicleMapColor, type MapLegendConfig } from '../utils/mapLegend'
import { useLanguage } from '../contexts/LanguageContext'
import VehicleClusterMarker, { getOrbitalClusterSize, type OrbitingClusterMember } from './VehicleClusterMarker'
import '../styles/orbital-vehicle-cluster.css'
import {
  createVehicleClusterData,
  createVehicleClusterPartitions,
  getClusterRadiusPixels,
  getVehicleClusterMaxZoom,
  getVehicleClusterBuckets,
  getVehicleClusterProperties,
  getVehicleClusterSummary,
  VEHICLE_CLUSTER_LAYER_ID,
  VEHICLE_CLUSTER_SOURCE_ID,
  type VehicleClusterSummary,
} from '../utils/vehicleClustering'

// ── Map style presets ─────────────────────────────────────────────────────────
type MapStyle = 'streets' | 'satellite' | 'dark' | 'terrain'
const STYLES: Record<MapStyle, { url: string; label: string }> = {
  streets:   { url: 'mapbox://styles/mapbox/streets-v12',           label: 'Streets'   },
  satellite: { url: 'mapbox://styles/mapbox/satellite-streets-v12', label: 'Satellite' },
  dark:      { url: 'mapbox://styles/mapbox/dark-v11',              label: 'Dark'      },
  terrain:   { url: 'mapbox://styles/mapbox/outdoors-v12',          label: 'Terrain'   },
}
const STYLE_ORDER: MapStyle[] = ['streets', 'satellite', 'dark', 'terrain']
const RIYADH_CENTER: [number, number] = [46.6753, 24.7136]
const DEFAULT_ZOOM = 9

// ── Route waypoints ───────────────────────────────────────────────────────────
const VEHICLE_ROUTES: Record<string, { out: [number, number][]; ret?: [number, number][] }> = {
  v001: { out: [[46.7416,24.5962],[46.7284,24.6325],[46.7048,24.6730],[46.6745,24.7118]] },
  v002: { out: [[46.6753,24.7136],[46.7008,24.6740],[46.7272,24.6312],[46.7416,24.5962]] },
  v003: { out: [[46.7335,24.6748],[46.7090,24.7200],[46.6805,24.7690],[46.6388,24.8212]] },
  v004: {
    out: [[46.6753,24.7136],[46.6980,24.7020],[46.7205,24.6840],[46.7335,24.6748]],
    ret: [[46.7335,24.6748],[46.7140,24.6910],[46.6930,24.7050],[46.6753,24.7136]],
  },
  v005: { out: [[46.6753,24.7136],[46.7140,24.7230],[46.7530,24.7320],[46.7886,24.7422]] },
  v006: { out: [[46.6753,24.7136],[46.6470,24.6950],[46.6110,24.6710],[46.5673,24.6465]] },
}

// ── Status colours ────────────────────────────────────────────────────────────
// ── Road-snapped routes (Mapbox Directions API) ───────────────────────────────
type SnappedRoutes = Record<string, [number, number][]>

async function fetchDirectionsRoute(waypoints: [number, number][]): Promise<[number, number][]> {
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('REPLACE') || waypoints.length < 2) return waypoints
  const coords = waypoints.map(([lng, lat]) => `${lng},${lat}`).join(';')
  try {
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}` +
      `?geometries=geojson&overview=full&steps=false&access_token=${MAPBOX_TOKEN}`
    )
    if (!res.ok) return waypoints
    const data = await res.json()
    const c = data.routes?.[0]?.geometry?.coordinates
    if (Array.isArray(c) && c.length >= 2) return c as [number, number][]
  } catch { /* fall back to raw waypoints */ }
  return waypoints
}

// ── Geometry helpers ──────────────────────────────────────────────────────────
function cumDists(coords: [number, number][]): number[] {
  const d = [0]
  for (let i = 1; i < coords.length; i++) {
    const dx = coords[i][0] - coords[i - 1][0]
    const dy = coords[i][1] - coords[i - 1][1]
    d.push(d[i - 1] + Math.sqrt(dx * dx + dy * dy))
  }
  return d
}

function interpolateRoute(coords: [number, number][], t: number): [number, number] {
  if (!coords.length) return [0, 0]
  if (coords.length === 1) return coords[0]
  const d = cumDists(coords)
  const total = d[d.length - 1]
  const target = Math.max(0, Math.min(1, t)) * total
  for (let i = 1; i < coords.length; i++) {
    if (d[i] >= target || i === coords.length - 1) {
      const span = d[i] - d[i - 1]
      const f = span < 1e-10 ? 0 : (target - d[i - 1]) / span
      return [
        coords[i - 1][0] + f * (coords[i][0] - coords[i - 1][0]),
        coords[i - 1][1] + f * (coords[i][1] - coords[i - 1][1]),
      ]
    }
  }
  return coords[coords.length - 1]
}

function bearingAt(coords: [number, number][], t: number): number {
  if (coords.length < 2) return 0
  const d = cumDists(coords)
  const total = d[d.length - 1]
  const target = Math.max(0, Math.min(1, t)) * total
  let i = 1
  for (; i < coords.length - 1; i++) { if (d[i] >= target) break }
  const [lng1, lat1] = coords[i - 1]
  const [lng2, lat2] = coords[i]
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const φ1 = lat1 * (Math.PI / 180)
  const φ2 = lat2 * (Math.PI / 180)
  const y = Math.sin(dLng) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dLng)
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360
}

// ── MDI vehicle icon paths (Material Design Icons, Apache 2.0) ────────────────
// Source: cdn.jsdelivr.net/npm/@mdi/svg/svg/{name}.svg
// Icons: car-side (sedan), van-passenger (van), truck-delivery (truck), motorbike
const MDI: Record<string, string> = {
  car: 'M16,6L19,10H21C22.11,10 23,10.89 23,12V15H21A3,3 0 0,1 18,18A3,3 0 0,1 15,15H9A3,3 0 0,1 6,18A3,3 0 0,1 3,15H1V12C1,10.89 1.89,10 3,10L6,6H16M10.5,7.5H6.75L4.86,10H10.5V7.5M12,7.5V10H17.14L15.25,7.5H12M6,13.5A1.5,1.5 0 0,0 4.5,15A1.5,1.5 0 0,0 6,16.5A1.5,1.5 0 0,0 7.5,15A1.5,1.5 0 0,0 6,13.5M18,13.5A1.5,1.5 0 0,0 16.5,15A1.5,1.5 0 0,0 18,16.5A1.5,1.5 0 0,0 19.5,15A1.5,1.5 0 0,0 18,13.5Z',
  van: 'M3,7C1.89,7 1,7.89 1,9V17H3A3,3 0 0,0 6,20A3,3 0 0,0 9,17H15A3,3 0 0,0 18,20A3,3 0 0,0 21,17H23V13C23,11.89 22.11,11 21,11L18,7H3M3,8.5H7V11H3V8.5M9,8.5H13V11H9V8.5M15,8.5H17.5L19.46,11H15V8.5M6,15.5A1.5,1.5 0 0,1 7.5,17A1.5,1.5 0 0,1 6,18.5A1.5,1.5 0 0,1 4.5,17A1.5,1.5 0 0,1 6,15.5M18,15.5A1.5,1.5 0 0,1 19.5,17A1.5,1.5 0 0,1 18,18.5A1.5,1.5 0 0,1 16.5,17A1.5,1.5 0 0,1 18,15.5Z',
  truck: 'M3,4A2,2 0 0,0 1,6V17H3A3,3 0 0,0 6,20A3,3 0 0,0 9,17H15A3,3 0 0,0 18,20A3,3 0 0,0 21,17H23V12L20,8H17V4M10,6L14,10L10,14V11H4V9H10M17,9.5H19.5L21.47,12H17M6,15.5A1.5,1.5 0 0,1 7.5,17A1.5,1.5 0 0,1 6,18.5A1.5,1.5 0 0,1 4.5,17A1.5,1.5 0 0,1 6,15.5M18,15.5A1.5,1.5 0 0,1 19.5,17A1.5,1.5 0 0,1 18,18.5A1.5,1.5 0 0,1 16.5,17A1.5,1.5 0 0,1 18,15.5Z',
  motorcycle: 'M17.42,10L13.41,6H9V8H12.59L14.59,10H6.5C4,10 2,12 2,14.5C2,17 4,19 6.5,19C8.72,19 10.56,17.38 10.92,15.27L13.04,14C13,14.17 13,14.33 13,14.5C13,17 15,19 17.5,19C20,19 22,17 22,14.5C22,12 20,10 17.5,10M8.84,15.26C8.5,16.27 7.58,17 6.47,17C5.09,17 3.97,15.88 3.97,14.5C3.97,13.12 5.09,12 6.47,12C7.59,12 8.5,12.74 8.84,13.75H6V15.25L8.84,15.26M17.47,17C16.09,17 14.97,15.88 14.97,14.5C14.97,13.12 16.09,12 17.47,12A2.5,2.5 0 0,1 19.97,14.5A2.5,2.5 0 0,1 17.47,17Z',
}

// ── Vehicle marker badge builder ──────────────────────────────────────────────
// Uses MDI pre-built icon paths (not custom artwork).
// The bearing arrow (.bearing-arrow group) is updated each RAF frame via DOM
// mutation (setRotation isn't used — the icon stays upright in viewport space).
// Status glow uses SMIL animation for moving vehicles (no JS needed).
//
// Badge layout (56×72 viewBox, anchor: center at 28,36):
//   • Outer glow ellipse  cy=60  (SMIL animated for moving)
//   • Drop shadow          cy=62
//   • Badge circle         cx=28 cy=28 r=22
//   • Status border ring   stroke=${color}
//   • MDI icon path        translate(12,12) scale(1.33)
//   • Bearing arrow        .bearing-arrow group, rotate around (28,28)
//   • Selected ring        outer halo
function buildMarkerSVG(vehicle: Vehicle, selected: boolean, darkMode: boolean, color: string): string {
  const moving  = vehicle.status === 'moving'
  const iconKey = vehicle.vehicleType === 'truck' ? 'truck'
                : vehicle.vehicleType === 'van'   ? 'van'
                : vehicle.vehicleType === 'motorcycle' ? 'motorcycle'
                : 'car'
  const iconPath = MDI[iconKey]
  const bg        = darkMode ? '#1e293b' : '#ffffff'
  const iconColor = darkMode ? '#e2e8f0' : '#1e293b'

  // SMIL pulse animation on glow ellipse axes + opacity (moving only)
  const pulseRx  = moving ? `<animate attributeName="rx" values="16;26;16" dur="1.8s" repeatCount="indefinite"/>` : ''
  const pulseRy  = moving ? `<animate attributeName="ry" values="3;5;3"    dur="1.8s" repeatCount="indefinite"/>` : ''
  const pulseOp  = moving ? `<animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.8s" repeatCount="indefinite"/>` : ''

  // Outer halo for selected marker
  const selectedRing = selected
    ? `<circle cx="28" cy="28" r="26" fill="none" stroke="${color}" stroke-width="2.5" opacity="0.55" stroke-dasharray="4 3"/>`
    : ''

  // The bearing arrow sits just outside the top edge of the badge circle.
  // Default rotation=0 → points north (map up). Updated each RAF frame via DOM.
  // Using class="bearing-arrow" for querySelector targeting.
  const arrow = moving
    ? `<g class="bearing-arrow" transform="rotate(0,28,28)">
        <polygon points="28,3 23.5,11.5 28,9.5 32.5,11.5" fill="${color}" opacity="0.92"/>
        <polygon points="28,3 23.5,11.5 28,9.5 32.5,11.5" fill="white" opacity="0.22"/>
       </g>`
    : ''

  return `<svg width="56" height="72" viewBox="0 0 56 72" xmlns="http://www.w3.org/2000/svg">
<!-- outer glow ring (animated for moving vehicles) -->
<ellipse cx="28" cy="60" rx="16" ry="3" fill="${color}" opacity="0.4">${pulseRx}${pulseRy}${pulseOp}</ellipse>
<!-- drop shadow -->
<ellipse cx="29" cy="62" rx="20" ry="3.8" fill="rgba(0,0,0,0.2)"/>
<!-- selected halo -->
${selectedRing}
<!-- badge background -->
<circle cx="28" cy="28" r="22" fill="${bg}" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.18))"/>
<!-- status border ring -->
<circle cx="28" cy="28" r="22" fill="none" stroke="${color}" stroke-width="2.8"/>
<!-- MDI vehicle icon (Apache 2.0 · material.io/design) centered inside badge -->
<g transform="translate(12,12) scale(1.33)">
  <path d="${iconPath}" fill="${iconColor}"/>
</g>
<!-- bearing arrow (DOM-mutated each frame for moving vehicles) -->
${arrow}
</svg>`
}

// ── Route layer helpers ───────────────────────────────────────────────────────
const SRC_OUT = 'fleet-route-out'
const SRC_RET = 'fleet-route-ret'
const MAX_CLUSTER_BUCKETS = 64

type ClusterMarkerEntry = {
  key: string
  sourceId: string
  clusterId: number
  marker: mapboxgl.Marker
  root: Root
  element: HTMLDivElement
  summary: VehicleClusterSummary
  members: OrbitingClusterMember[]
  clusterVehicles: Vehicle[]
  memberIds: string[]
  currentCoordinates: [number, number]
  targetCoordinates: [number, number]
  renderSignature: string
}

function getClusterFeatureSignature(data: ReturnType<typeof createVehicleClusterData>) {
  return JSON.stringify(data.features.map(feature => [
    feature.id,
    feature.geometry.coordinates,
    feature.properties,
  ]))
}

function getClusterPositionSnapshot(vehicles: Vehicle[], positions: Map<string, [number, number]>) {
  return new Map(vehicles.map(vehicle => [
    vehicle.id,
    positions.get(vehicle.id) ?? [vehicle.lng, vehicle.lat],
  ]))
}

function getNextClusterZoom(zoom: number, legend: MapLegendConfig) {
  if (legend.clusterGrouping === 'administrative') {
    const settings = legend.clusterZoomSettings
    if (zoom <= settings.countryMaxZoom) return settings.countryMaxZoom + 1
    if (zoom <= settings.regionMaxZoom) return settings.regionMaxZoom + 1
    if (zoom <= settings.sectorMaxZoom) return settings.sectorMaxZoom + 1
    if (zoom <= settings.neighborhoodMaxZoom) return settings.neighborhoodMaxZoom + 1
    return Math.min(22, Math.floor(zoom) + 1)
  }
  const bands = [...legend.clusterZoomSettings.distanceRanges].sort((a, b) => a.maxZoom - b.maxZoom)
  const nextBand = bands.find(range => range.maxZoom >= zoom)
  return nextBand ? nextBand.maxZoom + 1 : Math.min(22, Math.floor(zoom) + 1)
}

function getPreviousClusterZoom(zoom: number, legend: MapLegendConfig) {
  if (legend.clusterGrouping === 'administrative') {
    const settings = legend.clusterZoomSettings
    if (zoom >= settings.neighborhoodMaxZoom + 1) return settings.neighborhoodMaxZoom
    if (zoom >= settings.sectorMaxZoom + 1) return settings.sectorMaxZoom
    if (zoom >= settings.regionMaxZoom + 1) return settings.regionMaxZoom
    if (zoom >= settings.countryMaxZoom + 1) return settings.countryMaxZoom
    return Math.max(0, Math.ceil(zoom) - 1)
  }
  const bands = [...legend.clusterZoomSettings.distanceRanges].sort((a, b) => a.maxZoom - b.maxZoom)
  const previousBand = [...bands].reverse().find(range => range.maxZoom < zoom - 1)
  if (previousBand) return previousBand.maxZoom + 1
  return Math.max(0, Math.ceil(zoom) - 1)
}

function ensureVehicleClusterSource(map: mapboxgl.Map, sourceId = VEHICLE_CLUSTER_SOURCE_ID, clusterRadius = 84, clusterMaxZoom = 12) {
  const layerId = `${VEHICLE_CLUSTER_LAYER_ID}-${sourceId.slice(VEHICLE_CLUSTER_SOURCE_ID.length).replace(/^-/, '') || 'default'}`
  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
      cluster: true,
      clusterRadius,
      clusterMaxZoom,
      clusterProperties: getVehicleClusterProperties(MAX_CLUSTER_BUCKETS) as any,
    })
  }
  if (!map.getLayer(layerId)) {
    map.addLayer({
      id: layerId,
      type: 'circle',
      source: sourceId,
      paint: { 'circle-radius': 1, 'circle-opacity': 0, 'circle-stroke-opacity': 0 },
    })
  }
  return sourceId
}

function geoEmpty() { return { type: 'FeatureCollection' as const, features: [] as never[] } }
function geoLine(coords: [number, number][]) {
  return {
    type: 'FeatureCollection' as const,
    features: [{
      type: 'Feature' as const,
      geometry: { type: 'LineString' as const, coordinates: coords },
      properties: {},
    }],
  }
}

function ensureRouteLayers(map: mapboxgl.Map) {
  if (!map.getSource(SRC_OUT)) {
    map.addSource(SRC_OUT, { type: 'geojson', data: geoEmpty() as any })
    map.addLayer({
      id: `${SRC_OUT}-casing`, type: 'line', source: SRC_OUT,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#052e16', 'line-width': 6, 'line-opacity': 0.4 },
    } as any)
    map.addLayer({
      id: `${SRC_OUT}-layer`, type: 'line', source: SRC_OUT,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#16a34a', 'line-width': 3.5, 'line-opacity': 0.9 },
    } as any)
  }
  if (!map.getSource(SRC_RET)) {
    map.addSource(SRC_RET, { type: 'geojson', data: geoEmpty() as any })
    map.addLayer({
      id: `${SRC_RET}-layer`, type: 'line', source: SRC_RET,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#f59e0b', 'line-width': 3, 'line-opacity': 0.78, 'line-dasharray': [5, 4] },
    } as any)
  }
}

function updateRouteLayers(map: mapboxgl.Map, vehicle: Vehicle | null, snapped: SnappedRoutes) {
  const id   = vehicle?.id ?? ''
  const outC = snapped[id]       ?? VEHICLE_ROUTES[id]?.out ?? vehicle?.mapRoute ?? []
  const retC = snapped[`${id}-ret`] ?? VEHICLE_ROUTES[id]?.ret ?? []
  ;(map.getSource(SRC_OUT) as mapboxgl.GeoJSONSource | undefined)?.setData(
    (outC.length >= 2 ? geoLine(outC) : geoEmpty()) as any
  )
  ;(map.getSource(SRC_RET) as mapboxgl.GeoJSONSource | undefined)?.setData(
    (retC.length >= 2 ? geoLine(retC) : geoEmpty()) as any
  )
}

function ensure3DBuildings(map: mapboxgl.Map) {
  if (map.getLayer('3d-buildings')) return
  try {
    if (!map.getSource('composite')) return
    map.addLayer({
      id: '3d-buildings', source: 'composite', 'source-layer': 'building',
      filter: ['==', 'extrude', 'true'], type: 'fill-extrusion', minzoom: 14,
      paint: {
        'fill-extrusion-color': '#a8b0bb',
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': ['get', 'min_height'],
        'fill-extrusion-opacity': 0.65,
      },
    } as any)
  } catch (_) { /* style doesn't support 3D */ }
}

// ── Control button ────────────────────────────────────────────────────────────
function Btn({ children, onClick, title, active = false, style: sx = {} }: {
  children: ReactNode; onClick: () => void; title?: string
  active?: boolean; style?: CSSProperties
}) {
  return (
    <button onClick={onClick} title={title} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 36, height: 36, borderRadius: 9, border: 'none', cursor: 'pointer',
      background: active ? 'var(--primary, #16a34a)' : 'rgba(255,255,255,0.94)',
      color: active ? '#fff' : '#1e293b',
      boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
      backdropFilter: 'blur(10px)',
      fontSize: 14, flexShrink: 0,
      transition: 'background 0.16s, color 0.16s',
      ...sx,
    }}>
      {children}
    </button>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  vehicles: Vehicle[]
  selectedVehicle: Vehicle | null
  showSelectedRoute: boolean
  onVehicleSelect: (v: Vehicle) => void
  onMapClick: () => void
  darkMode: boolean
  panelInlineOffset: number
  mapLegend: MapLegendConfig
}

const ANIM_SPEED = 1 / 20000 // fraction of route per ms → full route in ~20 s

export default function MapCanvas({ vehicles, selectedVehicle, showSelectedRoute, onVehicleSelect, onMapClick, darkMode, panelInlineOffset, mapLegend }: Props) {
  const { lang } = useLanguage()
  const containerRef  = useRef<HTMLDivElement>(null)
  const mapRef        = useRef<mapboxgl.Map | null>(null)
  const markersRef    = useRef(new Map<string, mapboxgl.Marker>())
  const clusterMarkersRef = useRef(new Map<string, ClusterMarkerEntry>())
  const currentPositionsRef = useRef(new Map<string, [number, number]>())
  const clusterSourceDataSignatureRef = useRef(new Map<string, string>())
  const activeClusterSourceIdsRef = useRef<string[]>([])
  const clusterSourceSyncAtRef = useRef(0)
  const clusterSourceCheckAtRef = useRef(0)
  const clusterSourcePositionSnapshotRef = useRef(new Map<string, [number, number]>())
  const clusterSourceMembersRef = useRef(new Map<string, Array<{ vehicleId: string; bucketIndex: number }>>())
  const lastVehicleMarkerUpdateRef = useRef(0)
  const clusterDataRevisionRef = useRef(0)
  const hiddenClusterVehicleIdsRef = useRef(new Set<string>())
  const onSelectRef   = useRef(onVehicleSelect)
  onSelectRef.current = onVehicleSelect
  const onMapClickRef = useRef(onMapClick)
  onMapClickRef.current = onMapClick

  const stateRef    = useRef({ is3D: false, vehicle: null as Vehicle | null, showRoute: false })
  const snappedRef  = useRef<SnappedRoutes>({})
  const animProgRef = useRef<Record<string, number>>({})
  const rafRef      = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const vehiclesRef = useRef(vehicles)
  vehiclesRef.current = vehicles
  const darkModeRef = useRef(darkMode)
  darkModeRef.current = darkMode
  const mapLegendRef = useRef(mapLegend)
  mapLegendRef.current = mapLegend
  const langRef = useRef(lang)
  langRef.current = lang

  const [mapLoaded,     setMapLoaded]     = useState(false)
  const [zoom,          setZoom]          = useState(DEFAULT_ZOOM)
  const [is3D,          setIs3D]          = useState(false)
  const [activeStyle,   setActiveStyle]   = useState<MapStyle>(darkMode ? 'dark' : 'streets')
  const [showStyleMenu, setShowStyleMenu] = useState(false)
  const [snappedRoutes, setSnappedRoutes] = useState<SnappedRoutes>({})

  const syncVehicleClusterSources = (map: mapboxgl.Map, vehicleList: Vehicle[], legend: MapLegendConfig, zoomLevel: number) => {
    const latitude = 24.7
    const radius = getClusterRadiusPixels(zoomLevel, latitude, legend)
    const radiusKey = Math.round(radius)
    const maxZoom = getVehicleClusterMaxZoom(legend)
    const partitions = legend.clusteringEnabled
      ? createVehicleClusterPartitions(vehicleList, legend, zoomLevel, currentPositionsRef.current)
      : []
    clusterSourceMembersRef.current = new Map()
    const activeIds: string[] = []
    let changed = false
    partitions.forEach(partition => {
      const sourceId = ensureVehicleClusterSource(map, `${VEHICLE_CLUSTER_SOURCE_ID}-${partition.id}-r${radiusKey}-m${maxZoom}`, radius, maxZoom)
      activeIds.push(sourceId)
      clusterSourceMembersRef.current.set(sourceId, partition.members)
      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined
      const signature = getClusterFeatureSignature(partition.data)
      if (source && clusterSourceDataSignatureRef.current.get(sourceId) !== signature) {
        source.setData(partition.data)
        clusterSourceDataSignatureRef.current.set(sourceId, signature)
        changed = true
      }
    })
    const active = new Set(activeIds)
    activeClusterSourceIdsRef.current = activeIds
    const styleSources = map.getStyle()?.sources ?? {}
    Object.keys(styleSources).filter(id => id.startsWith(`${VEHICLE_CLUSTER_SOURCE_ID}-`) && !active.has(id)).forEach(sourceId => {
      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined
      if (source && clusterSourceDataSignatureRef.current.get(sourceId) !== 'empty') {
        source.setData({ type: 'FeatureCollection', features: [] })
        clusterSourceDataSignatureRef.current.set(sourceId, 'empty')
        changed = true
      }
    })
    if (changed) {
      clusterSourcePositionSnapshotRef.current = getClusterPositionSnapshot(vehicleList, currentPositionsRef.current)
      clusterSourceSyncAtRef.current = performance.now()
      clusterDataRevisionRef.current += 1
    }
  }

  // ── Initialise Mapbox ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('REPLACE')) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: STYLES[darkMode ? 'dark' : 'streets'].url,
      accessToken: MAPBOX_TOKEN,
      center: RIYADH_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: 0, bearing: 0,
      antialias: true,
      attributionControl: false,
    })

    mapRef.current = map
    map.on('load', () => { ensureRouteLayers(map); setMapLoaded(true) })
    map.on('zoomend', () => setZoom(map.getZoom()))
    map.on('click', () => onMapClickRef.current())
    map.on('dragstart', () => document.body.classList.add('is-map-dragging'))
    map.on('dragend', () => document.body.classList.remove('is-map-dragging'))

    return () => {
      document.body.classList.remove('is-map-dragging')
      markersRef.current.forEach(m => m.remove())
      markersRef.current.clear()
      clusterMarkersRef.current.forEach(({ marker, root }) => { root.unmount(); marker.remove() })
      clusterMarkersRef.current.clear()
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      map.remove()
      mapRef.current = null
      setMapLoaded(false)
    }
  }, [])

  // Mapbox keeps its previous canvas dimensions when adjacent flex panels
  // mount or unmount. Observe the actual map container so the canvas always
  // follows the available dashboard width.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => mapRef.current?.resize())
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // ── Fetch road-snapped routes (Mapbox Directions API) ─────────────────────
  useEffect(() => {
    if (!mapLoaded) return
    let cancelled = false

    async function fetchAll() {
      const results: SnappedRoutes = {}
      for (const [id, route] of Object.entries(VEHICLE_ROUTES)) {
        if (cancelled) break
        results[id] = await fetchDirectionsRoute(route.out)
        if (route.ret) results[`${id}-ret`] = await fetchDirectionsRoute(route.ret)
        await new Promise(r => setTimeout(r, 120)) // gentle rate-limit spacing
      }
      if (!cancelled) {
        snappedRef.current = results
        setSnappedRoutes(results)
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [mapLoaded])

  // ── Initialise animation progress for moving vehicles ─────────────────────
  useEffect(() => {
    vehicles.forEach(v => {
      if (v.status === 'moving' && animProgRef.current[v.id] === undefined) {
        animProgRef.current[v.id] = 0
      }
    })
  }, [vehicles])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const map = mapRef.current
    const currentIds = new Set(vehicles.map(vehicle => vehicle.id))
    vehicles.forEach(vehicle => {
      if (vehicle.status !== 'moving' || !currentPositionsRef.current.has(vehicle.id)) {
        currentPositionsRef.current.set(vehicle.id, [vehicle.lng, vehicle.lat])
      }
    })
    currentPositionsRef.current.forEach((_, id) => { if (!currentIds.has(id)) currentPositionsRef.current.delete(id) })
    syncVehicleClusterSources(map, vehicles, mapLegend, zoom)
  }, [vehicles, mapLegend, mapLoaded, zoom])

  // ── RAF animation loop: position + bearing arrow update ───────────────────
  // Moving vehicles are interpolated along their road-snapped route.
  // The bearing arrow is updated via DOM mutation (querySelector on the marker
  // element) — the icon itself stays upright in viewport space.
  useEffect(() => {
    if (!mapLoaded) return

    function tick(now: number) {
      const dt = lastTimeRef.current > 0 ? Math.min(now - lastTimeRef.current, 80) : 16
      lastTimeRef.current = now
      const updateVehicleMarkers = now - lastVehicleMarkerUpdateRef.current >= 80
      if (updateVehicleMarkers) lastVehicleMarkerUpdateRef.current = now

      const mapBearing = mapRef.current?.getBearing() ?? 0

      vehiclesRef.current.filter(v => v.status === 'moving').forEach(v => {
        const route = snappedRef.current[v.id] ?? VEHICLE_ROUTES[v.id]?.out ?? v.mapRoute
        if (!route || route.length < 2) return

        let prog = animProgRef.current[v.id] ?? 0
        prog = (prog + dt * ANIM_SPEED) % 1
        animProgRef.current[v.id] = prog

        const pos     = interpolateRoute(route, prog)
        currentPositionsRef.current.set(v.id, pos)
        const geoBear = bearingAt(route, prog)

        // SVG arrow rotation: geographic bearing corrected for map rotation
        // so the arrow always points the correct geographic direction on-screen.
        const svgRot = ((geoBear - mapBearing) + 360) % 360

        const marker = markersRef.current.get(v.id)
        if (marker && updateVehicleMarkers && !hiddenClusterVehicleIdsRef.current.has(v.id)) {
          marker.setLngLat(pos)
          const arrowEl = marker.getElement().querySelector('.bearing-arrow')
          if (arrowEl) arrowEl.setAttribute('transform', `rotate(${svgRot.toFixed(1)},28,28)`)
        }
      })

      // Keep cluster membership tied to live GPS positions so vehicles leave
      // their current ring when they move beyond the clustering radius.
      const currentMap = mapRef.current
      if (currentMap && now - clusterSourceCheckAtRef.current >= 350) {
        clusterSourceCheckAtRef.current = now
        const movedEnoughOnScreen = vehiclesRef.current.some(vehicle => {
          if (vehicle.status !== 'moving') return false
          const previous = clusterSourcePositionSnapshotRef.current.get(vehicle.id)
          const current = currentPositionsRef.current.get(vehicle.id)
          if (!previous || !current) return true
          const from = currentMap.project(previous)
          const to = currentMap.project(current)
          return Math.hypot(to.x - from.x, to.y - from.y) >= 3
        })
        const updateIsDue = now - clusterSourceSyncAtRef.current >= 1200
        if (movedEnoughOnScreen || updateIsDue) {
          syncVehicleClusterSources(currentMap, vehiclesRef.current, mapLegendRef.current, currentMap.getZoom())
          clusterSourceSyncAtRef.current = now
        }
      }

      const centerEase = 1 - Math.exp(-dt / 180)
      clusterMarkersRef.current.forEach(entry => {
        const [currentLng, currentLat] = entry.currentCoordinates
        const [targetLng, targetLat] = entry.targetCoordinates
        const next: [number, number] = [
          currentLng + (targetLng - currentLng) * centerEase,
          currentLat + (targetLat - currentLat) * centerEase,
        ]
        if (Math.abs(targetLng - currentLng) > 0.000005 || Math.abs(targetLat - currentLat) > 0.000005) {
          entry.currentCoordinates = next
          entry.marker.setLngLat(next)
        } else if (currentLng !== targetLng || currentLat !== targetLat) {
          entry.currentCoordinates = [...entry.targetCoordinates]
          entry.marker.setLngLat(entry.currentCoordinates)
        }
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      lastTimeRef.current = 0
      lastVehicleMarkerUpdateRef.current = 0
    }
  }, [mapLoaded])

  // ── Sync markers ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    const map = mapRef.current

    vehicles.forEach(vehicle => {
      const selected = selectedVehicle?.id === vehicle.id
      const svgStr   = buildMarkerSVG(vehicle, selected, darkMode, getVehicleMapColor(vehicle, mapLegend))

      if (markersRef.current.has(vehicle.id)) {
        const marker = markersRef.current.get(vehicle.id)!
        marker.getElement().innerHTML = svgStr
        marker.getElement().style.zIndex = selected ? '10' : '5'
        if (vehicle.status !== 'moving') {
          marker.setLngLat([vehicle.lng, vehicle.lat])
        }
      } else {
        const el = document.createElement('div')
        el.style.cssText = 'cursor:pointer;user-select:none;'
        el.innerHTML = svgStr
        el.addEventListener('click', e => { e.stopPropagation(); onSelectRef.current(vehicle) })

        const initPos: [number, number] = vehicle.status === 'moving'
          ? (() => {
              const r = VEHICLE_ROUTES[vehicle.id]?.out ?? vehicle.mapRoute
              return r ? interpolateRoute(r, animProgRef.current[vehicle.id] ?? 0) : [vehicle.lng, vehicle.lat]
            })()
          : [vehicle.lng, vehicle.lat]

        // rotationAlignment: 'viewport' keeps the badge upright as the map rotates.
        // Bearing is communicated by the DOM-mutated SVG arrow, not marker rotation.
        const marker = new mapboxgl.Marker({ element: el, anchor: 'center', rotationAlignment: 'viewport' })
          .setLngLat(initPos)
          .addTo(map)

        markersRef.current.set(vehicle.id, marker)
      }
    })

    markersRef.current.forEach((marker, id) => {
      if (!vehicles.find(v => v.id === id)) { marker.remove(); markersRef.current.delete(id) }
    })
  }, [vehicles, selectedVehicle, mapLoaded, darkMode, mapLegend])

  // Replace overlapping pins with interactive orbital summaries at cluster zooms.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    let lastSyncAt = 0
    let syncFrame = 0
    let syncTimer: number | null = null
    let snapshotRequest = 0
    let lastSnapshotSignature = ''
    let emptySnapshotSince = 0
    let emptySnapshotTimer: number | null = null
    let nextClusterMarkerKey = 0

    const restoreVehicleMarkers = () => {
      hiddenClusterVehicleIdsRef.current.forEach(id => {
        const marker = markersRef.current.get(id)
        if (!marker) return
        const position = currentPositionsRef.current.get(id)
        if (position) marker.setLngLat(position)
        marker.getElement().style.visibility = ''
        marker.getElement().style.pointerEvents = ''
        marker.getElement().removeAttribute('aria-hidden')
      })
      hiddenClusterVehicleIdsRef.current.clear()
    }

    const applyHiddenVehicles = (ids: Set<string>) => {
      hiddenClusterVehicleIdsRef.current.forEach(id => {
        if (ids.has(id)) return
        const marker = markersRef.current.get(id)
        if (!marker) return
        const position = currentPositionsRef.current.get(id)
        if (position) marker.setLngLat(position)
        marker.getElement().style.visibility = ''
        marker.getElement().style.pointerEvents = ''
        marker.getElement().removeAttribute('aria-hidden')
      })
      ids.forEach(id => {
        if (hiddenClusterVehicleIdsRef.current.has(id)) return
        const marker = markersRef.current.get(id)
        if (!marker) return
        marker.getElement().style.visibility = 'hidden'
        marker.getElement().style.pointerEvents = 'none'
        marker.getElement().setAttribute('aria-hidden', 'true')
        hiddenClusterVehicleIdsRef.current.add(id)
      })
      hiddenClusterVehicleIdsRef.current = ids
    }

    const renderClusterEntry = (entry: ClusterMarkerEntry, zoom: number) => {
      const vehicleById = new Map(vehiclesRef.current.map(vehicle => [vehicle.id, vehicle]))
      entry.members = entry.members.map(member => ({
        ...member,
        vehicle: vehicleById.get(member.vehicle.id) ?? member.vehicle,
      }))
      const size = getOrbitalClusterSize(entry.summary.slices.length, zoom)
      const signature = JSON.stringify({
        lang: langRef.current,
        count: entry.summary.count,
        size,
        statusColors: mapLegendRef.current.statusColors,
        slices: entry.summary.slices.map(slice => [slice.key, slice.label, slice.color, slice.count]),
        members: entry.members.map(({ vehicle, bucketIndex }) => [vehicle.id, bucketIndex, vehicle.name, vehicle.plate, vehicle.status, vehicle.telemetry.towing, vehicle.speed, vehicle.location]),
        clusterVehicles: entry.clusterVehicles.map(vehicle => [vehicle.id, vehicle.name, vehicle.status, vehicle.telemetry.towing, vehicle.speed, vehicle.lastUpdate]),
      })
      if (entry.renderSignature === signature) return
      entry.renderSignature = signature
      entry.element.style.width = `${size}px`
      entry.element.style.height = `${size}px`
      entry.root.render(
        <VehicleClusterMarker
          count={entry.summary.count}
          slices={entry.summary.slices}
          members={entry.members}
          clusterVehicles={entry.clusterVehicles}
          statusColors={mapLegendRef.current.statusColors}
          clusterLabel={langRef.current === 'ar' ? 'مجموعة المركبات' : 'Vehicle cluster'}
          zoom={zoom}
          lang={langRef.current}
          onClusterClick={() => {
            if (mapLegendRef.current.clusterGrouping === 'administrative') {
              map.easeTo({ center: entry.targetCoordinates, zoom: getNextClusterZoom(map.getZoom(), mapLegendRef.current), duration: 620 })
              return
            }
            const source = map.getSource(entry.sourceId) as mapboxgl.GeoJSONSource | undefined
            source?.getClusterExpansionZoom(entry.clusterId, (error, expansionZoom) => {
              if (error || typeof expansionZoom !== 'number' || !Number.isFinite(expansionZoom)) return
              const firstUnclusteredZoom = getVehicleClusterMaxZoom(mapLegendRef.current) + 1
              const nextZoom = Math.min(firstUnclusteredZoom, Math.max(map.getZoom() + 1, expansionZoom))
              map.easeTo({ center: entry.targetCoordinates, zoom: nextZoom, duration: 620 })
            })
          }}
          onVehicleSelect={vehicle => {
            const position = currentPositionsRef.current.get(vehicle.id) ?? [vehicle.lng, vehicle.lat]
            onSelectRef.current(vehicle)
            map.easeTo({ center: position, zoom: Math.max(14, map.getZoom()), duration: 620 })
          }}
        />,
      )
    }

    const removeClusterMarkers = (entries: Map<string, ClusterMarkerEntry>) => {
      entries.forEach(entry => {
        entry.root.unmount()
        entry.marker.remove()
      })
      entries.clear()
    }

    const syncClusterMarkers = () => {
      if (!map.isStyleLoaded()) return
      const sourceIds = activeClusterSourceIdsRef.current.filter(sourceId => map.getSource(sourceId))
      if (!sourceIds.length) {
        if (clusterMarkersRef.current.size) {
          removeClusterMarkers(clusterMarkersRef.current)
          applyHiddenVehicles(new Set())
        }
        return
      }

      const zoom = map.getZoom()
      let features: Feature<Point>[] = []
      if (zoom <= getVehicleClusterMaxZoom(mapLegendRef.current)) {
        try {
          features = sourceIds.flatMap(sourceId => (map.querySourceFeatures(sourceId) as unknown as Feature<Point>[])
            .filter((feature): feature is Feature<Point> =>
              feature.geometry?.type === 'Point' && Boolean(feature.properties?.cluster),
            ).map(feature => ({
              type: 'Feature',
              id: feature.id,
              geometry: feature.geometry,
              properties: { ...feature.properties, _clusterSourceId: sourceId },
            } as Feature<Point>)))
        } catch {
          // Mapbox can rebuild source tiles during a style change.
          return
        }
      }

      const unique = new Map<string, { feature: Feature<Point>; sourceId: string }>()
      features.forEach(feature => {
        const id = Number(feature.properties?.cluster_id)
        const sourceId = String(feature.properties?._clusterSourceId ?? '')
        if (Number.isFinite(id) && sourceId) unique.set(`${sourceId}:${id}`, { feature, sourceId })
      })
      const clusterBuckets = getVehicleClusterBuckets(vehiclesRef.current, mapLegendRef.current)
      const summaries = [...unique.values()]
        .map(({ feature, sourceId }) => ({ sourceId, summary: getVehicleClusterSummary(feature, vehiclesRef.current, mapLegendRef.current, clusterBuckets) }))
        .filter((item): item is { sourceId: string; summary: VehicleClusterSummary } =>
          item.summary !== null && map.getBounds().contains(item.summary.coordinates),
        )
      const snapshotSignature = JSON.stringify([
        clusterDataRevisionRef.current,
        summaries.map(summary => [
          summary.sourceId,
          summary.summary.clusterId,
          summary.summary.count,
          summary.summary.coordinates,
          getOrbitalClusterSize(summary.summary.slices.length, zoom),
        ]),
      ])
      if (snapshotSignature === lastSnapshotSignature) return

      if (!summaries.length) {
        if (zoom <= getVehicleClusterMaxZoom(mapLegendRef.current)) {
          const now = performance.now()
          if (!emptySnapshotSince) emptySnapshotSince = now
          if (now - emptySnapshotSince < 320) {
            if (emptySnapshotTimer === null) {
              emptySnapshotTimer = window.setTimeout(() => {
                emptySnapshotTimer = null
                lastSnapshotSignature = ''
                requestSync()
              }, 340)
            }
            return
          }
        }
        emptySnapshotSince = 0
        if (emptySnapshotTimer !== null) {
          window.clearTimeout(emptySnapshotTimer)
          emptySnapshotTimer = null
        }
        snapshotRequest += 1
        lastSnapshotSignature = snapshotSignature
        removeClusterMarkers(clusterMarkersRef.current)
        applyHiddenVehicles(new Set())
        return
      }

      emptySnapshotSince = 0
      if (emptySnapshotTimer !== null) {
        window.clearTimeout(emptySnapshotTimer)
        emptySnapshotTimer = null
      }
      lastSnapshotSignature = snapshotSignature
      const requestId = ++snapshotRequest
      const dataRevision = clusterDataRevisionRef.current
      const vehicleById = new Map(vehiclesRef.current.map(vehicle => [vehicle.id, vehicle]))
      const pendingLeaves = summaries.map(item => new Promise<{
        summary: VehicleClusterSummary
        sourceId: string
        members: OrbitingClusterMember[]
        clusterVehicles: Vehicle[]
        memberIds: string[]
        failed: boolean
      }>(resolve => {
        const { summary, sourceId } = item
        const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined
        if (!source) { resolve({ sourceId, summary, members: [], clusterVehicles: [], memberIds: [], failed: true }); return }
        const partitionMembers = clusterSourceMembersRef.current.get(sourceId)
        if (mapLegendRef.current.clusterGrouping === 'administrative' && partitionMembers?.length === summary.count) {
          const clusterVehicles = partitionMembers.flatMap(member => {
            const vehicle = vehicleById.get(member.vehicleId)
            return vehicle ? [vehicle] : []
          })
          const members = summary.count <= 10 ? partitionMembers.flatMap(member => {
            const vehicle = vehicleById.get(member.vehicleId)
            return vehicle ? [{ vehicle, bucketIndex: member.bucketIndex }] : []
          }) : []
          resolve({ sourceId, summary, members, clusterVehicles, memberIds: partitionMembers.map(member => member.vehicleId), failed: false })
          return
        }
        source.getClusterLeaves(summary.clusterId, summary.count, 0, (error, leaves) => {
          const members: OrbitingClusterMember[] = []
          const clusterVehicles: Vehicle[] = []
          const memberIds: string[] = []
          if (!error) leaves?.forEach(leaf => {
            const id = leaf.properties?.vehicleId
            const bucketIndex = Number(leaf.properties?.bucketIndex)
            if (typeof id !== 'string') return
            memberIds.push(id)
            const vehicle = vehicleById.get(id)
            if (vehicle) {
              clusterVehicles.push(vehicle)
              if (summary.count <= 10 && Number.isFinite(bucketIndex)) members.push({ vehicle, bucketIndex })
            }
          })
          members.sort((a, b) => a.vehicle.id.localeCompare(b.vehicle.id))
          clusterVehicles.sort((a, b) => a.name.localeCompare(b.name))
          resolve({ sourceId, summary, members, clusterVehicles, memberIds: memberIds.sort(), failed: Boolean(error) })
        })
      }))

      Promise.all(pendingLeaves).then(clusterSnapshot => {
        if (requestId !== snapshotRequest || dataRevision !== clusterDataRevisionRef.current) return
        if (clusterSnapshot.some(cluster => cluster.failed)) {
          lastSnapshotSignature = ''
          requestSync()
          return
        }

        const oldEntries = [...clusterMarkersRef.current.values()]
        const unusedKeys = new Set(oldEntries.map(entry => entry.key))
        const orderedSnapshot = [...clusterSnapshot].sort((a, b) => b.memberIds.length - a.memberIds.length)
        const nextEntries = new Map<string, ClusterMarkerEntry>()
        const nextHidden = new Set<string>()

        orderedSnapshot.forEach(cluster => {
          cluster.memberIds.forEach(id => nextHidden.add(id))
          const newIds = new Set(cluster.memberIds)
          let matched: ClusterMarkerEntry | undefined
          let bestOverlap = 0
          let bestRatio = 0
          oldEntries.forEach(candidate => {
            if (!unusedKeys.has(candidate.key)) return
            const oldIds = new Set(candidate.memberIds)
            let overlap = 0
            newIds.forEach(id => { if (oldIds.has(id)) overlap += 1 })
            const minimumOverlap = Math.min(2, Math.min(oldIds.size, newIds.size))
            if (overlap < minimumOverlap) return
            const ratio = overlap / Math.max(oldIds.size, newIds.size)
            if (overlap > bestOverlap || (overlap === bestOverlap && ratio > bestRatio)) {
              matched = candidate
              bestOverlap = overlap
              bestRatio = ratio
            }
          })

          let entry = matched
          if (entry) unusedKeys.delete(entry.key)
          else {
            const key = `orbital-cluster-${++nextClusterMarkerKey}`
            const element = document.createElement('div')
            element.className = 'orbital-cluster-marker'
            const size = getOrbitalClusterSize(cluster.summary.slices.length, zoom)
            element.style.width = `${size}px`
            element.style.height = `${size}px`
            const root = createRoot(element)
            const marker = new mapboxgl.Marker({ element, anchor: 'center' })
              .setLngLat(cluster.summary.coordinates)
              .addTo(map)
            entry = {
              key,
              sourceId: cluster.sourceId,
              clusterId: cluster.summary.clusterId,
              marker,
              root,
              element,
              summary: cluster.summary,
              members: [],
              clusterVehicles: [],
              memberIds: [],
              currentCoordinates: [...cluster.summary.coordinates],
              targetCoordinates: [...cluster.summary.coordinates],
              renderSignature: '',
            }
          }

          entry.clusterId = cluster.summary.clusterId
          entry.sourceId = cluster.sourceId
          entry.summary = cluster.summary
          entry.members = cluster.members
          entry.clusterVehicles = cluster.clusterVehicles
          entry.memberIds = cluster.memberIds
          entry.targetCoordinates = [...cluster.summary.coordinates]
          nextEntries.set(entry.key, entry)
          renderClusterEntry(entry, zoom)
        })

        oldEntries.forEach(entry => {
          if (unusedKeys.has(entry.key)) {
            entry.root.unmount()
            entry.marker.remove()
          }
        })
        clusterMarkersRef.current = nextEntries
        applyHiddenVehicles(nextHidden)
      })
    }

    const requestSync = () => {
      const now = performance.now()
      if (syncFrame || syncTimer !== null) return
      const delay = Math.max(0, 110 - (now - lastSyncAt))
      syncTimer = window.setTimeout(() => {
        syncTimer = null
        lastSyncAt = performance.now()
        syncFrame = requestAnimationFrame(() => {
          syncFrame = 0
          syncClusterMarkers()
        })
      }, delay)
    }

    map.on('moveend', requestSync)
    map.on('sourcedata', requestSync)
    requestSync()

    return () => {
      map.off('moveend', requestSync)
      map.off('sourcedata', requestSync)
      if (syncTimer !== null) window.clearTimeout(syncTimer)
      if (emptySnapshotTimer !== null) window.clearTimeout(emptySnapshotTimer)
      snapshotRequest += 1
      if (syncFrame) cancelAnimationFrame(syncFrame)
      removeClusterMarkers(clusterMarkersRef.current)
      restoreVehicleMarkers()
    }
  }, [mapLoaded])

  useEffect(() => {
    if (mapLoaded) mapRef.current?.triggerRepaint()
  }, [lang, mapLoaded])

  // ── Route + fly-to on vehicle select ─────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    stateRef.current.vehicle = selectedVehicle
    stateRef.current.showRoute = showSelectedRoute
    updateRouteLayers(mapRef.current, showSelectedRoute ? selectedVehicle : null, snappedRef.current)
    if (selectedVehicle) {
      const pos: [number, number] = selectedVehicle.status === 'moving'
        ? (() => {
            const r = snappedRef.current[selectedVehicle.id] ?? VEHICLE_ROUTES[selectedVehicle.id]?.out ?? selectedVehicle.mapRoute
            return r ? interpolateRoute(r, animProgRef.current[selectedVehicle.id] ?? 0.5) : [selectedVehicle.lng, selectedVehicle.lat]
          })()
        : [selectedVehicle.lng, selectedVehicle.lat]
      mapRef.current.easeTo({ center: pos, zoom: Math.max(mapRef.current.getZoom(), 14), duration: 700 })
    }
  }, [selectedVehicle, showSelectedRoute, mapLoaded, snappedRoutes])

  // ── Style switching ───────────────────────────────────────────────────────
  const applyStyle = useCallback((style: MapStyle) => {
    const map = mapRef.current
    if (!map) return
    setActiveStyle(style)
    setShowStyleMenu(false)
    map.setStyle(STYLES[style].url, { diff: false } as any)
    map.once('style.load', () => {
      ensureRouteLayers(map)
      clusterSourceDataSignatureRef.current.clear()
      activeClusterSourceIdsRef.current = []
      syncVehicleClusterSources(map, vehiclesRef.current, mapLegendRef.current, map.getZoom())
      updateRouteLayers(map, stateRef.current.showRoute ? stateRef.current.vehicle : null, snappedRef.current)
      if (stateRef.current.is3D) ensure3DBuildings(map)
    })
  }, [])

  // ── Auto-switch for dark mode ─────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded) return
    if (darkMode && activeStyle === 'streets') applyStyle('dark')
    else if (!darkMode && activeStyle === 'dark') applyStyle('streets')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [darkMode])

  // ── 3D tilt toggle ───────────────────────────────────────────────────────
  const toggle3D = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    const next = !is3D
    setIs3D(next)
    stateRef.current.is3D = next
    map.easeTo({ pitch: next ? 58 : 0, duration: 800 })
    if (next) ensure3DBuildings(map)
    else if (map.getLayer('3d-buildings')) map.removeLayer('3d-buildings')
  }, [is3D])

  const tokenMissing = !MAPBOX_TOKEN || MAPBOX_TOKEN.includes('REPLACE')

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Token placeholder */}
      {tokenMissing && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 18,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#e2e8f0', fontFamily: 'inherit',
        }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
            <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
          </svg>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>Mapbox Token Required</div>
          <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', maxWidth: 400, lineHeight: 1.65 }}>
            Open{' '}
            <code style={{ background: '#0f172a', borderRadius: 4, padding: '2px 7px', color: '#22c55e', fontFamily: 'monospace' }}>
              src/config/mapbox.ts
            </code>{' '}
            and replace the placeholder with your{' '}
            <a href="https://account.mapbox.com" target="_blank" rel="noreferrer"
              style={{ color: '#60a5fa', textDecoration: 'underline' }}>free Mapbox access token</a>.
          </div>
        </div>
      )}

      {/* ── Control cluster — BOTTOM LEFT ── */}
      {!tokenMissing && (
        <div style={{
          position: 'absolute', insetInlineStart: panelInlineOffset || 10, bottom: 28,
          display: 'flex', flexDirection: 'column', gap: 4, zIndex: 20,
          transition: 'inset-inline-start 180ms ease',
        }}>
          {/* Layers / style switcher */}
          <div style={{ position: 'relative' }}>
            <Btn onClick={() => setShowStyleMenu(s => !s)} active={showStyleMenu} title="Map layers">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                <line x1="9" y1="3" x2="9" y2="18"/>
                <line x1="15" y1="6" x2="15" y2="21"/>
              </svg>
            </Btn>
            {showStyleMenu && (
              <div style={{
                position: 'absolute', insetInlineStart: 42, bottom: 0,
                background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(18px)',
                borderRadius: 10, padding: '4px 0',
                boxShadow: '0 8px 32px rgba(0,0,0,0.22)', minWidth: 132, zIndex: 40,
              }}>
                {STYLE_ORDER.map(s => (
                  <button key={s} onClick={() => applyStyle(s)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '8px 12px', border: 'none', cursor: 'pointer',
                    background: s === activeStyle ? 'rgba(22,163,74,0.1)' : 'transparent',
                    color: s === activeStyle ? '#16a34a' : '#1e293b',
                    fontSize: 13, fontWeight: s === activeStyle ? 600 : 400, textAlign: 'left',
                  }}>
                    <span style={{ fontSize: 15 }}>
                      {s === 'streets' ? '🗺' : s === 'satellite' ? '🛰' : s === 'dark' ? '🌑' : '⛰'}
                    </span>
                    {STYLES[s].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3D tilt toggle */}
          <Btn onClick={toggle3D} active={is3D} title={is3D ? 'Flat view' : '3D tilt view'}>
            {is3D ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 8l10-6 10 6v8l-10 6L2 16V8z"/>
                <polyline points="12 2 12 20"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 21V9"/>
              </svg>
            )}
          </Btn>

          <div style={{ height: 1, background: 'rgba(0,0,0,0.1)', margin: '2px 3px' }}/>

          {/* Zoom + */}
          <Btn onClick={() => {
            const map = mapRef.current
            if (!map) return
            const targetZoom = mapLegendRef.current.clusteringEnabled
              ? getNextClusterZoom(map.getZoom(), mapLegendRef.current)
              : Math.min(22, Math.floor(map.getZoom()) + 1)
            map.easeTo({ zoom: targetZoom, duration: 420 })
          }} title="Zoom in">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </Btn>

          {/* Zoom level badge */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 26, fontSize: 11, fontWeight: 600, color: '#1e293b',
            background: 'rgba(255,255,255,0.9)', borderRadius: 7,
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          }}>
            {Math.round(zoom)}
          </div>

          {/* Zoom − */}
          <Btn onClick={() => {
            const map = mapRef.current
            if (!map) return
            const targetZoom = mapLegendRef.current.clusteringEnabled
              ? getPreviousClusterZoom(map.getZoom(), mapLegendRef.current)
              : Math.max(0, Math.ceil(map.getZoom()) - 1)
            map.easeTo({ zoom: targetZoom, duration: 420 })
          }} title="Zoom out">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </Btn>

          {/* Compass / reset north */}
          <Btn onClick={() => mapRef.current?.easeTo({ bearing: 0, pitch: is3D ? 58 : 0, duration: 450 })} title="Reset north">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.35"/>
              <polygon points="12,3.5 14.5,12 12,10.5 9.5,12" fill="#ef4444"/>
              <polygon points="12,20.5 9.5,12 12,13.5 14.5,12" fill="#94a3b8"/>
            </svg>
          </Btn>
        </div>
      )}

      {/* Attribution */}
      {!tokenMissing && (
        <div style={{
          position: 'absolute', bottom: 5, right: 5,
          fontSize: 10, color: '#6b7280',
          background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(4px)',
          borderRadius: 4, padding: '2px 6px',
        }}>
          © Mapbox © OpenStreetMap
        </div>
      )}
    </div>
  )
}
