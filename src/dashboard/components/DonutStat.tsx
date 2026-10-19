import { useLanguage } from "../../contexts/LanguageContext"
import type { TranslationKey } from "../../i18n/strings"
import type { DonutSlice } from "../types"

interface Props {
  titleKey: TranslationKey
  slices: DonutSlice[]
  centerValue: number
  centerUnitKey: TranslationKey
  showViewAll?: boolean
}

const R = 54
const STROKE = 16
const CIRC = 2 * Math.PI * R

export default function DonutStat({
  titleKey,
  slices,
  centerValue,
  centerUnitKey,
  showViewAll,
}: Props) {
  const { t, isRTL } = useLanguage()
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1

  let offset = 0
  const segments = slices.map((s) => {
    const fraction = s.value / total
    const length = fraction * CIRC
    const seg = { ...s, length, offset, fraction }
    offset += length
    return seg
  })

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        borderRadius: 16,
        border: "1px solid var(--border)",
        background: "var(--card)",
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 16,
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
        <h3
          style={{
            margin: 0,
            fontSize: 14.5,
            fontWeight: 700,
            color: "var(--foreground)",
          }}
        >
          {t(titleKey)}
        </h3>
        {showViewAll && (
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
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
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexDirection: isRTL ? "row-reverse" : "row",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 132,
            height: 132,
            flexShrink: 0,
          }}
        >
          <svg
            width="132"
            height="132"
            viewBox="0 0 132 132"
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx="66"
              cy="66"
              r={R}
              fill="none"
              stroke="var(--secondary)"
              strokeWidth={STROKE}
            />
            {segments.map((s) => (
              <circle
                key={s.labelKey}
                cx="66"
                cy="66"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={STROKE}
                strokeDasharray={`${s.length} ${CIRC - s.length}`}
                strokeDashoffset={-s.offset}
                strokeLinecap="butt"
              />
            ))}
          </svg>
          {/* Centered label — an absolutely-positioned overlay, not part of
              the rotated SVG, so the text itself stays upright. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "var(--foreground)",
                fontFamily: "var(--font-display)",
              }}
            >
              {centerValue}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--muted-foreground)",
                fontWeight: 600,
              }}
            >
              {t(centerUnitKey)}
            </div>
          </div>
        </div>

        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}
        >
          {segments.map((s) => (
            <div
              key={s.labelKey}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                flexDirection: isRTL ? "row-reverse" : "row",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  flexDirection: isRTL ? "row-reverse" : "row",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: s.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 12.5,
                    color: "var(--foreground)",
                    fontWeight: 500,
                  }}
                >
                  {t(s.labelKey)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexDirection: isRTL ? "row-reverse" : "row",
                }}
              >
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "var(--foreground)",
                  }}
                >
                  {s.value}
                </span>
                <span
                  style={{ fontSize: 11, color: "var(--muted-foreground)" }}
                >
                  ({Math.round(s.fraction * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
