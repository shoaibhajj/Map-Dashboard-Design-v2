import { useLanguage } from "../../contexts/LanguageContext"
import DashboardSidebar from "./DashboardSidebar"
import DashboardTopBar from "./DashboardTopBar"
import StatCard from "./StatCard"
import FleetMapPreview from "./FleetMapPreview"
import WeeklyActivityChart from "./WeeklyActivityChart"
import DonutStat from "./DonutStat"
import RecentTripsTable from "./RecentTripsTable"
import RecentAlertsFeed from "./RecentAlertsFeed"
import QuickActionsGrid from "./QuickActionsGrid"
import {
  weeklyActivity,
  vehicleStatusBreakdown,
  driverPerformanceBreakdown,
  recentTrips,
  recentAlerts,
} from "../data/dashboardData"

const kpiIcon = {
  total: (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 16.5V11l1.6-4.2A2 2 0 0 1 7.5 5.5h9a2 2 0 0 1 1.9 1.3L20 11v5.5" />
      <rect x="3.2" y="11" width="17.6" height="5.6" rx="1.4" />
      <circle cx="7.2" cy="17.8" r="1.6" />
      <circle cx="16.8" cy="17.8" r="1.6" />
    </svg>
  ),
  moving: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.14v13.72c0 .8.87 1.3 1.57.87l10.99-6.86a1 1 0 0 0 0-1.72L9.57 4.27C8.87 3.84 8 4.34 8 5.14Z" />
    </svg>
  ),
  stopped: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="5" width="4.5" height="14" rx="1.2" />
      <rect x="13.5" y="5" width="4.5" height="14" rx="1.2" />
    </svg>
  ),
  attention: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
      <path d="M12 9.5v5" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
}

const calendarIcon = (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <line x1="16" y1="3" x2="16" y2="7" />
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const gearIcon = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

export default function Dashboard() {
  const { t, isRTL } = useLanguage()

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        background: "var(--background)",
      }}
    >
      <DashboardSidebar activeRoute="dashboard" />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <DashboardTopBar />

        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Welcome banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              flexDirection: isRTL ? "row-reverse" : "row",
            }}
          >
            <div style={{ textAlign: isRTL ? "right" : "left" }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: "var(--foreground)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexDirection: isRTL ? "row-reverse" : "row",
                }}
              >
                <span>👋</span> {t("welcome_prefix")} شعيب
              </h1>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 13,
                  color: "var(--muted-foreground)",
                }}
              >
                {t("welcome_subtitle")}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexDirection: isRTL ? "row-reverse" : "row",
              }}
            >
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  height: 38,
                  padding: "0 14px",
                  borderRadius: 9,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--foreground)",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  flexDirection: isRTL ? "row-reverse" : "row",
                }}
              >
                {calendarIcon} {t("range_last_7_days")}
              </button>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  height: 38,
                  padding: "0 14px",
                  borderRadius: 9,
                  border: "none",
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  flexDirection: isRTL ? "row-reverse" : "row",
                }}
              >
                {gearIcon} {t("customize_dashboard")}
              </button>
            </div>
          </div>

          {/* KPI strip */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <StatCard
              titleKey="kpi_total_vehicles"
              value={33}
              trendPercent={12}
              trendGood
              icon={kpiIcon.total}
              tone="solid"
              sparkline={[20, 24, 22, 27, 26, 30, 33]}
            />
            <StatCard
              titleKey="kpi_moving"
              value={24}
              trendPercent={20}
              trendGood
              icon={kpiIcon.moving}
              tone="moving"
              sparkline={[14, 16, 15, 19, 18, 22, 24]}
            />
            <StatCard
              titleKey="kpi_stopped"
              value={6}
              trendPercent={-14}
              trendGood
              icon={kpiIcon.stopped}
              tone="stopped"
              sparkline={[9, 8, 8, 7, 7, 6, 6]}
            />
            <StatCard
              titleKey="kpi_needs_attention"
              value={3}
              trendPercent={50}
              trendGood={false}
              icon={kpiIcon.attention}
              tone="attention"
              sparkline={[1, 1, 2, 1, 2, 3, 3]}
            />
          </div>

          {/* Map + weekly chart / donuts */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
              gap: 20,
              alignItems: "start",
            }}
          >
            <FleetMapPreview />
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <WeeklyActivityChart data={weeklyActivity} />
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <DonutStat
                  titleKey="donut_vehicle_status_title"
                  slices={vehicleStatusBreakdown}
                  centerValue={33}
                  centerUnitKey="chart_unit_vehicle"
                />
                <DonutStat
                  titleKey="donut_driver_performance_title"
                  slices={driverPerformanceBreakdown}
                  centerValue={18}
                  centerUnitKey="donut_unit_driver"
                  showViewAll
                />
              </div>
            </div>
          </div>

          {/* Trips / alerts / quick actions */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr)",
              gap: 20,
              alignItems: "start",
            }}
          >
            <RecentTripsTable trips={recentTrips} />
            <RecentAlertsFeed alerts={recentAlerts} />
            <QuickActionsGrid />
          </div>
        </main>
      </div>
    </div>
  )
}
