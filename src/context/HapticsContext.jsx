import { createContext, useContext, useState, useCallback } from "react"

const HapticsContext = createContext()

export function HapticsProvider({ children }) {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem("haptics") !== "false"
  })

  const toggle = useCallback(() => {
    setEnabled(e => {
      const next = !e
      localStorage.setItem("haptics", String(next))
      return next
    })
  }, [])

  const trigger = useCallback((pattern = 10) => {
    if (!enabled) return
    try { navigator.vibrate?.(pattern) } catch {}
  }, [enabled])

  return (
    <HapticsContext.Provider value={{ enabled, toggle, trigger }}>
      {children}
    </HapticsContext.Provider>
  )
}

export function useHaptics() { return useContext(HapticsContext) }
