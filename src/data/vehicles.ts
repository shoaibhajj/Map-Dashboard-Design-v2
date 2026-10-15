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
  /** ISO 8601 timestamp of the latest WASL update, independent of the GPS packet time. */
  waslUpdatedAt?: string | null
  actualWeightTons: number | null
  weightLimitTons: number | null
  /** ISO 8601 timestamp of the latest weight reading, independent of the GPS packet time. */
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
  groupId: string | null
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
  /** Device payload as received; kept opaque until its codec is confirmed. */
  rawDeviceData?: { raw: string } | null
  sensors: SensorReading[]
  tripHistory: TripPoint[]
  route: TripRoute
  telemetry: VehicleTelemetry
}

const mockRawDeviceData: NonNullable<Vehicle['rawDeviceData']> = { raw: '00000000000004cb0811000001a11a21bc88001bdfbaf00ebab14400000000000000000f09ef01f0011505c80045020101b300ed027112034260f1180000430ebd03f10000a413c7000000001000000fa000000001a11a22a6e8001bdfbaf00ebab14400000000000000000f09ef01f0011505c80045020101b300ed027113034260ef180000430ec303f10000a413c7000000001000000fa000000001a11a239148001bdfbaf00ebab14400000000000000000f09ef01f0011505c80045020101b300ed027114034260f5180000430ecc03f10000a413c7000000001000000fa000000001a11a247ba8001bdfbaf00ebab14400000000000000000f09ef01f0011505c80045020101b300ed027114034260fc180000430ed103f10000a413c7000000001000000fa000000001a11a256608001bdfbaf00ebab14400000000000000000f09ef01f0011505c80045020101b300ed02711503426102180000430ed703f10000a413c7000000001000000fa000000001a11a265068001bdfbaf00ebab14400000000000000000f09ef01f0011505c80045020101b300ed0271160342610b180000430edf03f10000a413c7000000001000000fa000000001a11a273ac8001bdfbaf00ebab14400000000000000000f09ef01f0011505c80045020101b300ed0271170342611f180000430ee803f10000a413c7000000001000000fa000000001a11a282528001bdfbaf00ebab14400000000000000000f09ef01f0011505c80045020101b300ed02711803426115180000430ef203f10000a413c7000000001000000fa000000001a11a290f88001bdfbaf00ebab14400000000000000000f09ef01f0011505c80045020101b300ed02711a03426123180000430efb03f10000a413c7000000001000000fa000000001a11a29f9e8001bdfbaf00ebab14400000000000000000f09ef01f0011505c80045020101b300ed02711b0342611e180000430f0603f10000a413c7000000001000000fa000000001a11a2ae448001bdfbaf00ebab14400000000000000000f09ef01f0011505c80045020101b300ed02711c0342612a180000430f1303f10000a413c7000000001000000fa000000001a11a2bcea8001bdfbaf00ebab14400000000000000000f09ef01f0011505c80045020101b300ed02711e0342612a180000430f2003f10000a413c7000000001000000fa000000001a11a2cb908001bdfbaf00ebab14400000000000000000f09ef01f0011505c80045020101b300ed02712003426143180000430f2a03f10000a413c7000000001000000fa000000001a11a2da368001bdfbaf00ebab14400000000000000000f09ef01f0011505c80045020101b300ed0271220342613f180000430f3903f10000a413c7000000001000000fa000000001a11a2e8dc8001bdfbaf00ebab14400000000000000000f09ef01f0011505c80045020101b300ed0271240342613f180000430f4703f10000a413c7000000001000000fa000000001a11a2f7828001bdfbaf00ebab14400000000000000000f09ef01f0011505c80045020101b300ed0271280342613d180000430f5503f10000a413c7000000001000000fa000000001a11a306288001bdfbaf00ebab14400000000000000000f09ef01f0011505c80045020101b300ed02712c03426141180000430f6303f10000a413c7000000001000000fa000110000a199' }

