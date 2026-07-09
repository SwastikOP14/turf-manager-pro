import { Sun, Moon, Monitor, Smartphone } from "lucide-react"
import { useTheme } from "../../context/useTheme"
import { useHaptics } from "../../context/HapticsContext"
import appLogo from "../../assets/app logo.png"

export default function Header() {
  const { darkMode, theme, setThemeMode } = useTheme()
  const { enabled: hapticsEnabled, toggle: toggleHaptics, trigger } = useHaptics()

  const cycleTheme = () => {
    const order = ["light", "system", "dark"]
    const idx   = order.indexOf(theme)
    trigger(10)
    setThemeMode(order[(idx + 1) % order.length])
  }

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor

  const iconBtnStyle = {
    width: "36px", height: "36px",
    borderRadius: "10px",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: darkMode ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.05)",
    border: `1px solid var(--bg-border)`,
    cursor: "pointer",
    color: "var(--text-secondary)",
    flexShrink: 0,
    transition: "background 0.15s ease, transform 0.1s ease",
  }

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100000,
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)",
          background: darkMode ? "#0A0F1E" : "#FFFFFF",
          borderBottom: `1px solid var(--bg-border)`,
          boxShadow: darkMode
            ? "0 1px 0 rgba(255,255,255,0.04), 0 2px 16px rgba(0,0,0,0.4)"
            : "0 1px 0 rgba(15,23,42,0.05), 0 2px 12px rgba(15,23,42,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: "28rem",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.5rem 1.25rem",
            height: "3.5rem",
          }}
        >
          {/* ── Left: logo + wordmark ──────────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={appLogo}
              alt="Turf Manager"
              style={{
                width: "32px", height: "32px",
                objectFit: "contain",
                borderRadius: "8px",
                flexShrink: 0,
              }}
            />
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
              <span style={{
                fontSize: "16px", fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}>
                Turf Manager
              </span>
              {/* PRO badge pill */}
              <span style={{
                fontSize: "9px", fontWeight: 700,
                background: "var(--brand)",
                color: "#000",
                padding: "1px 6px",
                borderRadius: "4px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                lineHeight: "16px",
              }}>
                PRO
              </span>
            </div>
          </div>

          {/* ── Right: theme toggle + haptics ─────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={cycleTheme}
              aria-label="Toggle theme"
              style={iconBtnStyle}
              onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.90)")}
              onTouchEnd={(e)   => (e.currentTarget.style.transform = "scale(1)")}
            >
              <ThemeIcon size={16} />
            </button>

            <button
              onClick={() => { if (!hapticsEnabled) trigger(30); toggleHaptics() }}
              aria-label="Toggle haptics"
              style={{
                ...iconBtnStyle,
                color: hapticsEnabled ? "var(--brand)" : "var(--text-muted)",
                position: "relative"
              }}
              onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.90)")}
              onTouchEnd={(e)   => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Smartphone size={16} />
              {!hapticsEnabled && (
                <div style={{
                  position: "absolute",
                  width: "1.5px",
                  height: "24px",
                  background: "var(--text-muted)",
                  transform: "rotate(-45deg)",
                  top: "50%",
                  left: "50%",
                  marginLeft: "-0.75px",
                  marginTop: "-12px"
                }} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Spacer — same height as header */}
      <div
        aria-hidden="true"
        style={{
          height: "calc(3.5rem + 10px + env(safe-area-inset-top, 0px))",
          flexShrink: 0,
        }}
      />
    </>
  )
}
