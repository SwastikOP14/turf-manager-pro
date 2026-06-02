import { useState } from "react"

import AppRoutes from "./routes/AppRoutes"
import SplashScreen from "./components/SplashScreen"

export default function App() {
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem("tmp-splash-seen")
  )

  const handleEnter = () => {
    sessionStorage.setItem("tmp-splash-seen", "1")
    setShowSplash(false)
  }

  return (
    <>
      {showSplash && <SplashScreen onDone={handleEnter} />}
      <AppRoutes />
    </>
  )
}
