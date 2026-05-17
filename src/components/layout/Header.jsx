import { Moon, Sun } from "lucide-react"

import { useTheme } from "../../context/ThemeContext"

export default function Header() {

  const {
    darkMode,
    toggleTheme
  } = useTheme()

  return (

    <header className="
      sticky top-0 z-50

      backdrop-blur-xl

      bg-white/70
      dark:bg-[#0B1120]/70

      border-b
      border-black/5
      dark:border-white/10
    ">

      <div className="
        max-w-md mx-auto

        flex items-center justify-between

        px-5 py-4
      ">

        {/* Left */}
        <div>

          <h1 className="
            text-xl font-bold
            text-black dark:text-white
          ">
            Turf Manager
          </h1>

          <p className="
            text-xs
            text-gray-500 dark:text-gray-400
          ">
            Smart Turf Booking System
          </p>

        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}

          className="
            w-11 h-11

            rounded-2xl

            bg-white/80
            dark:bg-white/5

            border
            border-black/5
            dark:border-white/10

            flex items-center justify-center

            text-black
            dark:text-white

            transition
          "
        >

          {
            darkMode
              ? <Sun size={20} />
              : <Moon size={20} />
          }

        </button>

      </div>

    </header>

  )
}