export const vehicles: Vehicle[] = [
  {
    id: 'v001', name: 'Fleet Alpha 01', plate: 'CA-4821-X',
    driver: 'Marcus Chen', vehicleType: 'truck', groupId: 'riyadh-central', zone: 'Central Riyadh',
    status: 'moving', speed: 67, fuelLevel: 78,
    lastUpdate: '12 sec ago',
    location: 'Olaya Street, Central Riyadh',
    telemetry: { towing: false, gpsState: 'online', batteryPercent: 100, batteryVoltage: 13.8, satellites: 12, driverAuthorization: 'authorized', waslState: 'connected', waslUpdatedAt: '2026-10-09T11:15:00Z', actualWeightTons: 8.8, weightLimitTons: 12, weightUpdatedAt: '2026-10-09T11:27:00Z', cameraState: 'working' },
    lat: 24.7118, lng: 46.6745, odometer: 48302, engineHours: 1240,
    tripDistance: 34.2, tripDuration: '1h 12m', tripStart: '08:41 AM',
    sensors: [
      { label: 'Engine Temp', value: '92', unit: '°C', min: 0, max: 120, current: 92 },
      { label: 'Battery', value: '13.8', unit: 'V', min: 11, max: 15, current: 13.8 },
      { label: 'RPM', value: '2,340', unit: 'rpm', min: 0, max: 5000, current: 2340 },
      { label: 'Oil Pressure', value: '42', unit: 'psi', min: 0, max: 80, current: 42 },
      { key: 'refrigerator_temperature', label: 'Refrigerator temperature', value: '-16', unit: '°C', min: -30, max: 10, current: -16 },
    ],
    tripHistory: [
      { time: '08:41', speed: 0, location: 'Riyadh Central Depot' },
      { time: '09:05', speed: 58, location: 'King Fahd Road' },
      { time: '09:32', speed: 72, location: 'Northern Ring Road' },
      { time: '09:53', speed: 67, location: 'Olaya Street' },
    ],
    route: {
      outbound: [
        { x: 220, y: 720 }, { x: 248, y: 652 }, { x: 272, y: 588 },
        { x: 310, y: 524 }, { x: 358, y: 462 }, { x: 400, y: 428 }, { x: 444, y: 397 },
      ],
      events: [
        { x: 220, y: 720, type: 'depot', label: 'Depot', time: '08:41' },
        { x: 272, y: 588, type: 'waypoint', label: 'King Fahd Road', time: '09:05' },
        { x: 358, y: 462, type: 'stop', label: 'King Fahd Road', time: '09:32' },
        { x: 444, y: 397, type: 'current', label: '3rd & Market', time: '09:53' },
      ],
    },
  },
  {
    id: 'v002', name: 'Fleet Beta 07', plate: 'CA-7743-M',
    driver: 'Sarah Okonkwo', vehicleType: 'van', groupId: 'riyadh-south', zone: 'South Riyadh',
    status: 'moving', speed: 52, fuelLevel: 45,
    lastUpdate: '8 sec ago',
    location: 'Al Aziziyah, South Riyadh',
    telemetry: { towing: false, gpsState: 'online', batteryPercent: 40, batteryVoltage: 12.4, satellites: 5, driverAuthorization: 'unauthorized', waslState: 'connected', waslUpdatedAt: '2026-10-09T10:48:00Z', actualWeightTons: 3.9, weightLimitTons: 5, weightUpdatedAt: '2026-10-09T11:10:00Z', cameraState: 'not_installed' },
    lat: 24.5962, lng: 46.7416, odometer: 72100, engineHours: 2840,
    tripDistance: 18.7, tripDuration: '42m', tripStart: '09:21 AM',
    sensors: [
      { label: 'Engine Temp', value: '88', unit: '°C', min: 0, max: 120, current: 88 },
      { label: 'Battery', value: '14.1', unit: 'V', min: 11, max: 15, current: 14.1 },
      { label: 'RPM', value: '1,980', unit: 'rpm', min: 0, max: 5000, current: 1980 },
      { label: 'Oil Pressure', value: '38', unit: 'psi', min: 0, max: 80, current: 38 },
    ],
    tripHistory: [
      { time: '09:21', speed: 0, location: 'Riyadh South Depot' },
      { time: '09:44', speed: 55, location: 'Southern Ring Road' },
      { time: '10:03', speed: 52, location: 'Al Aziziyah' },
    ],
    route: {
      outbound: [
        { x: 220, y: 720 }, { x: 238, y: 672 }, { x: 258, y: 624 },
        { x: 290, y: 572 }, { x: 320, y: 528 }, { x: 360, y: 480 },
      ],
      events: [
        { x: 220, y: 720, type: 'depot', label: 'Depot', time: '09:21' },
        { x: 290, y: 572, type: 'waypoint', label: 'Southern Ring Road', time: '09:44' },
        { x: 360, y: 480, type: 'current', label: 'Al Aziziyah', time: '10:03' },
      ],
    },
  },
  {
    id: 'v003', name: 'Fleet Gamma 14', plate: 'CA-2209-R',
    driver: 'James Patel', vehicleType: 'van', groupId: 'riyadh-north', zone: 'North Riyadh',
    status: 'idle', speed: 0, fuelLevel: 91,
    lastUpdate: '3 min ago',
    location: 'Al Yasmin, North Riyadh',
    telemetry: { towing: false, gpsState: 'weak', batteryPercent: 60, batteryVoltage: 12.7, satellites: 7, driverAuthorization: 'authorized', waslState: 'not_connected', waslUpdatedAt: '2026-10-09T09:54:00Z', actualWeightTons: 4.6, weightLimitTons: 5, weightUpdatedAt: '2026-10-09T11:02:00Z', cameraState: 'working' },
    lat: 24.8212, lng: 46.6388, odometer: 29450, engineHours: 810,
    tripDistance: 0, tripDuration: '—', tripStart: '—',
    sensors: [
      { label: 'Engine Temp', value: '31', unit: '°C', min: 0, max: 120, current: 31 },
      { label: 'Battery', value: '12.6', unit: 'V', min: 11, max: 15, current: 12.6 },
      { label: 'RPM', value: '0', unit: 'rpm', min: 0, max: 5000, current: 0 },
      { label: 'Oil Pressure', value: '0', unit: 'psi', min: 0, max: 80, current: 0 },
    ],
    tripHistory: [
      { time: '07:15', speed: 0, location: 'Riyadh North Depot' },
      { time: '07:48', speed: 60, location: 'Van Ness Ave' },
      { time: '08:22', speed: 0, location: 'Al Yasmin — Parked' },
    ],
    route: {
      outbound: [
        { x: 220, y: 720 }, { x: 250, y: 642 }, { x: 294, y: 564 },
        { x: 346, y: 474 }, { x: 402, y: 362 }, { x: 448, y: 302 }, { x: 480, y: 277 },
      ],
      events: [
        { x: 220, y: 720, type: 'depot', label: 'Depot', time: '07:15' },
        { x: 346, y: 474, type: 'waypoint', label: 'Van Ness Ave', time: '07:48' },
        { x: 480, y: 277, type: 'current', label: 'Al Yasmin — Parked', time: '08:22' },
      ],
    },
  },
  {
    id: 'v004', name: 'Fleet Delta 03', plate: 'CA-9901-K',
    driver: 'Unassigned', vehicleType: 'truck', groupId: 'riyadh-central', zone: 'Central Riyadh',
    status: 'offline', speed: 0, fuelLevel: 62,
    lastUpdate: '48 min ago',
    location: 'Al Malaz, Central Riyadh',
    telemetry: { towing: false, gpsState: 'offline', batteryPercent: 20, batteryVoltage: 11.2, satellites: 0, driverAuthorization: 'unknown', waslState: 'not_registered', waslUpdatedAt: '2026-10-08T19:32:00Z', actualWeightTons: null, weightLimitTons: null, weightUpdatedAt: null, cameraState: 'not_installed' },
    lat: 24.6748, lng: 46.7335, odometer: 61820, engineHours: 1990,
    tripDistance: 0, tripDuration: '—', tripStart: '—',
    sensors: [
      { label: 'Engine Temp', value: 'N/A', unit: '', min: 0, max: 120, current: 0 },
      { label: 'Battery', value: '11.2', unit: 'V', min: 11, max: 15, current: 11.2 },
      { label: 'RPM', value: 'N/A', unit: '', min: 0, max: 5000, current: 0 },
      { label: 'Oil Pressure', value: 'N/A', unit: '', min: 0, max: 80, current: 0 },
      { key: 'refrigerator_temperature', label: 'Refrigerator temperature', value: '-3', unit: '°C', min: -30, max: 10, current: -3 },
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
        { x: 588, y: 345, type: 'waypoint', label: 'Al Malaz — Last Known', time: '07:20' },
      ],
    },
  },
  {
    id: 'v005', name: 'Fleet Echo 22', plate: 'CA-3310-T',
    driver: 'Priya Sharma', vehicleType: 'truck', groupId: 'riyadh-east', zone: 'East Riyadh',
    status: 'moving', speed: 81, fuelLevel: 33,
    lastUpdate: '5 sec ago',
    location: 'Al Rawdah, East Riyadh',
    telemetry: { towing: false, gpsState: 'online', batteryPercent: 80, batteryVoltage: 13.5, satellites: 16, driverAuthorization: 'authorized', waslState: 'connected', waslUpdatedAt: '2026-10-09T11:30:00Z', actualWeightTons: 11.8, weightLimitTons: 10.5, weightUpdatedAt: '2026-10-09T11:29:00Z', cameraState: 'not_working' },
    lat: 24.7422, lng: 46.7886, odometer: 105430, engineHours: 3100,
    tripDistance: 52.4, tripDuration: '2h 04m', tripStart: '07:58 AM',
    sensors: [
      { label: 'Engine Temp', value: '96', unit: '°C', min: 0, max: 120, current: 96 },
      { label: 'Battery', value: '13.5', unit: 'V', min: 11, max: 15, current: 13.5 },
      { label: 'RPM', value: '2,810', unit: 'rpm', min: 0, max: 5000, current: 2810 },
      { label: 'Oil Pressure', value: '45', unit: 'psi', min: 0, max: 80, current: 45 },
      { key: 'refrigerator_temperature', label: 'Refrigerator temperature', value: '-7', unit: '°C', min: -30, max: 10, current: -7 },
    ],
    tripHistory: [
      { time: '07:58', speed: 0, location: 'Eastern Riyadh Depot' },
      { time: '08:30', speed: 75, location: 'Eastern Ring Road' },
      { time: '09:41', speed: 81, location: 'Al Rawdah' },
    ],
    route: {
      outbound: [
        { x: 1060, y: 430 }, { x: 988, y: 370 }, { x: 920, y: 316 },
        { x: 858, y: 272 }, { x: 800, y: 250 }, { x: 768, y: 217 },
      ],
      events: [
        { x: 1060, y: 430, type: 'depot', label: 'Eastern Riyadh Depot', time: '07:58' },
        { x: 920, y: 316, type: 'waypoint', label: 'Eastern Ring Road', time: '08:30' },
        { x: 768, y: 217, type: 'current', label: 'Al Rawdah', time: '09:41' },
      ],
    },
  },
  {
    id: 'v006', name: 'Fleet Foxtrot 09', plate: 'CA-8847-D',
    driver: 'Leon Vasquez', vehicleType: 'car', groupId: 'riyadh-west', zone: 'West Riyadh',
    status: 'idle', speed: 0, fuelLevel: 55,
    lastUpdate: '9 min ago',
    location: 'Dhahrat Laban, West Riyadh',
    telemetry: { towing: true, gpsState: 'weak', batteryPercent: 55, batteryVoltage: 12.6, satellites: 3, driverAuthorization: 'unknown', waslState: 'not_connected', waslUpdatedAt: '2026-10-09T10:20:00Z', actualWeightTons: 4.8, weightLimitTons: 5, weightUpdatedAt: '2026-10-09T10:55:00Z', cameraState: 'working' },
    lat: 24.6465, lng: 46.5673, odometer: 38920, engineHours: 1050,
    tripDistance: 0, tripDuration: '—', tripStart: '—',
    sensors: [
      { label: 'Engine Temp', value: '28', unit: '°C', min: 0, max: 120, current: 28 },
      { label: 'Battery', value: '12.9', unit: 'V', min: 11, max: 15, current: 12.9 },
      { label: 'RPM', value: '0', unit: 'rpm', min: 0, max: 5000, current: 0 },
      { label: 'Oil Pressure', value: '0', unit: 'psi', min: 0, max: 80, current: 0 },
    ],
    tripHistory: [
      { time: '06:30', speed: 0, location: 'Riyadh West Depot' },
      { time: '07:10', speed: 48, location: 'King Fahd Road' },
      { time: '07:54', speed: 0, location: 'Dhahrat Laban — Parked' },
    ],
    route: {
      outbound: [
        { x: 220, y: 720 }, { x: 268, y: 624 }, { x: 346, y: 522 },
        { x: 444, y: 424 }, { x: 560, y: 320 }, { x: 648, y: 247 },
      ],
      events: [
        { x: 220, y: 720, type: 'depot', label: 'Depot', time: '06:30' },
        { x: 444, y: 424, type: 'stop', label: 'King Fahd Road', time: '07:10' },
        { x: 648, y: 247, type: 'current', label: 'Dhahrat Laban', time: '07:54' },
      ],
    },
  },
]

