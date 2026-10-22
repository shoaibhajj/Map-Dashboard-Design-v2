export type VehicleStatus = 'moving' | 'idle' | 'offline'
export type VehicleType = 'van' | 'truck' | 'car' | 'motorcycle'
export type GPSState = 'online' | 'weak' | 'offline' | 'not_installed'
export type DriverAuthorization = 'authorized' | 'unauthorized' | 'unknown'
export type WaslState = 'connected' | 'not_connected' | 'not_registered'
export type CameraState = 'working' | 'not_working' | 'not_installed'

export interface VehicleTelemetry {
  towing: boolean
  gpsState: GPSState
  batteryPercent: number | null
  batteryVoltage: number | null
  satellites: number
  driverAuthorization: DriverAuthorization
  waslState: WaslState
  waslUpdatedAt?: string | null
  actualWeightTons: number | null
  weightLimitTons: number | null
  weightUpdatedAt?: string | null
  cameraState: CameraState
}

export interface SensorReading {
  key?: string
  label: string
  value: string
  unit?: string
  min?: number
  max?: number
  current?: number
}

export interface TripPoint {
  time: string
  speed: number
  location: string
}

export interface RoutePoint {
  x?: number
  y?: number
  lng?: number
  lat?: number
}

export interface RouteEvent {
  x?: number
  y?: number
  type: 'depot' | 'stop' | 'waypoint' | 'alert' | 'current'
  label: string
  time: string
}

export interface TripRoute {
  outbound: RoutePoint[]
  return?: RoutePoint[]
  events: RouteEvent[]
}

export interface Vehicle {
  id: string
  name: string
  plate: string
  driver: string
  vehicleType: VehicleType
  groupId: string | null
  zone: string
  status: VehicleStatus
  speed: number
  bearing?: number
  fuelLevel: number
  fuelVolumeLiters?: number | null
  lastUpdate: string
  lastUpdateTimestamp?: string
  location: string
  lat: number
  lng: number
  odometer: number
  engineHours: number
  tripDistance: number
  tripDuration: string
  tripStart: string
  rawDeviceData?: { raw: string } | null
  sensors: SensorReading[]
  tripHistory: TripPoint[]
  route: TripRoute
  telemetry: VehicleTelemetry
}

export interface FleetGroup {
  id: string
  name: string
  parentId: string | null
}

export interface FleetDriver {
  id: string
  name: string
  phone?: string
}

export interface VehicleFilterQuery {
  search?: string
  status?: string
  type?: string
  groupId?: string
  includeSubgroups?: boolean | string
  zone?: string
  minFuel?: number | string
  driversOnly?: 'all' | 'assigned' | 'unassigned'
}

export interface LiveVehicleUpdate {
  id: string
  lat: number
  lng: number
  bearing: number
  speed: number
  status: VehicleStatus
  fuelLevel: number
  odometer: number
  tripDistance: number
  location: string
  lastUpdate: string
  lastUpdateTimestamp: string
  telemetry?: Partial<VehicleTelemetry>
  sensors?: SensorReading[]
}
