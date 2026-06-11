import { useTheme } from "../../context/useTheme"
import appLogo from "../../assets/app logo.png"

export default function Header() {
  const { darkMode } = useTheme()

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
            padding: "0.625rem 1.25rem",
            height: "3.5rem",
          }}
        >
          {/* Logo + wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "10px",
                overflow: "hidden",
                flexShrink: 0,
                background: darkMode
                  ? "linear-gradient(145deg,#1a2540,#0d1828)"
                  : "linear-gradient(145deg,#f8fafc,#e8ecf2)",
                border: `1px solid var(--bg-border)`,
                boxShadow: darkMode
                  ? "0 2px 8px rgba(0,0,0,0.5)"
                  : "0 2px 8px rgba(15,23,42,0.10)",
              }}
            >
              <img
                src={appLogo}
                alt="Turf Manager"
                style={{ width: "100%", height: "100%", objectFit: "contain", padding: "3px" }}
              />
            </div>
            <div>
              <p style={{
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
                margin: 0,
              }}>
                Turf Manager
              </p>
              <p style={{
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--brand)",
                margin: 0,
              }}>
                Pro
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
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
