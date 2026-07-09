import { CalendarDays, Users, BarChart3, Settings, Plus } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useTheme } from "../../context/useTheme"
import { useHaptics } from "../../context/HapticsContext"

const NAV_ITEMS = [
  { name: "Bookings", icon: CalendarDays, path: "/" },
  { name: "Players",  icon: Users,        path: "/players" },
  { name: "Stats",    icon: BarChart3,    path: "/stats" },
  { name: "Settings", icon: Settings,     path: "/settings" },
]

export default function BottomNavbar({ onAddClick }) {
  const { darkMode } = useTheme()
  const location = useLocation()
  const haptics = useHaptics()

  const showAddButton =
    location.pathname === "/" || location.pathname.startsWith("/players")

  const bgColor     = darkMode ? "#111827" : "#ffffff"
  const borderColor = darkMode ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)"

  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50000, transform: "translateZ(0)" }}>
      <nav
        style={{
          position: "relative", width: "100%", height: "54px",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          background: bgColor,
          borderTop: `1px solid ${borderColor}`,
          boxShadow: darkMode ? "0 -2px 16px rgba(0,0,0,0.4)" : "0 -2px 16px rgba(15,23,42,0.06)",
          display: "flex", justifyContent: "space-around", alignItems: "center",
          paddingLeft: "12px", paddingRight: "12px", boxSizing: "content-box",
        }}
      >
        {NAV_ITEMS.map(({ name, icon: Icon, path }) => (
          <NavLink key={name} to={path} style={{ textDecoration: "none", flex: 1 }} onClick={() => haptics.trigger(10)}>
            {({ isActive }) => (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center",
                padding: "6px 8px", borderRadius: "12px",
                background: isActive ? "var(--brand-subtle)" : "transparent",
                transition: "background 0.2s ease",
              }}>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  style={{ color: isActive ? "var(--brand)" : "var(--text-muted)", transition: "color 0.2s ease" }}
                />
                {isActive && (
                  <div style={{ width: "4px", height: "4px", borderRadius: "2px", background: "var(--brand)", marginTop: "3px" }} />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {showAddButton && (
        <button
          onClick={() => { haptics.trigger(30); onAddClick() }}
          aria-label="Add"
          style={{
            position: "absolute", top: 0, left: "50%",
            transform: "translate(-50%, -50%)",
            width: "48px", height: "48px", borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg, #00D4A0, #00B4D8)",
            boxShadow: `0 0 0 4px ${bgColor}, 0 4px 20px rgba(0,212,160,0.45)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 1,
          }}
        >
          <Plus size={22} color="#fff" strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}