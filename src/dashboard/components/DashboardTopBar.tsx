import { useLanguage } from "../../contexts/LanguageContext"
import ThemeToggle from "../../shared/ThemeToggle"
import LanguageToggle from "../../shared/LanguageToggle"

interface Props {
  userName?: string
  notificationCount?: number
}

const searchIcon = (
  <svg
    width="15"
    height="15"
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

const bellIcon = (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const chevronIcon = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--muted-foreground)"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

export default function DashboardTopBar({
  userName = "شعيب",
  notificationCount = 3,
}: Props) {
  const { t, isRTL } = useLanguage()

  const ctrlBtnStyle: React.CSSProperties = {
    width: 38,
    height: 38,
    borderRadius: 9,
    border: "1px solid var(--border)",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--muted-foreground)",
    flexShrink: 0,
  }

  return (
    <header
      style={{
        height: "var(--topbar-height)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--sidebar)",
        flexShrink: 0,
        flexDirection: isRTL ? "row-reverse" : "row",
      }}
    >
      {/* Search */}
      <div
        style={{
          flex: 1,
          maxWidth: 480,
          height: 38,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px",
          borderRadius: 9,
          border: "1px solid var(--border)",
          background: "var(--secondary)",
          flexDirection: isRTL ? "row-reverse" : "row",
        }}
      >
        {searchIcon}
        <input
          placeholder={t("dash_search_placeholder")}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 13,
            color: "var(--foreground)",
            textAlign: isRTL ? "right" : "left",
            fontFamily: "var(--font-sans)",
          }}
        />
        <kbd
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            color: "var(--muted-foreground)",
            border: "1px solid var(--border)",
            borderRadius: 5,
            padding: "2px 6px",
            background: "var(--card)",
            flexShrink: 0,
          }}
        >
          ⌘K
        </kbd>
      </div>

      <div style={{ flex: 1 }} />

      {/* Right controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexDirection: isRTL ? "row-reverse" : "row",
        }}
      >
        <LanguageToggle variant="nav" />
        <ThemeToggle variant="nav" />

        <button
          title={t("notifications")}
          style={{ ...ctrlBtnStyle, position: "relative" }}
        >
          {bellIcon}
          {notificationCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -4,
                insetInlineEnd: -4,
                minWidth: 16,
                height: 16,
                padding: "0 3px",
                borderRadius: 999,
                background: "var(--danger)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid var(--card)",
              }}
            >
              {notificationCount}
            </span>
          )}
        </button>

        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 8px 4px 4px",
            borderRadius: 9,
            border: "1px solid var(--border)",
            background: "transparent",
            cursor: "pointer",
            flexDirection: isRTL ? "row-reverse" : "row",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              background:
                "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary-foreground)",
              fontSize: 12,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {userName.charAt(0)}
          </div>
          <div
            style={{ lineHeight: 1.25, textAlign: isRTL ? "right" : "left" }}
          >
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "var(--foreground)",
                whiteSpace: "nowrap",
              }}
            >
              {userName}
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: "var(--muted-foreground)",
                whiteSpace: "nowrap",
              }}
            >
              {t("dash_admin_role")}
            </div>
          </div>
          {chevronIcon}
        </button>
      </div>
    </header>
  )
}
