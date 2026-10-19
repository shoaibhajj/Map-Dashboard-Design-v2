import { useLanguage } from "../../contexts/LanguageContext"
import type { TranslationKey } from "../../i18n/strings"
import { useNavigate } from 'react-router-dom'

/**
 * Sidebar for the dashboard family of pages (Dashboard, Vehicles, Groups,
 * Drivers, Trips, Operations, Reports, Complaints, Settings).
 *
 * Deliberately a SEPARATE component from `./Sidebar.tsx` rather than an
 * extension of it: that one is the map's hover-to-expand icon rail (52→200px,
 * 5 items, mirrors side with `isRTL`). This one is the always-expanded,
 * fully-labeled nav from the Figma dashboard designs (9 items) and — matching
 * that design exactly — stays docked on the left regardless of language,
 * rather than swapping sides for RTL. If you'd rather it mirror like the map
 * sidebar does, that's a one-line change (see the commented-out block below).
 */

interface Props {
  activeRoute: string
}

const Icon = {
  home: (
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
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </svg>
  ),
  truck: (
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
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  groups: (
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
      <rect x="3" y="4" width="7" height="7" rx="1.4" />
      <rect x="14" y="4" width="7" height="7" rx="1.4" />
      <rect x="3" y="14" width="7" height="7" rx="1.4" />
      <rect x="14" y="14" width="7" height="7" rx="1.4" />
    </svg>
  ),
  driver: (
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
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  ),
  route: (
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
      <circle cx="5" cy="19" r="2.2" />
      <circle cx="19" cy="5" r="2.2" />
      <path d="M7 17.3 17 6.7" />
    </svg>
  ),
  operations: (
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
      <path d="M4 6h11M4 12h16M4 18h8" />
      <circle cx="17" cy="6" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  ),
  reports: (
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
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  complaints: (
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
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9A1.5 1.5 0 0 1 18.5 16H10l-4 4v-4H5.5A1.5 1.5 0 0 1 4 14.5v-9Z" />
      <path d="M12 8v3.2" />
      <circle cx="12" cy="13.4" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  settings: (
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  headset: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="2.5" y="13" width="5" height="7" rx="1.8" />
      <rect x="16.5" y="13" width="5" height="7" rx="1.8" />
      <path d="M20 20a4 4 0 0 1-4 4h-3" />
    </svg>
  ),
}

const navItems: {
  id: string
  labelKey: TranslationKey
  icon: keyof typeof Icon
  path?: string
}[] = [
  { id: "dashboard", labelKey: "nav_dashboard", icon: "home", path: "/app/dashboard" },
  { id: "map", labelKey: "nav_map", icon: "operations", path: "/app" },
  { id: "vehicles", labelKey: "nav_vehicles", icon: "truck", path: "/app/vehicles" },
  { id: "advertisements", labelKey: "nav_advertisements", icon: "reports", path: "/app/advertisements" },
  { id: "groups", labelKey: "nav_groups", icon: "groups" },
  { id: "drivers", labelKey: "nav_drivers", icon: "driver" },
  { id: "trips", labelKey: "nav_trips", icon: "route" },
  { id: "operations", labelKey: "nav_operations", icon: "operations" },
  { id: "reports", labelKey: "nav_reports", icon: "reports" },
  { id: "complaints", labelKey: "nav_complaints", icon: "complaints" },
  { id: "settings", labelKey: "nav_settings", icon: "settings" },
]

export default function DashboardSidebar({ activeRoute }: Props) {
  const { t, isRTL } = useLanguage()
  const navigate = useNavigate()

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        minWidth: "var(--sidebar-width)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--sidebar)",
        borderInlineEnd: "1px solid var(--border)",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: "var(--topbar-height)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 18px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 32 32"
          fill="none"
          style={{ flexShrink: 0 }}
        >
          <rect width="32" height="32" rx="9" fill="var(--primary)" />
          <path
            d="M16 5C11.03 5 7 9.03 7 14c0 6.5 9 17 9 17s9-10.5 9-17c0-4.97-4.03-9-9-9zm0 12a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
            fill="var(--primary-foreground)"
          />
        </svg>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: "0.02em",
            color: "var(--foreground)",
            whiteSpace: "nowrap",
          }}
        >
          {t("app_name").toUpperCase()}
        </span>
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: "10px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
        }}
      >
        {navItems.map((item) => {
          const isActive = activeRoute === item.id
          return (
            <button
              key={item.id}
              onClick={() => item.path && navigate(item.path)}
              aria-current={isActive ? 'page' : undefined}
              disabled={!item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                height: 42,
                padding: "0 12px",
                borderRadius: 10,
                border: "none",
                cursor: item.path ? "pointer" : "default",
                opacity: item.path ? 1 : .62,
                background: isActive ? "var(--primary)" : "transparent",
                color: isActive
                  ? "var(--primary-foreground)"
                  : "var(--muted-foreground)",
                fontSize: 13.5,
                fontWeight: isActive ? 700 : 500,
                textAlign: isRTL ? "right" : "left",
                flexDirection: isRTL ? "row-reverse" : "row",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <span style={{ display: "flex", flexShrink: 0 }}>
                {Icon[item.icon]}
              </span>
              <span style={{ flex: 1 }}>{t(item.labelKey)}</span>
            </button>
          )
        })}
      </nav>

      {/* Help center */}
      <div
        style={{
          padding: 12,
          borderTop: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <button
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 40,
            padding: "0 12px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--secondary)",
            color: "var(--foreground)",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            flexDirection: isRTL ? "row-reverse" : "row",
          }}
        >
          <span
            style={{ display: "flex", flexShrink: 0, color: "var(--primary)" }}
          >
            {Icon.headset}
          </span>
          {t("nav_help_center")}
        </button>
      </div>
    </aside>
  )
}
