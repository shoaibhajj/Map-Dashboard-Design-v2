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
  actualWeightTons: number | null
  weightLimitTons: number | null
  cameraState: CameraState
}

export interface SensorReading {
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

// Route coordinates in SVG space (viewBox 0 0 1200 750)
export interface RoutePoint { x: number; y: number }
export interface RouteEvent {
  x: number; y: number
  type: 'depot' | 'stop' | 'waypoint' | 'alert' | 'current'
  label: string; time: string
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
  zone: string
  status: VehicleStatus
  speed: number
  fuelLevel: number
  lastUpdate: string
  location: string
  lat: number; lng: number
  odometer: number
  engineHours: number
  tripDistance: number
  tripDuration: string
  tripStart: string
  sensors: SensorReading[]
  tripHistory: TripPoint[]
  route: TripRoute
  telemetry: VehicleTelemetry
}

export const vehicles: Vehicle[] = [
  {
    id: 'v001', name: 'Fleet Alpha 01', plate: 'CA-4821-X',
    driver: 'Marcus Chen', vehicleType: 'truck', zone: 'Downtown',
    status: 'moving', speed: 67, fuelLevel: 78,
    lastUpdate: '12 sec ago',
    location: '3rd Ave & Market St, San Francisco',
    telemetry: { towing: false, gpsState: 'online', batteryPercent: 100, batteryVoltage: 13.8, satellites: 12, driverAuthorization: 'authorized', waslState: 'connected', actualWeightTons: 8.8, weightLimitTons: 12, cameraState: 'working' },
    lat: 37.7749, lng: -122.4194, odometer: 48302, engineHours: 1240,
    tripDistance: 34.2, tripDuration: '1h 12m', tripStart: '08:41 AM',
    sensors: [
      { label: 'Engine Temp', value: '92', unit: '°C', min: 0, max: 120, current: 92 },
      { label: 'Battery', value: '13.8', unit: 'V', min: 11, max: 15, current: 13.8 },
      { label: 'RPM', value: '2,340', unit: 'rpm', min: 0, max: 5000, current: 2340 },
      { label: 'Oil Pressure', value: '42', unit: 'psi', min: 0, max: 80, current: 42 },
    ],
    tripHistory: [
      { time: '08:41', speed: 0, location: 'Depot — 500 Industrial Blvd' },
      { time: '09:05', speed: 58, location: 'Highway 101 N' },
      { time: '09:32', speed: 72, location: 'Bay Bridge Toll Plaza' },
      { time: '09:53', speed: 67, location: '3rd Ave & Market St' },
    ],
    route: {
      outbound: [
        { x: 220, y: 720 }, { x: 248, y: 652 }, { x: 272, y: 588 },
        { x: 310, y: 524 }, { x: 358, y: 462 }, { x: 400, y: 428 }, { x: 444, y: 397 },
      ],
      events: [
        { x: 220, y: 720, type: 'depot', label: 'Depot', time: '08:41' },
        { x: 272, y: 588, type: 'waypoint', label: 'Hwy 101', time: '09:05' },
        { x: 358, y: 462, type: 'stop', label: 'Bay Bridge Toll', time: '09:32' },
        { x: 444, y: 397, type: 'current', label: '3rd & Market', time: '09:53' },
      ],
    },
  },
  {
    id: 'v002', name: 'Fleet Beta 07', plate: 'CA-7743-M',
    driver: 'Sarah Okonkwo', vehicleType: 'van', zone: 'South Zone',
    status: 'moving', speed: 52, fuelLevel: 45,
    lastUpdate: '8 sec ago',
    location: 'Mission District, San Francisco',
    telemetry: { towing: false, gpsState: 'online', batteryPercent: 40, batteryVoltage: 12.4, satellites: 5, driverAuthorization: 'unauthorized', waslState: 'connected', actualWeightTons: 3.9, weightLimitTons: 5, cameraState: 'not_installed' },
    lat: 37.7599, lng: -122.4148, odometer: 72100, engineHours: 2840,
    tripDistance: 18.7, tripDuration: '42m', tripStart: '09:21 AM',
    sensors: [
      { label: 'Engine Temp', value: '88', unit: '°C', min: 0, max: 120, current: 88 },
      { label: 'Battery', value: '14.1', unit: 'V', min: 11, max: 15, current: 14.1 },
      { label: 'RPM', value: '1,980', unit: 'rpm', min: 0, max: 5000, current: 1980 },
      { label: 'Oil Pressure', value: '38', unit: 'psi', min: 0, max: 80, current: 38 },
    ],
    tripHistory: [
      { time: '09:21', speed: 0, location: 'Depot — 500 Industrial Blvd' },
      { time: '09:44', speed: 55, location: '101 S Corridor' },
      { time: '10:03', speed: 52, location: 'Mission District' },
    ],
    route: {
      outbound: [
        { x: 220, y: 720 }, { x: 238, y: 672 }, { x: 258, y: 624 },
        { x: 290, y: 572 }, { x: 320, y: 528 }, { x: 360, y: 480 },
      ],
      events: [
        { x: 220, y: 720, type: 'depot', label: 'Depot', time: '09:21' },
        { x: 290, y: 572, type: 'waypoint', label: '101 S', time: '09:44' },
        { x: 360, y: 480, type: 'current', label: 'Mission District', time: '10:03' },
      ],
    },
  },
  {
    id: 'v003', name: 'Fleet Gamma 14', plate: 'CA-2209-R',
    driver: 'James Patel', vehicleType: 'van', zone: 'Downtown',
    status: 'idle', speed: 0, fuelLevel: 91,
    lastUpdate: '3 min ago',
    location: 'Tenderloin, San Francisco',
    telemetry: { towing: false, gpsState: 'weak', batteryPercent: 60, batteryVoltage: 12.7, satellites: 7, driverAuthorization: 'authorized', waslState: 'not_connected', actualWeightTons: 4.6, weightLimitTons: 5, cameraState: 'working' },
    lat: 37.7838, lng: -122.4134, odometer: 29450, engineHours: 810,
    tripDistance: 0, tripDuration: '—', tripStart: '—',
    sensors: [
      { label: 'Engine Temp', value: '31', unit: '°C', min: 0, max: 120, current: 31 },
      { label: 'Battery', value: '12.6', unit: 'V', min: 11, max: 15, current: 12.6 },
      { label: 'RPM', value: '0', unit: 'rpm', min: 0, max: 5000, current: 0 },
      { label: 'Oil Pressure', value: '0', unit: 'psi', min: 0, max: 80, current: 0 },
    ],
    tripHistory: [
      { time: '07:15', speed: 0, location: 'Depot — 500 Industrial Blvd' },
      { time: '07:48', speed: 60, location: 'Van Ness Ave' },
      { time: '08:22', speed: 0, location: 'Tenderloin — Parked' },
    ],
    route: {
      outbound: [
        { x: 220, y: 720 }, { x: 250, y: 642 }, { x: 294, y: 564 },
        { x: 346, y: 474 }, { x: 402, y: 362 }, { x: 448, y: 302 }, { x: 480, y: 277 },
      ],
      events: [
        { x: 220, y: 720, type: 'depot', label: 'Depot', time: '07:15' },
        { x: 346, y: 474, type: 'waypoint', label: 'Van Ness Ave', time: '07:48' },
        { x: 480, y: 277, type: 'current', label: 'Tenderloin — Parked', time: '08:22' },
      ],
    },
  },
  {
    id: 'v004', name: 'Fleet Delta 03', plate: 'CA-9901-K',
    driver: 'Unassigned', vehicleType: 'truck', zone: 'Downtown',
    status: 'offline', speed: 0, fuelLevel: 62,
    lastUpdate: '48 min ago',
    location: 'SoMa District, San Francisco',
    telemetry: { towing: false, gpsState: 'offline', batteryPercent: 20, batteryVoltage: 11.2, satellites: 0, driverAuthorization: 'unknown', waslState: 'not_registered', actualWeightTons: null, weightLimitTons: null, cameraState: 'not_installed' },
    lat: 37.7785, lng: -122.4056, odometer: 61820, engineHours: 1990,
    tripDistance: 0, tripDuration: '—', tripStart: '—',
    sensors: [
      { label: 'Engine Temp', value: 'N/A', unit: '', min: 0, max: 120, current: 0 },
      { label: 'Battery', value: '11.2', unit: 'V', min: 11, max: 15, current: 11.2 },
      { label: 'RPM', value: 'N/A', unit: '', min: 0, max: 5000, current: 0 },
      { label: 'Oil Pressure', value: 'N/A', unit: '', min: 0, max: 80, current: 0 },
    ],
    tripHistory: [],
    route: {
      // Round-trip demonstrates return path feature
      outbound: [
        { x: 220, y: 720 }, { x: 258, y: 648 }, { x: 318, y: 558 },
        { x: 398, y: 466 }, { x: 498, y: 390 }, { x: 588, y: 345 },
      ],
      return: [
        { x: 588, y: 345 }, { x: 560, y: 412 }, { x: 498, y: 502 },
        { x: 390, y: 596 }, { x: 290, y: 672 }, { x: 220, y: 720 },
      ],
      events: [
        { x: 220, y: 720, type: 'depot', label: 'Depot', time: '06:00' },
        { x: 398, y: 466, type: 'stop', label: 'Mid-route Stop', time: '06:45' },
        { x: 588, y: 345, type: 'waypoint', label: 'SoMa — Last Known', time: '07:20' },
      ],
    },
  },
  {
    id: 'v005', name: 'Fleet Echo 22', plate: 'CA-3310-T',
    driver: 'Priya Sharma', vehicleType: 'truck', zone: 'East Bay',
    status: 'moving', speed: 81, fuelLevel: 33,
    lastUpdate: '5 sec ago',
    location: 'Bay Bridge Eastbound',
    telemetry: { towing: false, gpsState: 'online', batteryPercent: 80, batteryVoltage: 13.5, satellites: 16, driverAuthorization: 'authorized', waslState: 'connected', actualWeightTons: 11.8, weightLimitTons: 10.5, cameraState: 'not_working' },
    lat: 37.7955, lng: -122.3768, odometer: 105430, engineHours: 3100,
    tripDistance: 52.4, tripDuration: '2h 04m', tripStart: '07:58 AM',
    sensors: [
      { label: 'Engine Temp', value: '96', unit: '°C', min: 0, max: 120, current: 96 },
      { label: 'Battery', value: '13.5', unit: 'V', min: 11, max: 15, current: 13.5 },
      { label: 'RPM', value: '2,810', unit: 'rpm', min: 0, max: 5000, current: 2810 },
      { label: 'Oil Pressure', value: '45', unit: 'psi', min: 0, max: 80, current: 45 },
    ],
    tripHistory: [
      { time: '07:58', speed: 0, location: 'East Bay Depot' },
      { time: '08:30', speed: 75, location: 'I-80 W' },
      { time: '09:41', speed: 81, location: 'Bay Bridge Eastbound' },
    ],
    route: {
      outbound: [
        { x: 1060, y: 430 }, { x: 988, y: 370 }, { x: 920, y: 316 },
        { x: 858, y: 272 }, { x: 800, y: 250 }, { x: 768, y: 217 },
      ],
      events: [
        { x: 1060, y: 430, type: 'depot', label: 'East Bay Depot', time: '07:58' },
        { x: 920, y: 316, type: 'waypoint', label: 'I-80 W', time: '08:30' },
        { x: 768, y: 217, type: 'current', label: 'Bay Bridge', time: '09:41' },
      ],
    },
  },
  {
    id: 'v006', name: 'Fleet Foxtrot 09', plate: 'CA-8847-D',
    driver: 'Leon Vasquez', vehicleType: 'car', zone: 'Downtown',
    status: 'idle', speed: 0, fuelLevel: 55,
    lastUpdate: '9 min ago',
    location: 'Financial District, San Francisco',
    telemetry: { towing: true, gpsState: 'weak', batteryPercent: 55, batteryVoltage: 12.6, satellites: 3, driverAuthorization: 'unknown', waslState: 'not_connected', actualWeightTons: 4.8, weightLimitTons: 5, cameraState: 'working' },
    lat: 37.7937, lng: -122.3965, odometer: 38920, engineHours: 1050,
    tripDistance: 0, tripDuration: '—', tripStart: '—',
    sensors: [
      { label: 'Engine Temp', value: '28', unit: '°C', min: 0, max: 120, current: 28 },
      { label: 'Battery', value: '12.9', unit: 'V', min: 11, max: 15, current: 12.9 },
      { label: 'RPM', value: '0', unit: 'rpm', min: 0, max: 5000, current: 0 },
      { label: 'Oil Pressure', value: '0', unit: 'psi', min: 0, max: 80, current: 0 },
    ],
    tripHistory: [
      { time: '06:30', speed: 0, location: 'Depot — 500 Industrial Blvd' },
      { time: '07:10', speed: 48, location: 'Market St' },
      { time: '07:54', speed: 0, location: 'Financial District — Parked' },
    ],
    route: {
      outbound: [
        { x: 220, y: 720 }, { x: 268, y: 624 }, { x: 346, y: 522 },
        { x: 444, y: 424 }, { x: 560, y: 320 }, { x: 648, y: 247 },
      ],
      events: [
        { x: 220, y: 720, type: 'depot', label: 'Depot', time: '06:30' },
        { x: 444, y: 424, type: 'stop', label: 'Market St', time: '07:10' },
        { x: 648, y: 247, type: 'current', label: 'Financial District', time: '07:54' },
      ],
    },
  },
]
