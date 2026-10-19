import { useLanguage } from "../../contexts/LanguageContext"
import type { TranslationKey } from "../../i18n/strings"

const Icon = {
  truck: (
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
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  driver: (
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
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  ),
  group: (
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
      <circle cx="9" cy="8" r="3" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <circle cx="17.5" cy="8.5" r="2.5" />
      <path d="M15.2 13.2a5.5 5.5 0 0 1 6.3 5.3" />
    </svg>
  ),
  send: (
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
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
}

const plusBadge = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const actions: {
  id: string
  icon: keyof typeof Icon
  labelKey: TranslationKey
  withPlus?: boolean
}[] = [
  {
    id: "add_vehicle",
    icon: "truck",
    labelKey: "action_add_vehicle",
    withPlus: true,
  },
  {
    id: "add_driver",
    icon: "driver",
    labelKey: "action_add_driver",
    withPlus: true,
  },
  {
    id: "create_group",
    icon: "group",
    labelKey: "action_create_group",
    withPlus: true,
  },
  { id: "send_alert", icon: "send", labelKey: "action_send_alert" },
]

export default function QuickActionsGrid() {
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
        gap: 14,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 15.5,
          fontWeight: 700,
          color: "var(--foreground)",
          textAlign: isRTL ? "right" : "left",
        }}
      >
        {t("quick_actions_title")}
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {actions.map((a) => (
          <button
            key={a.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: isRTL ? "flex-end" : "flex-start",
              gap: 10,
              padding: "14px 12px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--secondary)",
              cursor: "pointer",
              textAlign: isRTL ? "right" : "left",
            }}
          >
            <span
              style={{
                position: "relative",
                width: 34,
                height: 34,
                borderRadius: 9,
                background:
                  "color-mix(in srgb, var(--primary) 14%, transparent)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {Icon[a.icon]}
              {a.withPlus && (
                <span
                  style={{
                    position: "absolute",
                    bottom: -3,
                    insetInlineEnd: -3,
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid var(--card)",
                  }}
                >
                  {plusBadge}
                </span>
              )}
            </span>
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--foreground)",
              }}
            >
              {t(a.labelKey)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
