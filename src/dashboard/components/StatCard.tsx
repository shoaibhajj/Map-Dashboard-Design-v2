import type { ReactNode } from "react"
import { useLanguage } from "../../contexts/LanguageContext"
import type { TranslationKey } from "../../i18n/strings"

export type StatTone = "solid" | "moving" | "stopped" | "attention"

interface Props {
  titleKey: TranslationKey
  value: number
  trendPercent: number
  trendGood: boolean
  sparkline: number[]
  icon: ReactNode
  tone: StatTone
}

const toneColor: Record<StatTone, string> = {
  solid: "var(--primary-foreground)",
  moving: "var(--primary)",
  stopped: "var(--warning)",
  attention: "var(--danger)",
}

function Sparkline({
  data,
  color,
  filled,
}: {
  data: number[]
  color: string
  filled: boolean
}) {
  const w = 84
  const h = 30
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = w / (data.length - 1)
  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(" ")
  const areaPath = `M0,${h} L${points} L${w},${h} Z`

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ display: "block", flexShrink: 0 }}
    >
      {filled && (
        <polygon
          points={`0,${h} ${points} ${w},${h}`}
          fill={color}
          opacity={0.18}
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={filled ? 1 : 0.9}
      />
    </svg>
  )
}

export default function StatCard({
  titleKey,
  value,
  trendPercent,
  trendGood,
  sparkline,
  icon,
  tone,
}: Props) {
  const { t, isRTL } = useLanguage()
  const isSolid = tone === "solid"
  const trendColor = trendGood
    ? isSolid
      ? "var(--primary-foreground)"
      : "var(--primary)"
    : "var(--danger)"
  const arrow = trendPercent >= 0 ? "↑" : "↓"

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        borderRadius: 16,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        background: isSolid
          ? "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)"
          : tone === "attention"
            ? "color-mix(in srgb, var(--danger) 8%, var(--card))"
            : "var(--card)",
        border: isSolid ? "none" : "1px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: isRTL ? "row-reverse" : "row",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isSolid
              ? "rgba(255,255,255,0.22)"
              : `color-mix(in srgb, ${toneColor[tone]} 16%, transparent)`,
            color: isSolid ? "var(--primary-foreground)" : toneColor[tone],
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: isSolid
              ? "rgba(255,255,255,0.8)"
              : "var(--muted-foreground)",
            padding: 4,
            display: "flex",
          }}
          aria-label="…"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
          </svg>
        </button>
      </div>

      <div style={{ textAlign: isRTL ? "right" : "left" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: isSolid
              ? "rgba(255,255,255,0.92)"
              : "var(--muted-foreground)",
            marginBottom: 4,
          }}
        >
          {t(titleKey)}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: isSolid ? "var(--primary-foreground)" : "var(--foreground)",
            fontFamily: "var(--font-display)",
          }}
        >
          {value}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: isRTL ? "row-reverse" : "row",
          gap: 8,
        }}
      >
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: trendColor,
            whiteSpace: "nowrap",
          }}
        >
          {arrow} {Math.abs(trendPercent)}%{" "}
          <span
            style={{
              fontWeight: 500,
              opacity: 0.8,
              color: isSolid
                ? "rgba(255,255,255,0.85)"
                : "var(--muted-foreground)",
            }}
          >
            {t("kpi_trend_suffix")}
          </span>
        </div>
        <Sparkline
          data={sparkline}
          color={isSolid ? "var(--primary-foreground)" : toneColor[tone]}
          filled={isSolid}
        />
      </div>
    </div>
  )
}