const additionalFleetVehicles: Array<Pick<Vehicle, 'id' | 'name' | 'plate' | 'driver' | 'vehicleType' | 'groupId' | 'zone' | 'status' | 'speed' | 'fuelLevel' | 'lastUpdate' | 'location' | 'lat' | 'lng' | 'odometer' | 'engineHours' | 'tripDistance' | 'tripDuration' | 'tripStart'> & { telemetry: Partial<VehicleTelemetry> }> = [
  { id: 'v007', name: 'Fleet Hotel 18', plate: 'CA-7412-P', driver: 'Omar Ali', vehicleType: 'car', groupId: 'riyadh-central', zone: 'Central Riyadh', status: 'moving', speed: 43, fuelLevel: 68, lastUpdate: '6 sec ago', location: 'Al Olaya, Central Riyadh', lat: 24.6968, lng: 46.6851, odometer: 38210, engineHours: 940, tripDistance: 12.6, tripDuration: '34m', tripStart: '09:18 AM', telemetry: { gpsState: 'online', batteryPercent: 92, batteryVoltage: 13.6, satellites: 13, driverAuthorization: 'authorized', waslState: 'connected', actualWeightTons: 1.4, weightLimitTons: 2, cameraState: 'working' } },
  { id: 'v008', name: 'Fleet India 32', plate: 'CA-5286-V', driver: 'Mia Thompson', vehicleType: 'car', groupId: 'riyadh-north', zone: 'North Riyadh', status: 'idle', speed: 0, fuelLevel: 81, lastUpdate: '2 min ago', location: 'Al Narjis, North Riyadh', lat: 24.8654, lng: 46.6352, odometer: 51748, engineHours: 1270, tripDistance: 0, tripDuration: '—', tripStart: '—', telemetry: { gpsState: 'online', batteryPercent: 75, batteryVoltage: 12.9, satellites: 9, driverAuthorization: 'authorized', waslState: 'connected', actualWeightTons: 1.6, weightLimitTons: 2, cameraState: 'working' } },
  { id: 'v009', name: 'Fleet Juliet 05', plate: 'CA-9034-L', driver: 'Noah Williams', vehicleType: 'car', groupId: 'riyadh-south', zone: 'South Riyadh', status: 'moving', speed: 72, fuelLevel: 39, lastUpdate: '9 sec ago', location: 'Al Dar Al Baida, South Riyadh', lat: 24.5441, lng: 46.7679, odometer: 92410, engineHours: 2235, tripDistance: 29.1, tripDuration: '1h 06m', tripStart: '08:51 AM', telemetry: { gpsState: 'online', batteryPercent: 64, batteryVoltage: 13.1, satellites: 8, driverAuthorization: 'authorized', waslState: 'connected', actualWeightTons: 1.8, weightLimitTons: 2, cameraState: 'working' } },
  { id: 'v010', name: 'Fleet Kilo 41', plate: 'CA-1168-Q', driver: 'Layla Hassan', vehicleType: 'car', groupId: 'riyadh-east', zone: 'East Riyadh', status: 'moving', speed: 28, fuelLevel: 57, lastUpdate: '15 sec ago', location: 'Al Hamra, East Riyadh', lat: 24.7642, lng: 46.8124, odometer: 65720, engineHours: 1680, tripDistance: 8.4, tripDuration: '21m', tripStart: '09:31 AM', telemetry: { gpsState: 'weak', batteryPercent: 48, batteryVoltage: 12.4, satellites: 4, driverAuthorization: 'authorized', waslState: 'connected', actualWeightTons: 1.5, weightLimitTons: 2, cameraState: 'not_installed' } },
  { id: 'v011', name: 'Fleet Lima 27', plate: 'CA-6520-N', driver: 'Unassigned', vehicleType: 'car', groupId: 'riyadh-west', zone: 'West Riyadh', status: 'offline', speed: 0, fuelLevel: 24, lastUpdate: '31 min ago', location: 'Dhahrat Laban, West Riyadh', lat: 24.6469, lng: 46.5636, odometer: 44806, engineHours: 1195, tripDistance: 0, tripDuration: '—', tripStart: '—', telemetry: { gpsState: 'offline', batteryPercent: 18, batteryVoltage: 11.4, satellites: 0, driverAuthorization: 'unknown', waslState: 'not_connected', actualWeightTons: 1.7, weightLimitTons: 2, cameraState: 'not_working' } },
  { id: 'v012', name: 'Fleet Mike 11', plate: 'CA-3875-B', driver: 'Ethan Brooks', vehicleType: 'car', groupId: 'riyadh-north', zone: 'North Riyadh', status: 'idle', speed: 0, fuelLevel: 73, lastUpdate: '4 min ago', location: 'Al Sahafah, North Riyadh', lat: 24.8041, lng: 46.6269, odometer: 73512, engineHours: 1860, tripDistance: 0, tripDuration: '—', tripStart: '—', telemetry: { towing: false, gpsState: 'weak', batteryPercent: 57, batteryVoltage: 12.6, satellites: 6, driverAuthorization: 'authorized', waslState: 'not_connected', actualWeightTons: 1.3, weightLimitTons: 2, cameraState: 'working' } },
]

