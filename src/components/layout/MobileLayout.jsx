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
    /*
      Outer shell fills the full viewport.
      We use a fixed-height flex-column so the scrollable area is
      ONLY <main> — not the whole page. This prevents content from
      ever drifting under the fixed header or bottom nav.
    */
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        background: "var(--color-surface)",
      }}
    >
      <div
        className="bg-slate-50 dark:bg-[#020817]"
        style={{
          width: "100%",
          maxWidth: "28rem",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          borderLeft:  "1px solid rgba(15,23,42,0.07)",
          borderRight: "1px solid rgba(15,23,42,0.07)",
        }}
      >
        {/*
          Header renders a fixed bar (position:fixed, z:100000)
          PLUS a spacer div that occupies its height in the flex column.
          This means <main> starts exactly below the header — no gap.
        */}
        <Header />

        {/*
          <main> is the ONLY scrolling container.
          overflow-y:auto means content scrolls inside this box —
          never behind the header or nav bar.
        */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            /* Bottom padding = bottom nav height (3.5rem) + safe-area */
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 5.5rem)",
          }}
        >
          {children}
        </main>

        {/* Fixed bottom navigation */}
        <BottomNavbar />

        {showFab && <FloatingButton onClick={onFabClick} />}
      </div>
    </div>
  )
}
