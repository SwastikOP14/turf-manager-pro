import { useEffect, useState, useCallback } from "react"
import { ThemeContext } from "./ThemeContextInstance"

// theme: "light" | "dark" | "system"
function resolveMode(theme) {
  if (theme === "dark")  return true
  if (theme === "light") return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function applyDark(isDark) {
  document.documentElement.classList.toggle("dark", isDark)
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme") || "system"
    const isDark = resolveMode(stored)
    applyDark(isDark)
    return stored
  })

  const darkMode = resolveMode(theme)

  // Track system preference changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e) => applyDark(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  // Apply + persist whenever theme changes
  useEffect(() => {
    applyDark(resolveMode(theme))
    localStorage.setItem("theme", theme)
  }, [theme])

  // Legacy toggleTheme (light ↔ dark, skips system)
  const toggleTheme = useCallback(() => {
    setTheme((t) => (resolveMode(t) ? "light" : "dark"))
  }, [])

  const setThemeMode = useCallback((mode) => {
    setTheme(mode)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, darkMode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  )
}