const additionalTelemetryTimes: Array<Pick<VehicleTelemetry, 'waslUpdatedAt' | 'weightUpdatedAt'>> = [
  { waslUpdatedAt: '2026-10-09T11:05:00Z', weightUpdatedAt: '2026-10-09T11:10:00Z' },
  { waslUpdatedAt: null, weightUpdatedAt: '2026-10-09T10:54:00Z' },
  { waslUpdatedAt: '2026-10-09T10:45:00Z', weightUpdatedAt: '2026-10-09T11:12:00Z' },
  { waslUpdatedAt: '2026-10-08T21:30:00Z', weightUpdatedAt: '2026-10-09T10:44:00Z' },
  { waslUpdatedAt: '2026-10-08T19:30:00Z', weightUpdatedAt: '2026-10-09T10:35:00Z' },
  { waslUpdatedAt: '2026-10-09T11:32:00Z', weightUpdatedAt: '2026-10-09T11:24:00Z' },
]

vehicles.push(...additionalFleetVehicles.map((extra, index) => {
  const seed = vehicles[index % 6]
  return {
    ...seed,
    ...extra,
    telemetry: { ...seed.telemetry, ...extra.telemetry, ...additionalTelemetryTimes[index] },
    sensors: seed.sensors.map(reading => ({ ...reading })),
    tripHistory: seed.tripHistory.map(point => ({ ...point })),
    route: {
      outbound: seed.route.outbound.map(point => ({ ...point })),
      return: seed.route.return?.map(point => ({ ...point })),
      events: seed.route.events.map(event => ({ ...event })),
    },
  }
}))

vehicles.forEach(vehicle => { vehicle.rawDeviceData = mockRawDeviceData })
