import { useLanguage } from "../../contexts/LanguageContext"
import type { RecentAlert, AlertToneKey } from "../types"

interface Props {
  alerts: RecentAlert[]
}

const toneColor: Record<AlertToneKey, string> = {
  moving: "var(--primary)",
  stopped: "var(--warning)",
  attention: "var(--danger)",
}

const toneIcon: Record<AlertToneKey, React.ReactNode> = {
  moving: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </svg>
  ),
  stopped: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    >
      <line x1="8" y1="6" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="18" />
    </svg>
  ),
  attention: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
      <path d="M12 9.5v5" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
}

export default function RecentAlertsFeed({ alerts }: Props) {
  const { t, isRTL } = useLanguage()

  return (
    <div
      style={{
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
            fontSize: 15.5,
            fontWeight: 700,
            color: "var(--foreground)",
          }}
        >
          {t("alerts_recent_title")}
        </h3>
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--primary)",
          }}
        >
          {t("view_all")}
        </button>
      </div>

      <div>
        {alerts.map((a, i) => (
          <div
            key={a.id}
            style={{
              display: "flex",
              gap: 12,
              flexDirection: isRTL ? "row-reverse" : "row",
            }}
          >
            {/* dot + connecting line */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: `color-mix(in srgb, ${toneColor[a.tone]} 16%, transparent)`,
                  color: toneColor[a.tone],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {toneIcon[a.tone]}
              </div>
              {i < alerts.length - 1 && (
                <div
                  style={{
                    width: 1,
                    flex: 1,
                    minHeight: 22,
                    background: "var(--border)",
                    marginTop: 2,
                  }}
                />
              )}
            </div>

            <div
              style={{
                paddingBottom: i < alerts.length - 1 ? 18 : 0,
                textAlign: isRTL ? "right" : "left",
                flex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  flexDirection: isRTL ? "row-reverse" : "row",
                }}
              >
                <span
                  style={{
                    fontSize: 11.5,
                    color: "var(--muted-foreground)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {a.time}
                </span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: toneColor[a.tone],
                  marginTop: 2,
                }}
              >
                {t(a.messageKey)}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                  marginTop: 1,
                }}
              >
                {a.detail}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
