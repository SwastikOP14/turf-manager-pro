import { useEffect, useState } from "react"

import { ThemeContext } from "./ThemeContextInstance"

export function ThemeProvider({ children }) {

  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("theme")

    const isDark = stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches

    document.documentElement.classList.toggle("dark", isDark)

    return isDark
  })

  useEffect(() => {

    if (darkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }

  }, [darkMode])

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
