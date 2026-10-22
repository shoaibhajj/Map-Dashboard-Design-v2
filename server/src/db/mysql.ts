import mysql from 'mysql2/promise'
import { initialDrivers, initialFleetGroups, initialVehicles } from '../data/seedData.js'

let pool: mysql.Pool | null = null
let isConnected = false

export async function getDbPool(): Promise<mysql.Pool | null> {
  if (pool) return pool
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fleet_tracker_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
    const conn = await pool.getConnection()
    conn.release()
    isConnected = true
    return pool
  } catch (err: any) {
    console.warn(`[MySQL] Note: Could not connect to MySQL (${err.message}). Using In-Memory state.`)
    pool = null
    isConnected = false
    return null
  }
}

export function isDbConnected(): boolean {
  return isConnected
}

export async function initDatabase(): Promise<void> {
  const p = await getDbPool()
  if (!p) return

  try {
    // 1. fleet_groups table
    await p.query(`
      CREATE TABLE IF NOT EXISTS fleet_groups (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        parent_id VARCHAR(50) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    // 2. drivers table
    await p.query(`
      CREATE TABLE IF NOT EXISTS drivers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    // 3. vehicles table
    await p.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        plate VARCHAR(50) NOT NULL,
        driver VARCHAR(100) NOT NULL,
        vehicle_type VARCHAR(50) NOT NULL,
        group_id VARCHAR(50) NULL,
        zone VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL,
        speed DOUBLE NOT NULL DEFAULT 0,
        bearing DOUBLE NOT NULL DEFAULT 0,
        fuel_level DOUBLE NOT NULL DEFAULT 100,
        fuel_volume_liters DOUBLE NULL,
        lat DOUBLE NOT NULL,
        lng DOUBLE NOT NULL,
        odometer DOUBLE NOT NULL DEFAULT 0,
        engine_hours DOUBLE NOT NULL DEFAULT 0,
        trip_distance DOUBLE NOT NULL DEFAULT 0,
        trip_duration VARCHAR(50) NULL,
        trip_start VARCHAR(50) NULL,
        location VARCHAR(255) NOT NULL,
        last_update VARCHAR(100) NOT NULL,
        last_update_timestamp DATETIME NULL,
        raw_device_data TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    // Check if vehicles are seeded
    const [rows]: any = await p.query('SELECT COUNT(*) as count FROM vehicles')
    if (rows[0].count === 0) {
      console.log('[MySQL] Seeding initial groups, drivers, and vehicles...')

      for (const g of initialFleetGroups) {
        await p.query('INSERT IGNORE INTO fleet_groups (id, name, parent_id) VALUES (?, ?, ?)', [g.id, g.name, g.parentId])
      }

      for (const d of initialDrivers) {
        await p.query('INSERT IGNORE INTO drivers (id, name, phone) VALUES (?, ?, ?)', [d.id, d.name, d.phone])
      }

      for (const v of initialVehicles) {
        await p.query(
          `INSERT INTO vehicles 
           (id, name, plate, driver, vehicle_type, group_id, zone, status, speed, bearing, fuel_level, fuel_volume_liters, lat, lng, odometer, engine_hours, trip_distance, trip_duration, trip_start, location, last_update, raw_device_data)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            v.id, v.name, v.plate, v.driver, v.vehicleType, v.groupId, v.zone,
            v.status, v.speed, v.bearing ?? 0, v.fuelLevel, v.fuelVolumeLiters ?? null,
            v.lat, v.lng, v.odometer, v.engineHours, v.tripDistance, v.tripDuration,
            v.tripStart, v.location, v.lastUpdate, v.rawDeviceData?.raw ?? null,
          ]
        )
      }
      console.log(`[MySQL] Successfully seeded ${initialVehicles.length} vehicles into fleet_tracker_db!`)
    } else {
      console.log(`[MySQL] Found ${rows[0].count} vehicles already in fleet_tracker_db.`)
    }
  } catch (err: any) {
    console.error('[MySQL] Table initialization error:', err.message)
  }
}
