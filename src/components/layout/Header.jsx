import { Moon, Sun } from "lucide-react"
import { useTheme } from "../../context/useTheme"
import appLogo from "../../assets/app logo.png"

export default function Header() {
  const { darkMode, toggleTheme } = useTheme()

  return (
    <header
      className="
        sticky top-0 z-50
        backdrop-blur-xl
        bg-white/80 dark:bg-[#0B1120]/80
        border-b border-black/5 dark:border-white/10
        shadow-sm
      "
    >
      <div className="max-w-md mx-auto flex items-center justify-between px-4 py-2.5">

        <div className="flex items-center gap-3">
          {/* 3D popped logo */}
          <div
            className="w-12 h-12 rounded-2xl shrink-0 overflow-hidden"
            style={{
              background: darkMode
                ? "linear-gradient(145deg, #1e2d3d, #0d1a26)"
                : "linear-gradient(145deg, #ffffff, #e8ecf2)",
              boxShadow: darkMode
                ? "4px 4px 10px rgba(0,0,0,0.6), -2px -2px 8px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)"
                : "4px 4px 10px rgba(0,0,0,0.18), -2px -2px 8px rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,1)",
              border: darkMode
                ? "1px solid rgba(255,255,255,0.08)"
                : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <img
              src={appLogo}
              alt="Turf Manager"
              className="w-full h-full object-contain p-1"
              style={{
                filter: darkMode
                  ? "drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                  : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                transform: "translateZ(0)",
              }}
            />
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Turf Manager
            </h1>
            <p className="text-xs font-semibold tracking-widest text-green-500">
              PRO
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="
            w-11 h-11 rounded-2xl shrink-0
            bg-slate-100 dark:bg-white/5
            border border-black/5 dark:border-white/10
            flex items-center justify-center
            text-slate-900 dark:text-white
            transition hover:scale-95
          "
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

      </div>
    </header>
  )
}
