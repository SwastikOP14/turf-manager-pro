import { useLocation } from "react-router-dom"

import Header from "./Header"
import BottomNavbar from "./BottomNavbar"
import FloatingButton from "./FloatingButton"

function shouldShowFab(pathname) {
  return pathname === "/" || pathname === "/players"
}

export default function MobileLayout({
  children,
  hideFab = false,
  onFabClick
}) {
  const { pathname } = useLocation()
  const showFab = !hideFab && shouldShowFab(pathname)

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#020817] flex justify-center">
      <div className="
        w-full max-w-md min-h-screen relative overflow-visible
        border-x border-black/10 dark:border-white/10
        bg-slate-50 dark:bg-[#020817]
      ">
        <Header />

        <main className="pb-32 overflow-visible scroll-smooth">
          {children}
        </main>

        <BottomNavbar />

        {showFab && <FloatingButton onClick={onFabClick} />}
      </div>
    </div>
  )
}
