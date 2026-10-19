import { useLanguage } from "../../contexts/LanguageContext"
import type { TranslationKey } from "../../i18n/strings"
import type { RecentTrip, DashboardVehicleStatus } from "../types"

interface Props {
  trips: RecentTrip[]
}

const statusColor: Record<DashboardVehicleStatus, string> = {
  moving: "var(--primary)",
  stopped: "var(--warning)",
  attention: "var(--danger)",
}

const statusLabelKey: Record<DashboardVehicleStatus, TranslationKey> = {
  moving: "chip_moving",
  stopped: "chip_stopped",
  attention: "chip_needs_attention",
}

const vehicleIcon = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--muted-foreground)"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 16.5V11l1.6-4.2A2 2 0 0 1 7.5 5.5h9a2 2 0 0 1 1.9 1.3L20 11v5.5" />
    <rect x="3.2" y="11" width="17.6" height="5.6" rx="1.4" />
    <circle cx="7.2" cy="17.8" r="1.6" />
    <circle cx="16.8" cy="17.8" r="1.6" />
  </svg>
)

function StatusPill({ status }: { status: DashboardVehicleStatus }) {
  const { t } = useLanguage()
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 700,
        color: statusColor[status],
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: statusColor[status],
        }}
      />
      {t(statusLabelKey[status])}
    </span>
  )
}

export default function RecentTripsTable({ trips }: Props) {
  const { t, isRTL } = useLanguage()

  const columns: {
    key: keyof RecentTrip | "menu"
    labelKey?: TranslationKey
  }[] = [
    { key: "status", labelKey: "trips_col_status" },
    { key: "time", labelKey: "trips_col_time" },
    { key: "location", labelKey: "trips_col_location" },
    { key: "tripTypeKey", labelKey: "trips_col_type" },
    { key: "driver", labelKey: "trips_col_driver" },
    { key: "vehicleName", labelKey: "trips_col_vehicle" },
    { key: "menu" },
  ]

  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid var(--border)",
        background: "var(--card)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 18px",
          flexDirection: isRTL ? "row-reverse" : "row",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 15.5,
            fontWeight: 700,
            color: "var(--foreground)",
          }}
        >
          {t("trips_recent_title")}
        </h3>
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--primary)",
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexDirection: isRTL ? "row-reverse" : "row",
          }}
        >
          {t("view_all")}
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: isRTL ? "scaleX(-1)" : undefined }}
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}
        >
          <thead>
            <tr
              style={{
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: "10px 18px",
                    textAlign: isRTL ? "right" : "left",
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "var(--muted-foreground)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.labelKey ? t(col.labelKey) : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trips.map((trip, i) => (
              <tr
                key={trip.id}
                style={{
                  borderBottom:
                    i < trips.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <td style={{ padding: "12px 18px" }}>
                  <StatusPill status={trip.status} />
                </td>
                <td
                  style={{
                    padding: "12px 18px",
                    fontSize: 12.5,
                    color: "var(--foreground)",
                    fontFamily: "var(--font-mono)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {trip.time}
                </td>
                <td
                  style={{
                    padding: "12px 18px",
                    fontSize: 12.5,
                    color: "var(--foreground)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {trip.location}
                </td>
                <td
                  style={{
                    padding: "12px 18px",
                    fontSize: 12.5,
                    color: "var(--muted-foreground)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t(trip.tripTypeKey)}
                </td>
                <td style={{ padding: "12px 18px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexDirection: isRTL ? "row-reverse" : "row",
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "var(--secondary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: "var(--foreground)",
                        flexShrink: 0,
                      }}
                    >
                      {trip.driver.charAt(0)}
                    </div>
                    <span
                      style={{
                        fontSize: 12.5,
                        color: "var(--foreground)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {trip.driver}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "12px 18px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexDirection: isRTL ? "row-reverse" : "row",
                    }}
                  >
                    {vehicleIcon}
                    <div style={{ lineHeight: 1.3 }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: "var(--foreground)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {trip.vehicleName}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--muted-foreground)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {trip.vehiclePlate}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 18px" }}>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--muted-foreground)",
                      display: "flex",
                    }}
                    aria-label="…"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <circle cx="5" cy="12" r="1.6" />
                      <circle cx="12" cy="12" r="1.6" />
                      <circle cx="19" cy="12" r="1.6" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
