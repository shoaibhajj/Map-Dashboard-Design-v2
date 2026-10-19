import { useState } from "react"
import { useLanguage } from "../../contexts/LanguageContext"
import type { TranslationKey } from "../../i18n/strings"
import {
  dashboardMapMarkers,
  dashboardMapDistricts,
} from "../data/dashboardData"

/**
 * A static, dependency-free stand-in for the live map on this overview
 * card — deliberately NOT wired to Mapbox (`../../config/mapbox.ts` /
 * `./MapCanvas.tsx`) so this page works even with no `VITE_MAPBOX_TOKEN`
 * configured. If you want the real live map here instead, this is the
 * component to swap out — `<MapCanvas>` already takes `vehicles` +
 * `darkMode` props and is used the same way in `MapDashboard.tsx`.
 */

const markerColor: Record<string, string> = {
  moving: "var(--primary)",
  stopped: "var(--warning)",
  attention: "var(--danger)",
}

const searchIcon = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--muted-foreground)"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const expandIcon = (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--muted-foreground)"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
)

const layersIcon = (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--foreground)"
    strokeWidth="1.8"
    strokeLinejoin="round"
  >
    <polygon points="12 3 3 8 12 13 21 8 12 3" />
    <path d="M3 13l9 5 9-5" />
  </svg>
)

export default function FleetMapPreview() {
  const { t, isRTL } = useLanguage()
  const [activeChip, setActiveChip] =
    useState<"all" | "moving" | "stopped" | "attention">("all")

  const counts = {
    all: dashboardMapMarkers.length + 27, // demo total (33) vs the handful of plotted markers
    moving: 24,
    stopped: 6,
    attention: 3,
  }

  const chips: {
    id: "all" | "moving" | "stopped" | "attention"
    labelKey: TranslationKey
    dot?: string
  }[] = [
    { id: "all", labelKey: "filter_all" },
    { id: "moving", labelKey: "chip_moving", dot: markerColor.moving },
    { id: "stopped", labelKey: "chip_stopped", dot: markerColor.stopped },
    {
      id: "attention",
      labelKey: "chip_needs_attention",
      dot: markerColor.attention,
    },
  ]

  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid var(--border)",
        background: "var(--card)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 18px 0",
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
          {t("map_card_title")}
        </h3>
        <span style={{ color: "var(--muted-foreground)", display: "flex" }}>
          {expandIcon}
        </span>
      </div>

      {/* Search + chips */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          padding: "14px 18px",
          flexDirection: isRTL ? "row-reverse" : "row",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 34,
            padding: "0 10px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--secondary)",
            flex: "1 1 160px",
            minWidth: 140,
            flexDirection: isRTL ? "row-reverse" : "row",
          }}
        >
          {searchIcon}
          <input
            placeholder={t("map_search_placeholder")}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 12.5,
              color: "var(--foreground)",
              textAlign: isRTL ? "right" : "left",
            }}
          />
        </div>
        {chips.map((c) => {
          const active = activeChip === c.id
          return (
            <button
              key={c.id}
              onClick={() => setActiveChip(c.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 34,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid",
                borderColor: active ? "var(--primary)" : "var(--border)",
                background: active ? "var(--primary)" : "transparent",
                color: active
                  ? "var(--primary-foreground)"
                  : "var(--muted-foreground)",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexDirection: isRTL ? "row-reverse" : "row",
              }}
            >
              {c.dot && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: active ? "currentColor" : c.dot,
                  }}
                />
              )}
              {t(c.labelKey)}
              <span style={{ fontWeight: 700, opacity: 0.8 }}>
                {counts[c.id]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Map area */}
      <div
        style={{
          position: "relative",
          margin: "0 18px 18px",
          borderRadius: 12,
          overflow: "hidden",
          background: "var(--background)",
          border: "1px solid var(--border)",
        }}
      >
        <svg
          viewBox="0 0 600 380"
          width="100%"
          height="320"
          style={{ display: "block" }}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="dashGrid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M40 0H0V40"
                fill="none"
                stroke="var(--border)"
                strokeWidth="1"
                opacity="0.5"
              />
            </pattern>
          </defs>
          <rect width="600" height="380" fill="url(#dashGrid)" />
          {/* faux road lines */}
          <path
            d="M0 260 L180 260 L230 150 L420 150 L460 260 L600 260"
            stroke="var(--muted-foreground)"
            strokeOpacity="0.35"
            strokeWidth="8"
            fill="none"
          />
          <path
            d="M300 0 L300 380"
            stroke="var(--muted-foreground)"
            strokeOpacity="0.25"
            strokeWidth="6"
            fill="none"
          />

          {dashboardMapDistricts.map((d) => (
            <text
              key={d.label}
              x={d.x}
              y={d.y}
              fontSize="11"
              fill="var(--muted-foreground)"
              opacity={0.7}
              textAnchor="middle"
              fontFamily="var(--font-sans)"
            >
              {d.label}
            </text>
          ))}

          {dashboardMapMarkers.map((m) => (
            <g key={m.id} transform={`translate(${m.x} ${m.y})`}>
              <circle r="11" fill={markerColor[m.status]} opacity="0.18" />
              <circle
                r="6"
                fill={markerColor[m.status]}
                stroke="var(--card)"
                strokeWidth="2"
              />
            </g>
          ))}
        </svg>

        {/* Zoom controls */}
        <div
          style={{
            position: "absolute",
            insetInlineStart: 10,
            top: 10,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {["+", "−"].map((sym) => (
            <button
              key={sym}
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--foreground)",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {sym}
            </button>
          ))}
          <button
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--foreground)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 4,
            }}
          >
            {layersIcon}
          </button>
        </div>

        {/* Legend footer */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            insetInlineStart: 0,
            insetInlineEnd: 0,
            display: "flex",
            gap: 14,
            padding: "8px 14px",
            background: "color-mix(in srgb, var(--card) 88%, transparent)",
            backdropFilter: "blur(6px)",
            borderTop: "1px solid var(--border)",
            flexWrap: "wrap",
            flexDirection: isRTL ? "row-reverse" : "row",
          }}
        >
          {[
            { key: "chip_moving" as TranslationKey, color: markerColor.moving },
            {
              key: "chip_stopped" as TranslationKey,
              color: markerColor.stopped,
            },
            {
              key: "chip_needs_attention" as TranslationKey,
              color: markerColor.attention,
            },
            {
              key: "legend_dot_offline" as TranslationKey,
              color: "var(--muted-foreground)",
            },
          ].map((l) => (
            <div
              key={l.key}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: l.color,
                }}
              />
              <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                {t(l.key)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
