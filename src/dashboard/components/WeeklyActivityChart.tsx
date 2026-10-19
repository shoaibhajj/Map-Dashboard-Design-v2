import { useLanguage } from "../../contexts/LanguageContext"
import type { WeeklyActivityPoint } from "../types"

interface Props {
  data: WeeklyActivityPoint[]
  year?: number
}

function formatDay(dateKey: string, year: number, lang: "en" | "ar") {
  const [month, day] = dateKey.split("-").map(Number)
  const d = new Date(year, month - 1, day)
  const locale = lang === "ar" ? "ar-SA-u-nu-latn" : "en-US"
  return d.toLocaleDateString(locale, { day: "numeric", month: "long" })
}

export default function WeeklyActivityChart({ data, year = 2026 }: Props) {
  const { t, lang, isRTL } = useLanguage()

  const W = 860
  const H = 200
  const PAD_X = 16
  const max = Math.max(...data.map((d) => d.value))
  const min = 0
  const step = (W - PAD_X * 2) / (data.length - 1)
  const yFor = (v: number) => H - ((v - min) / (max - min || 1)) * (H - 20) - 6

  // Visual order follows the array as given — RTL is handled by the
  // surrounding flex container's `flexDirection`, not by reversing data.
  const points = data.map((d, i) => ({
    ...d,
    x: PAD_X + i * step,
    y: yFor(d.value),
  }))
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ")
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`

  const peak = points.reduce((a, b) => (b.value > a.value ? b : a), points[0])

  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid var(--border)",
        background: "var(--card)",
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
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
          {t("chart_weekly_title")}
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 30,
            padding: "0 10px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            fontSize: 12,
            color: "var(--muted-foreground)",
            fontWeight: 600,
          }}
        >
          {t("chart_metric_vehicle_count")}
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          direction:
            "ltr" /* chart geometry stays LTR; only labels/text flip */,
        }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            <linearGradient id="weeklyAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={PAD_X}
              x2={W - PAD_X}
              y1={H * f}
              y2={H * f}
              stroke="var(--border)"
              strokeWidth={1}
            />
          ))}
          <path d={areaPath} fill="url(#weeklyAreaFill)" />
          <path
            d={linePath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p) => (
            <circle
              key={p.dateKey}
              cx={p.x}
              cy={p.y}
              r={p === peak ? 5 : 3.5}
              fill={p === peak ? "var(--primary)" : "var(--card)"}
              stroke="var(--primary)"
              strokeWidth={2}
            />
          ))}
        </svg>

        {/* Peak callout */}
        <div
          style={{
            position: "absolute",
            left: `${(peak.x / W) * 100}%`,
            top: peak.y - 54,
            transform: "translateX(-50%)",
            background: "var(--foreground)",
            color: "var(--background)",
            borderRadius: 9,
            padding: "6px 10px",
            fontSize: 11.5,
            fontWeight: 700,
            whiteSpace: "nowrap",
            textAlign: "center",
            pointerEvents: "none",
            boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
          }}
        >
          {peak.value} {t("chart_unit_vehicle")}
          <div style={{ fontWeight: 500, opacity: 0.75, fontSize: 10.5 }}>
            {formatDay(peak.dateKey, year, lang)}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 6,
          direction: "ltr",
        }}
      >
        {data.map((d) => (
          <span
            key={d.dateKey}
            style={{
              fontSize: 10.5,
              color: "var(--muted-foreground)",
              flex: 1,
              textAlign: "center",
            }}
          >
            {formatDay(d.dateKey, year, lang)}
          </span>
        ))}
      </div>
    </div>
  )
}
