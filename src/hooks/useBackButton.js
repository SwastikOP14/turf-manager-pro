import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

const ROOT_ROUTES = ["/", "/players", "/stats", "/settings"]

// ─── Global modal stack ────────────────────────────────────────────────────
// Modals register a dismiss callback here. Back button dismisses top one first.
const modalStack = []

export function registerModal(dismissFn) {
  modalStack.push(dismissFn)
  return () => {
    const idx = modalStack.lastIndexOf(dismissFn)
    if (idx !== -1) modalStack.splice(idx, 1)
  }
}

// ─── Hook: call once inside BrowserRouter ─────────────────────────────────
export function useBackButton() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let active = true
    let listener = null

    const setup = async () => {
      try {
        const { App } = await import("@capacitor/app")
        if (!active) return

        listener = await App.addListener("backButton", () => {
          // If any modal is open, close the top one first
          if (modalStack.length > 0) {
            const dismiss = modalStack[modalStack.length - 1]
            dismiss()
            return
          }

          const isRoot = ROOT_ROUTES.includes(location.pathname)
          if (isRoot) {
            App.minimizeApp()
          } else {
            navigate(-1)
          }
        })
      } catch {
        // Browser — no intervention needed
      }
    }

    setup()

    return () => {
      active = false
      if (listener) {
        listener.remove()
      }
    }
  }, [location.pathname, navigate])
}
