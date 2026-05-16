import {
  CalendarDays,
  Users,
  BarChart3,
  Settings
} from "lucide-react"

import { NavLink } from "react-router-dom"

export default function BottomNav() {

  const navItems = [
    {
      name: "Bookings",
      icon: CalendarDays,
      path: "/"
    },
    {
      name: "Players",
      icon: Users,
      path: "/players"
    },
    {
      name: "Stats",
      icon: BarChart3,
      path: "/stats"
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings"
    }
  ]

  return (
    <div className="
      fixed bottom-0 left-0 right-0
      max-w-md mx-auto
      bg-white/80 dark:bg-[#0f172a]/90
      backdrop-blur-xl
      border-t border-black/10 dark:border-white/10
      flex justify-around items-center
      py-3 z-50
    ">

      {navItems.map((item) => {

        const Icon = item.icon

        return (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center text-xs ${
                isActive
                  ? "text-green-500"
                  : "text-gray-500 dark:text-gray-400"
              }`
            }
          >

            <Icon size={20} />

            <span className="mt-1">
              {item.name}
            </span>

          </NavLink>
        )
      })}

    </div>
  )
}