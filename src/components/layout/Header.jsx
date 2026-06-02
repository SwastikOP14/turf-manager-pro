import { Moon, Sun } from "lucide-react"
import { useTheme } from "../../context/useTheme"

const logoSrc = "/app-logo.png"

export default function Header() {
  const { darkMode, toggleTheme } = useTheme()

  return (
    <header className="
      sticky top-0 z-50
      backdrop-blur-xl
      bg-white/80 dark:bg-[#0B1120]/80
      border-b border-black/5 dark:border-white/10
      shadow-sm
    ">
      <div className="max-w-md mx-auto flex items-center justify-between px-4 py-2.5">
        <img
          src={logoSrc}
          alt="Turf Manager Pro"
          className="h-14 w-auto max-w-[200px] object-contain object-left"
        />

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="
            w-11 h-11 rounded-2xl shrink-0
            bg-slate-100 dark:bg-white/5
            border border-black/5 dark:border-white/10
            flex items-center justify-center
            text-slate-900 dark:text-white
            transition hover:scale-[0.98]
          "
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  )
}
