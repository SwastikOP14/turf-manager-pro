import { Moon, Sun } from "lucide-react"
import { useTheme } from "../../context/useTheme"
import appLogo from "../../assets/app logo.png"

export default function Header() {
  const { darkMode, toggleTheme } = useTheme()

  return (
    <>
      {/*
        ── True fixed app bar ──────────────────────────────────────────
        Spans the full viewport width so it looks like a real Android
        top app bar, not a floating card.
        paddingTop = safe-area-inset-top so it covers the status bar
        on edge-to-edge devices (notch / punch-hole / dynamic island).
      */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100000,
          // Comfortable gap below status bar — not crowded, not floaty
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)",
          background: darkMode ? "#0B1120" : "#ffffff",
          borderBottom: darkMode
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(15,23,42,0.10)",
          boxShadow: darkMode
            ? "0 1px 0 rgba(255,255,255,0.04), 0 2px 12px rgba(0,0,0,0.4)"
            : "0 1px 0 rgba(15,23,42,0.06), 0 2px 12px rgba(15,23,42,0.08)",
        }}
      >
        {/* Inner row — capped at max-w-md and centred on wide screens */}
        <div
          style={{
            maxWidth: "28rem",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.625rem 1.25rem",
            height: "3.5rem",          // 56 dp — standard Android app bar height
          }}
        >
          {/* ── Left: logo + wordmark ─────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "0.75rem",
                overflow: "hidden",
                flexShrink: 0,
                background: darkMode
                  ? "linear-gradient(145deg,#1e2d3d,#0d1a26)"
                  : "linear-gradient(145deg,#f8fafc,#e8ecf2)",
                border: darkMode
                  ? "1px solid rgba(255,255,255,0.10)"
                  : "1px solid rgba(15,23,42,0.10)",
                boxShadow: darkMode
                  ? "0 2px 8px rgba(0,0,0,0.5)"
                  : "0 2px 8px rgba(15,23,42,0.12)",
              }}
            >
              <img
                src={appLogo}
                alt="Turf Manager"
                style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }}
              />
            </div>

            <div>
              <p
                style={{
                  fontSize: "1.0625rem",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                  color: darkMode ? "#ffffff" : "#0f172a",
                  margin: 0,
                }}
              >
                Turf Manager
              </p>
              <p
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: darkMode ? "#4ade80" : "#15803d",
                  margin: 0,
                }}
              >
                Pro
              </p>
            </div>
          </div>

          {/* ── Right: theme toggle ───────────────────────── */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "0.75rem",
              border: darkMode
                ? "1px solid rgba(255,255,255,0.10)"
                : "1px solid rgba(15,23,42,0.10)",
              background: darkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9",
              color: darkMode ? "#ffffff" : "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              cursor: "pointer",
              transition: "transform 0.15s ease, background 0.2s ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.93)")}
            onMouseUp={(e)   => (e.currentTarget.style.transform = "scale(1)")}
            onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.93)")}
            onTouchEnd={(e)   => (e.currentTarget.style.transform = "scale(1)")}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/*
        Spacer = bar row (56px) + 10px top padding + safe-area.
        Flex column: <main> starts immediately below this.
      */}
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
