import { CalendarDays, Users, BarChart3, Settings } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useTheme } from "../../context/useTheme"

const NAV_ITEMS = [
  { name: "Bookings", icon: CalendarDays, path: "/" },
  { name: "Players",  icon: Users,        path: "/players" },
  { name: "Stats",    icon: BarChart3,    path: "/stats" },
  { name: "Settings", icon: Settings,     path: "/settings" },
]

export default function BottomNavbar() {
  const { darkMode } = useTheme()

  return (
    <div
      className="fixed left-0 right-0 flex justify-center"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
        zIndex: 50000,
        padding: "0 16px",
      }}
    >
      <nav
        style={{
          width: "100%",
          maxWidth: "28rem",
          borderRadius: "24px",
          padding: "8px 8px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          background: darkMode
            ? "rgba(17,24,39,0.88)"
            : "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 -4px 30px rgba(0,0,0,0.15), 0 4px 24px rgba(0,0,0,0.12)",
          border: darkMode
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(15,23,42,0.08)",
        }}
      >
        {NAV_ITEMS.map(({ name, icon: Icon, path }) => (
          <NavLink
            key={name}
            to={path}
            className="flex flex-col items-center"
            style={{ textDecoration: "none", flex: 1 }}
          >
            {({ isActive }) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                  padding: "6px 12px",
                  borderRadius: "16px",
                  background: isActive ? "var(--brand-subtle)" : "transparent",
                  transition: "background 0.2s ease",
                  minWidth: 0,
                }}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{
                    color: isActive ? "var(--brand)" : "var(--text-muted)",
                    transition: "color 0.2s ease",
                  }}
                />
                {isActive && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "var(--brand)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {name}
                  </span>
                )}
                {isActive && (
                  <div
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "2px",
                      background: "var(--brand)",
                    }}
                  />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
