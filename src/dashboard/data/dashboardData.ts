import type {
  WeeklyActivityPoint,
  DonutSlice,
  RecentTrip,
  RecentAlert,
} from "../types"

/**
 * Static demo data for the dashboard overview page — mirrors the pattern
 * in `vehicles.ts` (plain exported arrays, no fetching). Swap these for
 * real API calls when a backend exists; every component that reads them
 * takes the data as props, so only this file needs to change.
 */

export const weeklyActivity: WeeklyActivityPoint[] = [
  { dateKey: "09-10", value: 78 },
  { dateKey: "09-11", value: 96 },
  { dateKey: "09-12", value: 88 },
  { dateKey: "09-13", value: 142 },
  { dateKey: "09-14", value: 110 },
  { dateKey: "09-15", value: 118 },
  { dateKey: "09-16", value: 74 },
]

export const vehicleStatusBreakdown: DonutSlice[] = [
  { labelKey: "chip_moving", value: 24, color: "var(--primary)" },
  { labelKey: "chip_stopped", value: 6, color: "#f59e0b" },
  { labelKey: "chip_needs_attention", value: 3, color: "#ef4444" },
]

export const driverPerformanceBreakdown: DonutSlice[] = [
  { labelKey: "driver_excellent", value: 10, color: "var(--primary)" },
  { labelKey: "driver_good", value: 5, color: "#3b82f6" },
  { labelKey: "driver_needs_improvement", value: 3, color: "#f59e0b" },
]

export const recentTrips: RecentTrip[] = [
  {
    id: "t1",
    status: "moving",
    time: "10:24",
    location: "طريق الملك فهد، الرياض",
    tripTypeKey: "trip_type_client",
    driver: "أحمد العتيبي",
    vehicleName: "Toyota Hilux",
    vehiclePlate: "AVX 1122",
  },
  {
    id: "t2",
    status: "stopped",
    time: "09:18",
    location: "حي النخيل، الرياض",
    tripTypeKey: "trip_type_delivery",
    driver: "سعيد القحطاني",
    vehicleName: "Isuzu D-Max",
    vehiclePlate: "2345",
  },
  {
    id: "t3",
    status: "moving",
    time: "08:55",
    location: "الدمام - طريق الخليج",
    tripTypeKey: "trip_type_distribution",
    driver: "خالد المطيري",
    vehicleName: "Nissan Patrol",
    vehiclePlate: "NNS",
  },
  {
    id: "t4",
    status: "attention",
    time: "07:40",
    location: "جدة - طريق الحرمين",
    tripTypeKey: "trip_type_client",
    driver: "محمد السلمان",
    vehicleName: "Ford Transit",
    vehiclePlate: "CA-7743",
  },
]

export const recentAlerts: RecentAlert[] = [
  {
    id: "a1",
    time: "10:24",
    tone: "moving",
    messageKey: "alert_trip_started",
    detail: "Toyota Hilux · AVX 1122",
  },
  {
    id: "a2",
    time: "09:18",
    tone: "stopped",
    messageKey: "alert_stopped_moving",
    detail: "Isuzu D-Max · سعيد القحطاني",
  },
  {
    id: "a3",
    time: "08:55",
    tone: "attention",
    messageKey: "alert_speed_exceeded",
    detail: "Nissan Patrol · خالد المطيري",
  },
  {
    id: "a4",
    time: "07:40",
    tone: "attention",
    messageKey: "alert_left_geofence",
    detail: "Ford Transit · محمد السلمان",
  },
]

/** Map preview markers — decorative, in SVG viewBox space (0 0 600 380). */
export interface DashboardMapMarker {
  id: string
  x: number
  y: number
  status: "moving" | "stopped" | "attention"
}

export const dashboardMapMarkers: DashboardMapMarker[] = [
  { id: "m1", x: 150, y: 190, status: "moving" },
  { id: "m2", x: 255, y: 120, status: "moving" },
  { id: "m3", x: 285, y: 205, status: "attention" },
  { id: "m4", x: 355, y: 150, status: "stopped" },
  { id: "m5", x: 235, y: 250, status: "moving" },
  { id: "m6", x: 430, y: 235, status: "moving" },
]

export const dashboardMapDistricts = [
  { label: "الملقا", x: 120, y: 55 },
  { label: "الصحافة", x: 260, y: 40 },
  { label: "النخيل", x: 405, y: 70 },
  { label: "العليا", x: 330, y: 190 },
  { label: "الملز", x: 195, y: 275 },
  { label: "الشفا", x: 350, y: 300 },
  { label: "المروج", x: 470, y: 260 },
]
