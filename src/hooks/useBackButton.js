import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

// Root tab routes — back here should minimize, not navigate
const ROOT_ROUTES = ["/", "/players", "/stats", "/settings"]

export function useBackButton() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let cleanup = null

    const setup = async () => {
      try {
        const { App } = await import("@capacitor/app")

        const listener = await App.addListener("backButton", ({ canGoBack }) => {
          const isRoot = ROOT_ROUTES.includes(location.pathname)

          if (isRoot) {
            App.minimizeApp()
          } else {
            navigate(-1)
          }
        })

        cleanup = () => listener.remove()
      } catch {
        // Not running in Capacitor — browser handles back natively, no intervention needed
      }
    }

    setup()

    return () => {
      cleanup?.()
    }
  }, [location.pathname, navigate])
}
