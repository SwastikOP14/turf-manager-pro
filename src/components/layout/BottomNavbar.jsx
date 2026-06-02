import {
  CalendarDays,
  Users,
  BarChart3,
  Settings
} from "lucide-react"
import { NavLink } from "react-router-dom"

export default function BottomNavbar() {
  const navItems = [
    { name: "Bookings", icon: CalendarDays, path: "/" },
    { name: "Players", icon: Users, path: "/players" },
    { name: "Stats", icon: BarChart3, path: "/stats" },
    { name: "Settings", icon: Settings, path: "/settings" }
  ]

  return (
    <div className="
      fixed bottom-0 left-1/2 -translate-x-1/2
      w-full max-w-md
      border-t border-black/10 dark:border-white/10
      bg-white/95 dark:bg-[#0B1120]/95
      backdrop-blur-xl z-40
    ">
      <div className="max-w-md mx-auto flex justify-around py-3 px-2">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center gap-1 text-xs font-medium transition
                ${isActive
                  ? "text-green-500"
                  : "text-slate-500 dark:text-gray-400"
                }
              `}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}
