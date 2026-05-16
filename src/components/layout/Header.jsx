import { Moon, Sun } from "lucide-react"

import { useTheme } from "../../context/ThemeContext"

export default function Header() {

  const { darkMode, toggleTheme } = useTheme()

  return (
    <div className="
      flex items-center justify-between
      px-4 py-4
      border-b
      border-black/10 dark:border-white/10
      backdrop-blur-md
      bg-white/70 dark:bg-white/5
      sticky top-0 z-50
    ">

      <div className="flex items-center gap-3">

        <div className="
          w-10 h-10 rounded-xl
          bg-green-500
          flex items-center justify-center
          font-bold text-black
        ">
          TM
        </div>

        <div>
          <h1 className="
            font-bold text-lg
            text-black dark:text-white
          ">
            Turf Manager
          </h1>

          <p className="text-xs text-green-500">
            PRO
          </p>
        </div>

      </div>

      <button
        onClick={toggleTheme}
        className="
          w-10 h-10 rounded-xl
          bg-black/5 dark:bg-white/10
          flex items-center justify-center
          text-black dark:text-white
        "
      >

        {
          darkMode
            ? <Sun size={18} />
            : <Moon size={18} />
        }

      </button>

    </div>
  )
}