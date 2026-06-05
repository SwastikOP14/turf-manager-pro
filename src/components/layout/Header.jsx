import { Moon, Sun } from "lucide-react"
import { useTheme } from "../../context/useTheme"
import appLogo from "../../assets/app logo.png"

export default function Header() {
  const { darkMode, toggleTheme } = useTheme()

  return (
    <header
      className="
        sticky top-0
        backdrop-blur-xl
        bg-white/80 dark:bg-[#0B1120]/80
        border-b border-black/5 dark:border-white/10
        shadow-sm
      "
      style={{ zIndex: 100000, paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="max-w-md mx-auto flex items-center justify-between px-5 py-3">

        <div className="flex items-center gap-3.5">
          {/* Logo */}
          <div
            className="w-11 h-11 rounded-2xl shrink-0 overflow-hidden"
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
            />
          </div>

          <div>
            <h1 className="text-[17px] font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
              Turf Manager
            </h1>
            <p className="text-[11px] font-bold tracking-[0.18em] text-green-700 dark:text-green-400 uppercase">
              Pro
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-10 h-10 rounded-2xl shrink-0 bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-900 dark:text-white transition hover:scale-95"
        >
          {darkMode ? <Sun size={19} /> : <Moon size={19} />}
        </button>

      </div>
    </header>
  )
}
