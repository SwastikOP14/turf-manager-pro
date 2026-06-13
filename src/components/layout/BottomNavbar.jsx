import { CalendarDays, Users, BarChart3, Settings } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useTheme } from "../../context/useTheme"

const NAV_ITEMS = [
  { name: "Bookings", icon: CalendarDays, path: "/" },
  { name: "Players",  icon: Users,        path: "/players" },
  { name: "Stats",    icon: BarChart3,    path: "/stats" },
  { name: "Settings", icon: Settings,     path: "/settings" },
]

export default function BottomNavbar() {
  const { darkMode } = useTheme()
  const location = useLocation()
  
  // Only show notch on Bookings and Players pages
  const showNotch = location.pathname === "/" || location.pathname.startsWith("/players")

  const bgColor = darkMode
    ? "rgba(17,24,39,0.95)"
    : "rgba(255,255,255,0.95)"
  
  const borderColor = darkMode
    ? "rgba(255,255,255,0.08)"
    : "rgba(15,23,42,0.08)"

  return (
    <div
      className="fixed left-0 right-0 bottom-0"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        zIndex: 50000,
      }}
    >
      <nav
        style={{
          width: "100%",
          height: "70px",
          position: "relative",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          paddingLeft: "12px",
          paddingRight: "12px",
          paddingTop: showNotch ? "12px" : "8px",
          paddingBottom: "8px",
          background: bgColor,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: `1px solid ${borderColor}`,
          clipPath: showNotch 
            ? "path('M 0,35 Q 0,20 10,10 L 140,10 Q 150,10 155,15 Q 160,20 160,25 Q 165,20 175,15 Q 185,10 200,10 Q 215,10 235,20 Q 250,28 250,35 Q 250,28 265,20 Q 285,10 300,10 Q 315,10 325,15 Q 330,20 335,25 Q 340,20 345,15 Q 355,10 365,10 L 600,10 Q 610,10 610,20 L 610,100 L 0,100 Z')"
            : "none",
          maskImage: showNotch
            ? `radial-gradient(circle 40px at 50% -8px, transparent 39px, black 40px)`
            : "none",
          WebkitMaskImage: showNotch
            ? `radial-gradient(circle 40px at 50% -8px, transparent 39px, black 40px)`
            : "none",
        }}
      >
        {NAV_ITEMS.map(({ name, icon: Icon, path }) => (
          <NavLink
            key={name}
            to={path}
            className="flex flex-col items-center"
            style={{ textDecoration: "none", flex: 1, position: "relative", zIndex: 1 }}
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
