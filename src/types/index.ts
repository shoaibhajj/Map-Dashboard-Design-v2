import type { VehicleType } from '../data/vehicles'

export interface LeftPanel {
  id: string
  type: 'vehicles'
}

export interface RightCard {
  id: string
  type: 'vehicle' | 'filter'
  vehicleId?: string
  minimized: boolean
  expanded: boolean
}

export type FABType = 'vehicles'

export interface FleetFilter {
  statuses: string[]   // [] = all
  types: VehicleType[] // [] = all
  zones: string[]      // [] = all
  minFuel: number      // 0 = no filter
  driversOnly: 'all' | 'assigned' | 'unassigned'
}

export const defaultFilter: FleetFilter = {
  statuses: [],
  types: [],
  zones: [],
  minFuel: 0,
  driversOnly: 'all',
}
