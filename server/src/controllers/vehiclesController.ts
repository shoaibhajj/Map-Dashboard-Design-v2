import { Request, Response, Router } from 'express'
import { initialDrivers } from '../data/seedData.js'
import { simulationEngine } from '../services/simulationEngine.js'
import { VehicleStatus } from '../types.js'

export const apiRouter = Router()

// ── SignalR Negotiate Endpoint ────────────────────────────────────────────────
// When @microsoft/signalr connects, it calls POST /hubs/fleet/negotiate?negotiateVersion=1
export function handleSignalRNegotiate(req: Request, res: Response) {
  const connectionId = 'conn_' + Math.random().toString(36).substring(2, 12)
  res.json({
    negotiateVersion: 1,
    connectionId,
    connectionToken: connectionId,
    availableTransports: [
      {
        transport: 'WebSockets',
        transferFormats: ['Text'],
      },
    ],
  })
}

// ── GET /api/vehicles ─────────────────────────────────────────────────────────
apiRouter.get('/vehicles', (req: Request, res: Response) => {
  try {
    const filters = {
      search: req.query.search as string,
      status: req.query.status as string,
      type: req.query.type as string,
      groupId: req.query.groupId as string,
      includeSubgroups: req.query.includeSubgroups !== undefined ? req.query.includeSubgroups === 'true' : true,
      zone: req.query.zone as string,
      minFuel: req.query.minFuel ? Number(req.query.minFuel) : undefined,
      driversOnly: req.query.driversOnly as 'all' | 'assigned' | 'unassigned',
    }

    const vehicles = simulationEngine.getAllVehicles(filters)

    res.json({
      success: true,
      count: vehicles.length,
      filtersApplied: filters,
      data: vehicles,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── GET /api/vehicles/:id ─────────────────────────────────────────────────────
apiRouter.get('/vehicles/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id
    const vehicle = simulationEngine.getVehicleById(id)

    if (!vehicle) {
      return res.status(404).json({ success: false, message: `Vehicle ${id} not found` })
    }

    res.json({
      success: true,
      data: vehicle,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── POST /api/vehicles ────────────────────────────────────────────────────────
apiRouter.post('/vehicles', (req: Request, res: Response) => {
  try {
    const newVehicle = simulationEngine.addVehicle(req.body)
    res.status(201).json({
      success: true,
      message: 'Vehicle created and added to simulation',
      data: newVehicle,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// ── PATCH /api/vehicles/:id/status ────────────────────────────────────────────
apiRouter.patch('/vehicles/:id/status', (req: Request, res: Response) => {
  try {
    const id = req.params.id
    const status = req.body.status as VehicleStatus

    if (!['moving', 'idle', 'offline'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be moving, idle, or offline.' })
    }

    const updated = simulationEngine.setVehicleStatus(id, status)
    if (!updated) {
      return res.status(404).json({ success: false, message: `Vehicle ${id} not found` })
    }

    res.json({
      success: true,
      message: `Vehicle ${id} status changed to ${status}`,
      data: updated,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── GET /api/groups ───────────────────────────────────────────────────────────
apiRouter.get('/groups', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: simulationEngine.getGroups(),
  })
})

// ── GET /api/drivers ──────────────────────────────────────────────────────────
apiRouter.get('/drivers', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: initialDrivers,
  })
})

// ── GET /api/health ───────────────────────────────────────────────────────────
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    vehiclesTotal: simulationEngine.getAllVehicles().length,
  })
})
