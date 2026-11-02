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
import { buildVehicleMarkerHTML } from '../vehicles/components/vehicleMarkerSVG'
import '../styles/orbital-vehicle-cluster.css'
import {
  computeHierarchicalClusters,
  getClusterRadiusPixels,
  getVehicleClusterMembershipSignature,
  getVehicleClusterMaxZoom,
  getVehicleClusterBuckets,
  getVehicleClusterProperties,
  getVehicleClusterSummary,
  VEHICLE_CLUSTER_LAYER_ID,
  VEHICLE_CLUSTER_SOURCE_ID,
  type UnifiedSpatialCluster,
  type VehicleClusterPartition,
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
const MAP_STYLE_KEY = 'fleetview-map-style'

function initialMapStyle(): MapStyle {
  if (typeof window === 'undefined') return 'streets'
  try {
    const saved = window.localStorage.getItem(MAP_STYLE_KEY)
    if (saved === 'streets' || saved === 'satellite' || saved === 'dark' || saved === 'terrain') {
      return saved
    }
  } catch (_) {}
  // Default is LIGHT MODE (streets)
  return 'streets'
}

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
  const routeBounds = {
    minLng: Math.min(...waypoints.map(([lng]) => lng)) - 0.25,
    maxLng: Math.max(...waypoints.map(([lng]) => lng)) + 0.25,
    minLat: Math.min(...waypoints.map(([, lat]) => lat)) - 0.25,
    maxLat: Math.max(...waypoints.map(([, lat]) => lat)) + 0.25,
  }
  const coords = waypoints.map(([lng, lat]) => `${lng},${lat}`).join(';')
  try {
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}` +
      `?geometries=geojson&overview=full&steps=false&access_token=${MAPBOX_TOKEN}`
    )
    if (!res.ok) return waypoints
    const data = await res.json()
    const c = data.routes?.[0]?.geometry?.coordinates
    if (Array.isArray(c) && c.length >= 2) {
      const route = c as [number, number][]
      const staysNearWaypoints = route.every(([lng, lat]) =>
        Number.isFinite(lng) && Number.isFinite(lat) &&
        lng >= routeBounds.minLng && lng <= routeBounds.maxLng &&
        lat >= routeBounds.minLat && lat <= routeBounds.maxLat,
      )
      if (staysNearWaypoints) return route
    }
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

// ── Vehicle marker 2.5D builder ──────────────────────────────────────────────
// Uses the approved 2.5D silhouettes (Car, Van, Bus, Truck, Bike) and Far Arrow.
// Color reacts dynamically to active theme (--marker-color) and status color.
// Selection is handled externally via HUD brackets (.is-selected).
function getInitialVehicleHeading(v: Vehicle): number {
  if (v.heading !== undefined) return v.heading
  const route = VEHICLE_ROUTES[v.id]?.out ?? v.mapRoute
  if (route && route.length >= 2) {
    return bearingAt(route, 0)
  }
  return 0
}

function buildMarkerSVG(
  vehicle: Vehicle,
  selected: boolean,
  darkMode: boolean,
  color: string,
  isFar: boolean = false,
  heading: number = 0
): string {
  return buildVehicleMarkerHTML({
    type: vehicle.vehicleType,
    isFar,
    darkMode,
    themeColor: color,
    heading,
    selected,
  })
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

type ClusterDiagnosticPoint = {
  id: string
  name: string
  source: [number, number]
  current: [number, number]
}

type ClusterDiagnosticReport = {
  mode: string
  zoom: number
  sourceId: string
  clusterId: number
  count: number
  clusterCoordinate: [number, number]
  markerCoordinate: [number, number]
  markerCoordinateDeltaKm: number
  anchorMatchesSourceMember: boolean
  sourceBounds: [[number, number], [number, number]] | null
  currentBounds: [[number, number], [number, number]] | null
  sourceMean: [number, number] | null
  currentMean: [number, number] | null
  nearestSourceMember: { id: string; coordinate: [number, number]; distanceKm: number } | null
  nearestCurrentMember: { id: string; coordinate: [number, number]; distanceKm: number } | null
  projectedPixel: [number, number]
  renderedPixel: [number, number]
  pixelDelta: number
  members: ClusterDiagnosticPoint[]
}

type ClusterDiagnosticSnapshot = {
  zoom: number
  grouping: string
  clusters: ClusterDiagnosticReport[]
}

function distanceKm(a: [number, number], b: [number, number]) {
  const toRad = (value: number) => value * Math.PI / 180
  const dLat = toRad(b[1] - a[1])
  const dLng = toRad(b[0] - a[0])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function summarizeDiagnosticPositions(points: ClusterDiagnosticPoint[], key: 'source' | 'current', target: [number, number]) {
  if (!points.length) return { bounds: null, mean: null, nearest: null }
  const longitudes = points.map(point => point[key][0])
  const latitudes = points.map(point => point[key][1])
  const mean: [number, number] = [
    longitudes.reduce((sum, value) => sum + value, 0) / points.length,
    latitudes.reduce((sum, value) => sum + value, 0) / points.length,
  ]
  const nearestPoint = points.reduce((best, point) => {
    const distance = distanceKm(point[key], target)
    return distance < best.distance ? { point, distance } : best
  }, { point: points[0], distance: Infinity })
  return {
    bounds: [[Math.min(...longitudes), Math.min(...latitudes)], [Math.max(...longitudes), Math.max(...latitudes)]] as [[number, number], [number, number]],
    mean,
    nearest: {
      id: nearestPoint.point.id,
      coordinate: nearestPoint.point[key],
      distanceKm: Number(nearestPoint.distance.toFixed(3)),
    },
  }
}


function getClusterPositionSnapshot(vehicles: Vehicle[], positions: Map<string, [number, number]>): Map<string, [number, number]> {
  return new Map(vehicles.map(vehicle => [
    vehicle.id,
    (positions.get(vehicle.id) ?? [vehicle.lng, vehicle.lat]) as [number, number],
  ]))
}

function getNextClusterZoom(zoom: number, _legend?: MapLegendConfig) {
  if (zoom < 3.0) return 3
  if (zoom < 6.0) return 6
  if (zoom < 9.0) return 9
  if (zoom < 12.0) return 12
  if (zoom < 14.0) return 14
  return Math.min(22, Math.floor(zoom * 2 + 1e-6) / 2 + 0.5)
}

function getPreviousClusterZoom(zoom: number, _legend?: MapLegendConfig) {
  if (zoom > 14.0) return Math.max(14, Math.ceil(zoom * 2 - 1e-6) / 2 - 0.5)
  if (zoom > 12.0) return 12
  if (zoom > 9.0) return 9
  if (zoom > 6.0) return 6
  if (zoom > 3.0) return 3
  if (zoom > 2.0) return 2
  return Math.max(0, Math.floor(zoom) - 1)
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

const ANIM_SPEED = 1 / 480000 // fraction of route per ms → full route in 8 minutes (realistic 30s telemetry progression)

function getInitialVehicleProgress(vehicleId: string): number {
  let hash = 0
  for (let i = 0; i < vehicleId.length; i++) {
    hash = (hash * 37 + vehicleId.charCodeAt(i)) & 0xffff
  }
  return (hash % 1000) / 1000
}

export default function MapCanvas({ vehicles, selectedVehicle, showSelectedRoute, onVehicleSelect, onMapClick, darkMode, panelInlineOffset, mapLegend }: Props) {
  const { lang } = useLanguage()
  const clusterDiagnosticsEnabled = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('clusterDiagnostics') === '1'
  const [clusterDiagnosticSnapshot, setClusterDiagnosticSnapshot] = useState<ClusterDiagnosticSnapshot>({
    zoom: DEFAULT_ZOOM,
    grouping: mapLegend.clusterGrouping,
    clusters: [],
  })
  const [diagnosticCopyState, setDiagnosticCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const containerRef  = useRef<HTMLDivElement>(null)
  const mapRef        = useRef<mapboxgl.Map | null>(null)
  const markersRef    = useRef(new Map<string, mapboxgl.Marker>())
  const clusterMarkersRef = useRef(new Map<string, ClusterMarkerEntry>())
  const currentPositionsRef = useRef(new Map<string, [number, number]>())
  const clusterSourceDataSignatureRef = useRef(new Map<string, string>())
  const activeClusterSourceIdsRef = useRef<string[]>([])
  const activePartitionsRef = useRef<Array<{ partition: VehicleClusterPartition; sourceId: string }>>([])
  const clusterSourceCheckAtRef = useRef(0)
  const clusterSourcePositionSnapshotRef = useRef(new Map<string, [number, number]>())
  const clusterSourceMembersRef = useRef(new Map<string, Array<{ vehicleId: string; bucketIndex: number }>>())
  const clusterMembershipSignatureRef = useRef('')
  const lastVehicleMarkerUpdateRef = useRef(0)
  const clusterDataRevisionRef = useRef(0)
  const clusterPartitionSignatureRef = useRef('')
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
  const panelInlineOffsetRef = useRef(panelInlineOffset)
  panelInlineOffsetRef.current = panelInlineOffset
  const langRef = useRef(lang)
  langRef.current = lang

  const vehicleHeadingsRef = useRef<Map<string, number>>(new Map())
  const [mapLoaded,     setMapLoaded]     = useState(false)
  const [zoom,          setZoom]          = useState(DEFAULT_ZOOM)
  const [is3D,          setIs3D]          = useState(false)
  const [activeStyle,   setActiveStyle]   = useState<MapStyle>(initialMapStyle)
  const [showStyleMenu, setShowStyleMenu] = useState(false)
  const [snappedRoutes, setSnappedRoutes] = useState<SnappedRoutes>({})

  const syncClusterMarkersRef = useRef<((immediateZoom?: number) => void) | null>(null)

  const syncVehicleClusterSources = (map: mapboxgl.Map, _vehicleList: Vehicle[], _legend: MapLegendConfig, zoomLevel: number) => {
    syncClusterMarkersRef.current?.(zoomLevel)
  }

  // ── Initialise Mapbox ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('REPLACE')) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: STYLES[activeStyle].url,
      accessToken: MAPBOX_TOKEN,
      center: RIYADH_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 0,
      maxZoom: 22,
      projection: 'mercator',
      pitch: 0, bearing: 0,
      antialias: true,
      attributionControl: false,
    })

    mapRef.current = map
    const updateAllMarkerRotations = () => {
      const currentBearing = map.getBearing()
      vehiclesRef.current.forEach(v => {
        const marker = markersRef.current.get(v.id)
        if (!marker) return
        const geoHeading = vehicleHeadingsRef.current.get(v.id) ?? getInitialVehicleHeading(v)
        const svgRot = ((geoHeading - currentBearing) + 360) % 360
        const rotator = marker.getElement().querySelector('.vehicle-marker-rotator') as HTMLElement | null
        if (rotator) rotator.style.transform = `rotate(${svgRot.toFixed(1)}deg)`
      })
    }

    map.on('style.load', () => {
      try { (map as any).setProjection({ name: 'mercator' }) } catch (_) {}
    })
    map.on('load', () => {
      try { (map as any).setProjection({ name: 'mercator' }) } catch (_) {}
      ensureRouteLayers(map)
      setMapLoaded(true)
    })
    map.on('zoomend', () => {
      setZoom(map.getZoom())
    })
    map.on('rotate', updateAllMarkerRotations)
    map.on('click', () => onMapClickRef.current())
    // Disable native scrollZoom trickle so wheel zooms through streamlined tiers
    map.scrollZoom.disable()

    let targetZoom: number | null = null
    let wheelTimer: number | null = null
    let wheelDelta = 0
    let wheelActionTaken = false

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return // Allow trackpad browser zoom
      e.preventDefault()
      e.stopPropagation()

      // Aggregate small trackpad deltas and allow one zoom step per scroll burst.
      if (wheelTimer !== null) window.clearTimeout(wheelTimer)
      wheelTimer = window.setTimeout(() => {
        targetZoom = null
        wheelDelta = 0
        wheelActionTaken = false
        wheelTimer = null
      }, 300)

      const deltaScale = e.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : e.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? containerRef.current?.clientHeight ?? window.innerHeight
          : 1
      wheelDelta += e.deltaY * deltaScale
      if (wheelActionTaken || Math.abs(wheelDelta) < 48) return

      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const point: [number, number] = [e.clientX - rect.left, e.clientY - rect.top]
      const around = map.unproject(point)

      const isZoomIn = wheelDelta < 0
      const current = targetZoom ?? map.getZoom()
      const next = isZoomIn
        ? getNextClusterZoom(current)
        : getPreviousClusterZoom(current)

      if (next === current) return
      targetZoom = next
      wheelActionTaken = true

      map.easeTo({
        zoom: next,
        around,
        duration: 280,
      })

    }

    const containerEl = containerRef.current
    containerEl.addEventListener('wheel', handleWheel, { passive: false })

    map.on('dragstart', () => {
      targetZoom = null
      wheelDelta = 0
      wheelActionTaken = false
      if (wheelTimer !== null) {
        window.clearTimeout(wheelTimer)
        wheelTimer = null
      }
      document.body.classList.add('is-map-dragging')
    })
    map.on('dragend', () => document.body.classList.remove('is-map-dragging'))

    return () => {
      containerEl.removeEventListener('wheel', handleWheel)
      if (wheelTimer !== null) window.clearTimeout(wheelTimer)
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

        let prog = animProgRef.current[v.id] ?? getInitialVehicleProgress(v.id)
        prog = (prog + dt * ANIM_SPEED) % 1
        animProgRef.current[v.id] = prog

        const pos     = interpolateRoute(route, prog)
        currentPositionsRef.current.set(v.id, pos)
        const geoBear = bearingAt(route, prog)
        vehicleHeadingsRef.current.set(v.id, geoBear)

        // SVG arrow / vehicle rotation: geographic bearing corrected for map rotation
        // so the vehicle always points the correct geographic direction on-screen.
        const svgRot = ((geoBear - mapBearing) + 360) % 360

        const marker = markersRef.current.get(v.id)
        if (marker && updateVehicleMarkers && !hiddenClusterVehicleIdsRef.current.has(v.id)) {
          marker.setLngLat(pos)
          const el = marker.getElement()
          const rotator = el.querySelector('.vehicle-marker-rotator') as HTMLElement | null
          if (rotator) {
            rotator.style.transform = `rotate(${svgRot.toFixed(1)}deg)`
          } else {
            const arrowEl = el.querySelector('.bearing-arrow')
            if (arrowEl) arrowEl.setAttribute('transform', `rotate(${svgRot.toFixed(1)},28,28)`)
          }
        }
      })

      // Keep cluster membership tied to live GPS positions without jittering on micro-movements
      const currentMap = mapRef.current
      if (currentMap && now - clusterSourceCheckAtRef.current >= 400) {
        clusterSourceCheckAtRef.current = now
        const legend = mapLegendRef.current
        if (legend.clusteringEnabled) {
          const movedSignificantly = vehiclesRef.current.some(vehicle => {
            if (vehicle.status !== 'moving') return false
            const previous = clusterSourcePositionSnapshotRef.current.get(vehicle.id)
            const current = currentPositionsRef.current.get(vehicle.id)
            if (!previous || !current) return false
            return Math.hypot(current[0] - previous[0], current[1] - previous[1]) >= 0.003
          })
          if (movedSignificantly) {
            clusterSourcePositionSnapshotRef.current = getClusterPositionSnapshot(vehiclesRef.current, currentPositionsRef.current)
            syncClusterMarkersRef.current?.(currentMap.getZoom())
          }
        }
      }

      const centerEase = 1 - Math.exp(-dt / 180)
      clusterMarkersRef.current.forEach(entry => {
        const [currentLng, currentLat] = entry.currentCoordinates
        const [targetLng, targetLat] = entry.targetCoordinates
        const delta = Math.hypot(targetLng - currentLng, targetLat - currentLat)
        if (delta > 0.08) {
          entry.currentCoordinates = [...entry.targetCoordinates]
          entry.marker.setLngLat(entry.currentCoordinates)
        } else if (delta > 0.000005) {
          const next: [number, number] = [
            currentLng + (targetLng - currentLng) * centerEase,
            currentLat + (targetLat - currentLat) * centerEase,
          ]
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

    const mapBearing = map.getBearing()

    // Pre-calculate clustered vehicles on mount so they never flash as single markers
    if (hiddenClusterVehicleIdsRef.current.size === 0 && mapLegend.clusteringEnabled) {
      const initialPositions = new Map<string, [number, number]>()
      vehicles.forEach(v => initialPositions.set(v.id, [v.lng, v.lat]))
      const initialClusters = computeHierarchicalClusters(vehicles, map.getZoom(), mapLegend, initialPositions, langRef.current)
      hiddenClusterVehicleIdsRef.current = initialClusters.clusteredVehicleIds
    }

    vehicles.forEach(vehicle => {
      const selected = selectedVehicle?.id === vehicle.id
      const geoHeading = vehicleHeadingsRef.current.get(vehicle.id) ?? getInitialVehicleHeading(vehicle)
      vehicleHeadingsRef.current.set(vehicle.id, geoHeading)
      const screenHeading = ((geoHeading - mapBearing) + 360) % 360

      const isMapDark = activeStyle === 'dark' || (activeStyle !== 'streets' && darkMode)
      const svgStr = buildMarkerSVG(
        vehicle,
        selected,
        isMapDark,
        getVehicleMapColor(vehicle, mapLegend),
        mapLegend.markerShape === 'arrow',
        screenHeading
      )

      const isClustered = hiddenClusterVehicleIdsRef.current.has(vehicle.id)

      if (markersRef.current.has(vehicle.id)) {
        const marker = markersRef.current.get(vehicle.id)!
        marker.getElement().innerHTML = svgStr
        marker.getElement().style.zIndex = selected ? '10' : '5'
        if (vehicle.status !== 'moving') {
          marker.setLngLat([vehicle.lng, vehicle.lat])
        }
        if (isClustered) {
          marker.getElement().style.visibility = 'hidden'
          marker.getElement().style.pointerEvents = 'none'
          marker.getElement().setAttribute('aria-hidden', 'true')
        } else {
          marker.getElement().style.visibility = ''
          marker.getElement().style.pointerEvents = ''
          marker.getElement().removeAttribute('aria-hidden')
        }
      } else {
        const el = document.createElement('div')
        el.style.cssText = 'cursor:pointer;user-select:none;'
        el.innerHTML = svgStr
        el.addEventListener('click', e => { e.stopPropagation(); onSelectRef.current(vehicle) })

        if (isClustered) {
          el.style.visibility = 'hidden'
          el.style.pointerEvents = 'none'
          el.setAttribute('aria-hidden', 'true')
        }

        const initPos: [number, number] = vehicle.status === 'moving'
          ? (() => {
              const r = VEHICLE_ROUTES[vehicle.id]?.out ?? vehicle.mapRoute
              return r ? interpolateRoute(r, animProgRef.current[vehicle.id] ?? getInitialVehicleProgress(vehicle.id)) : [vehicle.lng, vehicle.lat]
            })()
          : [vehicle.lng, vehicle.lat]

        // rotationAlignment: 'viewport' keeps the badge upright as the map rotates.
        // Heading is applied to .vehicle-marker-rotator relative to viewport.
        const marker = new mapboxgl.Marker({ element: el, anchor: 'center', rotationAlignment: 'viewport' })
          .setLngLat(initPos)
          .addTo(map)

        markersRef.current.set(vehicle.id, marker)
      }
    })

    markersRef.current.forEach((marker, id) => {
      if (!vehicles.find(v => v.id === id)) { marker.remove(); markersRef.current.delete(id) }
    })
  }, [vehicles, selectedVehicle, mapLoaded, darkMode, activeStyle, mapLegend])

  // Replace overlapping pins with interactive orbital summaries at cluster zooms using unified hierarchical spatial engine.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    let syncFrame = 0

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
      })
      hiddenClusterVehicleIdsRef.current = ids
    }

    const removeClusterMarkers = (entries: Map<string, ClusterMarkerEntry>) => {
      entries.forEach(entry => {
        entry.root.unmount()
        entry.marker.remove()
      })
      entries.clear()
    }

    const captureClusterDiagnostics = (snapshotZoom: number) => {
      if (!clusterDiagnosticsEnabled) return
      const diagnostics: ClusterDiagnosticReport[] = [...clusterMarkersRef.current.values()].map(entry => {
        const memberPoints = entry.memberIds.flatMap(id => {
          const vehicle = vehiclesRef.current.find(item => item.id === id)
          if (!vehicle) return []
          const source: [number, number] = [vehicle.lng, vehicle.lat]
          const current = currentPositionsRef.current.get(id) ?? source
          return [{ id, name: vehicle.name, source, current }]
        })
        const sourceSummary = summarizeDiagnosticPositions(memberPoints, 'source', entry.summary.coordinates)
        const currentSummary = summarizeDiagnosticPositions(memberPoints, 'current', entry.summary.coordinates)
        const markerCoordinate = entry.marker.getLngLat().toArray() as [number, number]
        const projected = map.project(markerCoordinate)
        const mapRect = map.getContainer().getBoundingClientRect()
        const markerRect = entry.marker.getElement().getBoundingClientRect()
        const projectedPixel: [number, number] = [projected.x, projected.y]
        const renderedPixel: [number, number] = [
          markerRect.left + markerRect.width / 2 - mapRect.left,
          markerRect.top + markerRect.height / 2 - mapRect.top,
        ]
        return {
          mode: 'spatial-hierarchical',
          zoom: Number(snapshotZoom.toFixed(3)),
          sourceId: entry.sourceId,
          clusterId: entry.clusterId,
          count: entry.summary.count,
          clusterCoordinate: entry.summary.coordinates,
          markerCoordinate,
          markerCoordinateDeltaKm: Number(distanceKm(markerCoordinate, entry.summary.coordinates).toFixed(3)),
          anchorMatchesSourceMember: memberPoints.some(point =>
            Math.abs(point.source[0] - entry.summary.coordinates[0]) < 1e-7
            && Math.abs(point.source[1] - entry.summary.coordinates[1]) < 1e-7,
          ),
          sourceBounds: sourceSummary.bounds,
          currentBounds: currentSummary.bounds,
          sourceMean: sourceSummary.mean,
          currentMean: currentSummary.mean,
          nearestSourceMember: sourceSummary.nearest,
          nearestCurrentMember: currentSummary.nearest,
          projectedPixel,
          renderedPixel,
          pixelDelta: Number(Math.hypot(
            renderedPixel[0] - projectedPixel[0],
            renderedPixel[1] - projectedPixel[1],
          ).toFixed(2)),
          members: memberPoints,
        }
      })
      const snapshot = {
        zoom: Number(snapshotZoom.toFixed(3)),
        grouping: 'spatial-hierarchical',
        clusters: diagnostics,
      }
      setClusterDiagnosticSnapshot(snapshot)
    }

    const renderClusterEntry = (entry: ClusterMarkerEntry, zoom: number, clusterData: UnifiedSpatialCluster) => {
      const size = getOrbitalClusterSize(entry.summary.slices.length, zoom)
      const signature = `${entry.summary.count}-${entry.summary.slices.map(s => `${s.key}:${s.count}`).join(',')}-${zoom.toFixed(1)}-${langRef.current}-${clusterData.label}`
      if (entry.renderSignature === signature) return
      entry.renderSignature = signature
      entry.element.style.width = `${size}px`
      entry.element.style.height = `${size}px`
      entry.element.style.overflow = 'visible'

      const drilldownZoom = clusterData.drilldownZoom
      const drilldownBounds = clusterData.drilldownBounds

      entry.root.render(
        <VehicleClusterMarker
          count={entry.summary.count}
          slices={entry.summary.slices}
          members={entry.members}
          clusterVehicles={entry.clusterVehicles}
          statusColors={mapLegendRef.current.statusColors}
          clusterLabel={clusterData.label}
          zoom={zoom}
          lang={langRef.current}
          onClusterClick={() => {
            const bounds = new mapboxgl.LngLatBounds()
            bounds.extend([drilldownBounds[0], drilldownBounds[1]])
            bounds.extend([drilldownBounds[2], drilldownBounds[3]])
            const direction = langRef.current === 'ar' ? 'rtl' : 'ltr'
            const panelPadding = Math.max(0, panelInlineOffsetRef.current)
            const padding: mapboxgl.PaddingOptions = {
              top: 84,
              bottom: 64,
              left: 32 + (direction === 'ltr' ? panelPadding : 0),
              right: 32 + (direction === 'rtl' ? panelPadding : 0),
            }
            const camera = bounds.isEmpty() ? undefined : map.cameraForBounds(bounds, {
              padding,
              maxZoom: Math.max(drilldownZoom, map.getZoom() + 1),
            })
            map.easeTo({
              center: camera?.center ?? entry.targetCoordinates,
              zoom: Math.max(drilldownZoom, camera?.zoom ?? drilldownZoom),
              duration: 580,
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

    const syncClusterMarkers = (immediateZoom?: number) => {
      const zoom = immediateZoom ?? map.getZoom()
      const { clusters, clusteredVehicleIds } = computeHierarchicalClusters(
        vehiclesRef.current,
        zoom,
        mapLegendRef.current,
        currentPositionsRef.current,
        langRef.current
      )

      applyHiddenVehicles(clusteredVehicleIds)

      const oldEntries = [...clusterMarkersRef.current.values()]
      const unusedKeys = new Set(oldEntries.map(e => e.key))
      const nextEntries = new Map<string, ClusterMarkerEntry>()

      clusters.forEach(cluster => {
        let matched = oldEntries.find(c => unusedKeys.has(c.key) && c.clusterId === cluster.clusterId)
        if (!matched) {
          const newIds = new Set(cluster.memberIds)
          let bestOverlap = 0
          oldEntries.forEach(candidate => {
            if (!unusedKeys.has(candidate.key)) return
            let overlap = 0
            candidate.memberIds.forEach(id => { if (newIds.has(id)) overlap++ })
            if (overlap >= Math.min(2, Math.min(candidate.memberIds.length, newIds.size)) && overlap > bestOverlap) {
              bestOverlap = overlap
              matched = candidate
            }
          })
        }

        let entry = matched
        if (entry) {
          unusedKeys.delete(entry.key)
          entry.targetCoordinates = [...cluster.coordinates]
          const dist = Math.hypot(
            entry.currentCoordinates[0] - cluster.coordinates[0],
            entry.currentCoordinates[1] - cluster.coordinates[1]
          )
          if (entry.clusterId !== cluster.clusterId || dist > 0.05) {
            entry.currentCoordinates = [...cluster.coordinates]
            entry.marker.setLngLat(entry.currentCoordinates)
          }
        } else {
          const key = `orbital-${cluster.key}`
          const element = document.createElement('div')
          element.className = 'orbital-cluster-marker'
          const size = getOrbitalClusterSize(cluster.slices.length, zoom)
          element.style.width = `${size}px`
          element.style.height = `${size}px`
          element.style.overflow = 'visible'
          const root = createRoot(element)
          const marker = new mapboxgl.Marker({ element, anchor: 'center' })
            .setLngLat(cluster.coordinates)
            .addTo(map)
          entry = {
            key,
            sourceId: cluster.id,
            clusterId: cluster.clusterId,
            marker,
            root,
            element,
            summary: {
              clusterId: cluster.clusterId,
              count: cluster.count,
              coordinates: cluster.coordinates,
              slices: cluster.slices,
            },
            members: cluster.members,
            clusterVehicles: cluster.clusterVehicles,
            memberIds: cluster.memberIds,
            currentCoordinates: [...cluster.coordinates],
            targetCoordinates: [...cluster.coordinates],
            renderSignature: '',
          }
        }

        entry.clusterId = cluster.clusterId
        entry.sourceId = cluster.id
        entry.summary = {
          clusterId: cluster.clusterId,
          count: cluster.count,
          coordinates: cluster.coordinates,
          slices: cluster.slices,
        }
        entry.members = cluster.members
        entry.clusterVehicles = cluster.clusterVehicles
        entry.memberIds = cluster.memberIds
        entry.targetCoordinates = [...cluster.coordinates]

        nextEntries.set(entry.key, entry)
        renderClusterEntry(entry, zoom, cluster)
      })

      oldEntries.forEach(entry => {
        if (unusedKeys.has(entry.key)) {
          entry.root.unmount()
          entry.marker.remove()
        }
      })

      clusterMarkersRef.current = nextEntries
      captureClusterDiagnostics(zoom)
    }

    syncClusterMarkersRef.current = syncClusterMarkers

    const requestSync = () => {
      if (syncFrame) return
      syncFrame = requestAnimationFrame(() => {
        syncFrame = 0
        syncClusterMarkers()
      })
    }

    map.on('zoom', requestSync)
    map.on('zoomend', requestSync)
    map.on('moveend', requestSync)
    map.on('fleet-cluster-refresh', requestSync)

    // Execute immediately on mount without waiting for Mapbox style loading
    syncClusterMarkers(map.getZoom())

    return () => {
      syncClusterMarkersRef.current = null
      map.off('zoom', requestSync)
      map.off('zoomend', requestSync)
      map.off('moveend', requestSync)
      map.off('fleet-cluster-refresh', requestSync)
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
    try {
      window.localStorage.setItem(MAP_STYLE_KEY, style)
    } catch (_) {}
    setShowStyleMenu(false)
    map.setStyle(STYLES[style].url, { diff: false } as any)
    map.once('style.load', () => {
      try { (map as any).setProjection({ name: 'mercator' }) } catch (_) {}
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

      {clusterDiagnosticsEnabled && (
        <section
          aria-label="Temporary cluster diagnostics"
          onWheel={event => event.stopPropagation()}
          style={{
            position: 'absolute', top: 72, insetInlineEnd: 14, zIndex: 1200,
            width: 'min(440px, calc(100vw - 28px))', maxHeight: '62vh', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', gap: 8, padding: 12,
            border: '1px solid rgba(45, 212, 191, .42)', borderRadius: 12,
            background: 'rgba(3, 18, 25, .96)', color: '#e6f5f5',
            boxShadow: '0 12px 40px rgba(0,0,0,.42)', font: '11px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <strong>Cluster diagnosis | {clusterDiagnosticSnapshot.grouping} | z {clusterDiagnosticSnapshot.zoom.toFixed(3)}</strong>
            <button
              type="button"
              onClick={() => {
                const payload = JSON.stringify({
                  capturedAt: new Date().toISOString(),
                  zoom: clusterDiagnosticSnapshot.zoom,
                  grouping: clusterDiagnosticSnapshot.grouping,
                  clusters: clusterDiagnosticSnapshot.clusters,
                }, null, 2)
                void navigator.clipboard.writeText(payload)
                  .then(() => setDiagnosticCopyState('copied'))
                  .catch(() => setDiagnosticCopyState('failed'))
              }}
              style={{ border: '1px solid #24545b', borderRadius: 6, background: '#0b3038', color: '#73f0d6', padding: '5px 8px', cursor: 'pointer', font: 'inherit' }}
            >
              {diagnosticCopyState === 'copied' ? 'Copied' : diagnosticCopyState === 'failed' ? 'Copy failed' : 'Copy JSON'}
            </button>
          </div>
          <div style={{ color: '#9db9bd' }}>{clusterDiagnosticSnapshot.clusters.length} rendered clusters | pixel error compares marker DOM position with map projection.</div>
          <div style={{ overflow: 'auto', minHeight: 0, display: 'grid', gap: 6 }}>
            {clusterDiagnosticSnapshot.clusters.map((report, index) => (
              <details key={`${report.sourceId}:${report.clusterId}:${index}`} style={{ border: '1px solid #183b43', borderRadius: 8, padding: '6px 8px' }}>
                <summary style={{ cursor: 'pointer', color: report.pixelDelta > 3 ? '#ffb86b' : '#b7ebe1' }}>
                  {report.count} vehicles | [{report.clusterCoordinate.map(value => value.toFixed(5)).join(', ')}] | pixel error {report.pixelDelta}px
                </summary>
                <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', margin: '8px 0 0', color: '#b8cfd2' }}>{JSON.stringify(report, null, 2)}</pre>
              </details>
            ))}
          </div>
        </section>
      )}

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
