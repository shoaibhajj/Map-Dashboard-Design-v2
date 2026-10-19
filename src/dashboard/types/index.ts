import type { VehicleType } from "../../data/vehicles"
import type { TranslationKey } from "../../i18n/strings"

export interface LeftPanel {
  id: string
  type: "vehicles"
}

export interface RightCard {
  id: string
  type: "vehicle" | "legend" | "filter"
  vehicleId?: string
  minimized: boolean
  expanded: boolean
}

export type FABType = "vehicles" | "legend"

export interface FleetFilter {
  statuses: string[] // [] = all
  types: VehicleType[] // [] = all
  zones: string[] // [] = all
  minFuel: number // 0 = no filter
  driversOnly: "all" | "assigned" | "unassigned"
}

export const defaultFilter: FleetFilter = {
  statuses: [],
  types: [],
  zones: [],
  minFuel: 0,
  driversOnly: "all",
}

// ─── Dashboard (overview page) ───
// Kept separate from `VehicleStatus` (moving/idle/offline, used by the map)
// because the dashboard's third state is an attention FLAG ("needs
// follow-up"), not a connectivity state ("offline") — different axis,
// so it gets its own small union rather than overloading the map's type.
export type DashboardVehicleStatus = "moving" | "stopped" | "attention"

export interface WeeklyActivityPoint {
  dateKey: string // e.g. "09-10" — rendered via a translation-aware day formatter
  value: number
}

export interface DonutSlice {
  labelKey: TranslationKey
  value: number
  color: string
}

export interface RecentTrip {
  id: string
  status: DashboardVehicleStatus
  time: string
  location: string
  tripTypeKey: TranslationKey
  driver: string
  vehicleName: string
  vehiclePlate: string
}

export type AlertToneKey = "moving" | "stopped" | "attention"

export interface RecentAlert {
  id: string
  time: string
  tone: AlertToneKey
  messageKey: TranslationKey
  detail: string
}
