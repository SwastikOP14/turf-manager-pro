import { useState, useEffect } from "react"
import { App as CapacitorApp } from "@capacitor/app"
import AppRoutes from "./routes/AppRoutes"
import SplashScreen from "./components/SplashScreen"
import ErrorBoundary from "./components/ErrorBoundary"

export default function App() {
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem("tmp-splash-seen")
  )

  const handleEnter = () => {
    sessionStorage.setItem("tmp-splash-seen", "1")
    setShowSplash(false)
  }

  // While the splash screen is showing, pressing the hardware back 
  // button should close the app instead of doing nothing.
  useEffect(() => {
    if (!showSplash) return

    let listenerHandle
    CapacitorApp.addListener("backButton", () => {
      CapacitorApp.exitApp()
    }).then((handle) => { listenerHandle = handle })

    return () => { listenerHandle?.remove() }
  }, [showSplash])

  return (
    <ErrorBoundary>
      {showSplash && <SplashScreen onDone={handleEnter} />}
      <AppRoutes />
    </ErrorBoundary>
  )
}
