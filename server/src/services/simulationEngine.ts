import { EventEmitter } from 'events'
import { initialFleetGroups, initialVehicles, VEHICLE_GPS_ROUTES } from '../data/seedData.js'
import { FleetGroup, LiveVehicleUpdate, Vehicle, VehicleFilterQuery, VehicleStatus } from '../types.js'

// ── Geographic Helpers ──────────────────────────────────────────────────────────
function calculateBearing(lng1: number, lat1: number, lng2: number, lat2: number): number {
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const phi1 = lat1 * (Math.PI / 180)
  const phi2 = lat2 * (Math.PI / 180)
  const y = Math.sin(dLng) * Math.cos(phi2)
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng)
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360
}

function calculateDistanceKm(lng1: number, lat1: number, lng2: number, lat2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export class SimulationEngine extends EventEmitter {
  private vehicles: Map<string, Vehicle> = new Map()
  private groups: FleetGroup[] = [...initialFleetGroups]
  private routeProgress: Map<string, { currentSegment: number; t: number; direction: 1 | -1 }> = new Map()
  private timer: NodeJS.Timeout | null = null
  private isRunning: boolean = false
  private intervalMs: number = 1500

  constructor() {
    super()
    this.initVehicles()
  }

  private initVehicles(): void {
    for (const v of initialVehicles) {
      this.vehicles.set(v.id, JSON.parse(JSON.stringify(v)))
      this.routeProgress.set(v.id, { currentSegment: 0, t: 0, direction: 1 })
    }
  }

  public start(intervalMs = 1500): void {
    if (this.isRunning) return
    this.intervalMs = intervalMs
    this.isRunning = true
    console.log(`[SimulationEngine] 🚀 Telemetry Simulation Engine started (tick: ${this.intervalMs}ms)`)

    this.timer = setInterval(() => this.tick(), this.intervalMs)
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.isRunning = false
    console.log('[SimulationEngine] ⏹️ Simulation Engine stopped')
  }

  /**
   * The core simulation tick: advances coordinates along Riyadh roads and emits live updates
   */
  private tick(): void {
    const bulkUpdates: LiveVehicleUpdate[] = []

    for (const vehicle of this.vehicles.values()) {
      if (vehicle.status !== 'moving') continue

      const route = VEHICLE_GPS_ROUTES[vehicle.id]
      if (!route || route.length < 2) continue

      const prog = this.routeProgress.get(vehicle.id) || { currentSegment: 0, t: 0, direction: 1 }

      // Advance parameter 't' based on speed (fraction of road segment per tick)
      const currentSegment = prog.currentSegment
      const nextSegment = currentSegment + prog.direction

      const p1 = route[currentSegment]
      const p2 = route[nextSegment]

      if (!p1 || !p2) {
        // Reverse direction when reaching route endpoints
        prog.direction = prog.direction === 1 ? -1 : 1
        continue
      }

      const segmentDist = calculateDistanceKm(p1[0], p1[1], p2[0], p2[1])
      const speedKmPerHr = Math.max(30, vehicle.speed + (Math.random() * 6 - 3)) // slight realistic speed jitter
      const distTraveledThisTick = (speedKmPerHr * (this.intervalMs / 1000)) / 3600 // km

      const stepT = segmentDist > 0 ? distTraveledThisTick / segmentDist : 0.05
      prog.t += stepT

      if (prog.t >= 1) {
        // Move to next segment
        prog.t = 0
        prog.currentSegment += prog.direction

        if (prog.currentSegment >= route.length - 1) {
          prog.currentSegment = route.length - 1
          prog.direction = -1
        } else if (prog.currentSegment <= 0) {
          prog.currentSegment = 0
          prog.direction = 1
        }
      }

      // Linear interpolation between p1 and p2 for smooth sequential GPS coordinates
      const targetP1 = route[prog.currentSegment]
      const targetP2 = route[prog.currentSegment + prog.direction] || targetP1
      const curLng = targetP1[0] + (targetP2[0] - targetP1[0]) * prog.t
      const curLat = targetP1[1] + (targetP2[1] - targetP1[1]) * prog.t

      const bearing = calculateBearing(targetP1[0], targetP1[1], targetP2[0], targetP2[1])

      // Update vehicle in-memory metrics
      vehicle.lng = Number(curLng.toFixed(6))
      vehicle.lat = Number(curLat.toFixed(6))
      vehicle.bearing = Number(bearing.toFixed(1))
      vehicle.speed = Math.round(speedKmPerHr)
      vehicle.fuelLevel = Math.max(5, Number((vehicle.fuelLevel - 0.005).toFixed(2)))
      vehicle.odometer = Number((vehicle.odometer + distTraveledThisTick).toFixed(2))
      vehicle.tripDistance = Number((vehicle.tripDistance + distTraveledThisTick).toFixed(2))
      vehicle.lastUpdate = 'Just now'
      vehicle.lastUpdateTimestamp = new Date().toISOString()

      // Sensor jitter for realistic telemetry (RPM & Engine Temp)
      const rpmSensor = vehicle.sensors.find(s => s.key === 'rpm' || s.label === 'RPM')
      if (rpmSensor) {
        const rpm = Math.round(1800 + (vehicle.speed / 100) * 1200 + (Math.random() * 80 - 40))
        rpmSensor.current = rpm
        rpmSensor.value = rpm.toLocaleString()
      }

      const tempSensor = vehicle.sensors.find(s => s.key === 'engine_temp' || s.label.includes('Temp'))
      if (tempSensor) {
        const temp = Math.min(102, Math.max(82, (tempSensor.current ?? 90) + (Math.random() * 0.4 - 0.2)))
        tempSensor.current = Number(temp.toFixed(1))
        tempSensor.value = tempSensor.current.toString()
      }

      const updatePayload: LiveVehicleUpdate = {
        id: vehicle.id,
        lat: vehicle.lat,
        lng: vehicle.lng,
        bearing: vehicle.bearing,
        speed: vehicle.speed,
        status: vehicle.status,
        fuelLevel: vehicle.fuelLevel,
        odometer: vehicle.odometer,
        tripDistance: vehicle.tripDistance,
        location: vehicle.location,
        lastUpdate: vehicle.lastUpdate,
        lastUpdateTimestamp: vehicle.lastUpdateTimestamp,
        telemetry: {
          batteryVoltage: Number((13.7 + Math.random() * 0.4).toFixed(1)),
          satellites: Math.min(18, Math.max(8, vehicle.telemetry.satellites + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
          gpsState: 'online',
        },
        sensors: vehicle.sensors,
      }

      bulkUpdates.push(updatePayload)
      this.emit('vehicleUpdate', updatePayload)
    }

    if (bulkUpdates.length > 0) {
      this.emit('bulkUpdate', bulkUpdates)
    }
  }

  // ── Queries & Business Logic ──────────────────────────────────────────────────

  public getAllVehicles(filter: VehicleFilterQuery = {}): Vehicle[] {
    let result = Array.from(this.vehicles.values())

    // 1. Text Search (name, plate, driver)
    if (filter.search && filter.search.trim()) {
      const q = filter.search.trim().toLowerCase()
      result = result.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q) ||
        v.driver.toLowerCase().includes(q)
      )
    }

    // 2. Status Filter
    if (filter.status && filter.status !== 'all') {
      const statuses = filter.status.split(',').map(s => s.trim().toLowerCase())
      result = result.filter(v => statuses.includes(v.status.toLowerCase()))
    }

    // 3. Vehicle Type Filter
    if (filter.type && filter.type !== 'all') {
      const types = filter.type.split(',').map(t => t.trim().toLowerCase())
      result = result.filter(v => types.includes(v.vehicleType.toLowerCase()))
    }

    // 4. Group Hierarchy Filter
    if (filter.groupId && filter.groupId !== 'all') {
      const groupIds = filter.groupId.split(',').map(g => g.trim())
      const includeSub = filter.includeSubgroups !== false && filter.includeSubgroups !== 'false'

      let allowedGroupIds = new Set<string>(groupIds)
      if (includeSub) {
        // Collect all descendants for each requested group
        for (const gid of groupIds) {
          const descendants = this.getGroupBranchIds(gid)
          descendants.forEach(id => allowedGroupIds.add(id))
        }
      }

      result = result.filter(v => v.groupId && allowedGroupIds.has(v.groupId))
    }

    // 5. Zone Filter
    if (filter.zone && filter.zone !== 'all') {
      const zones = filter.zone.split(',').map(z => z.trim().toLowerCase())
      result = result.filter(v => zones.includes(v.zone.toLowerCase()))
    }

    // 6. Minimum Fuel Filter
    if (filter.minFuel !== undefined && filter.minFuel !== '') {
      const minFuel = Number(filter.minFuel)
      if (!isNaN(minFuel) && minFuel > 0) {
        result = result.filter(v => v.fuelLevel >= minFuel)
      }
    }

    // 7. Driver Assignment Filter
    if (filter.driversOnly && filter.driversOnly !== 'all') {
      if (filter.driversOnly === 'assigned') {
        result = result.filter(v => v.driver && v.driver.toLowerCase() !== 'unassigned')
      } else if (filter.driversOnly === 'unassigned') {
        result = result.filter(v => !v.driver || v.driver.toLowerCase() === 'unassigned')
      }
    }

    return result
  }

  public getVehicleById(id: string): Vehicle | null {
    return this.vehicles.get(id) || null
  }

  public addVehicle(data: Partial<Vehicle>): Vehicle {
    const id = data.id || `v${String(this.vehicles.size + 1).padStart(3, '0')}`
    const newVehicle: Vehicle = {
      id,
      name: data.name || `Fleet Vehicle ${id}`,
      plate: data.plate || `CA-${Math.floor(1000 + Math.random() * 9000)}-X`,
      driver: data.driver || 'Unassigned',
      vehicleType: data.vehicleType || 'car',
      groupId: data.groupId || 'riyadh-central',
      zone: data.zone || 'Central Riyadh',
      status: data.status || 'idle',
      speed: data.speed || 0,
      bearing: 0,
      fuelLevel: data.fuelLevel ?? 100,
      lastUpdate: 'Just now',
      location: data.location || 'Riyadh Central',
      lat: data.lat || 24.7136,
      lng: data.lng || 46.6753,
      odometer: data.odometer || 10000,
      engineHours: data.engineHours || 250,
      tripDistance: 0,
      tripDuration: '—',
      tripStart: '—',
      telemetry: data.telemetry || {
        towing: false,
        gpsState: 'online',
        batteryPercent: 100,
        batteryVoltage: 13.8,
        satellites: 12,
        driverAuthorization: 'authorized',
        waslState: 'connected',
        actualWeightTons: 2,
        weightLimitTons: 3,
        cameraState: 'working',
      },
      sensors: data.sensors || [
        { label: 'Engine Temp', value: '88', unit: '°C', min: 0, max: 120, current: 88 },
        { label: 'Battery', value: '13.8', unit: 'V', min: 11, max: 15, current: 13.8 },
      ],
      tripHistory: [],
      route: { outbound: [], events: [] },
    }

    this.vehicles.set(id, newVehicle)
    return newVehicle
  }

  public setVehicleStatus(id: string, status: VehicleStatus): Vehicle | null {
    const vehicle = this.vehicles.get(id)
    if (!vehicle) return null
    vehicle.status = status
    if (status !== 'moving') {
      vehicle.speed = 0
    } else {
      vehicle.speed = 55
    }
    this.emit('vehicleUpdate', {
      id: vehicle.id,
      status: vehicle.status,
      speed: vehicle.speed,
      lat: vehicle.lat,
      lng: vehicle.lng,
      bearing: vehicle.bearing ?? 0,
      fuelLevel: vehicle.fuelLevel,
      odometer: vehicle.odometer,
      tripDistance: vehicle.tripDistance,
      location: vehicle.location,
      lastUpdate: 'Just now',
      lastUpdateTimestamp: new Date().toISOString(),
    })
    return vehicle
  }

  public getGroups(): FleetGroup[] {
    return this.groups
  }

  private getGroupBranchIds(rootId: string): string[] {
    const result: string[] = [rootId]
    const children = this.groups.filter(g => g.parentId === rootId)
    for (const child of children) {
      result.push(...this.getGroupBranchIds(child.id))
    }
    return result
  }
}

export const simulationEngine = new SimulationEngine()
