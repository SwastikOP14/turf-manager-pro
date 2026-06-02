import { useContext } from "react"

import { ThemeContext } from "./ThemeContextInstance"

export function useTheme() {
  return useContext(ThemeContext)
}
