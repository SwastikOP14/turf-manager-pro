import { useLocation } from "react-router-dom"
import Header from "./Header"
import BottomNavbar from "./BottomNavbar"

export default function MobileLayout({ children, hideFab = false, onFabClick }) {
  const { pathname } = useLocation()

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        background: "var(--bg-base)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "28rem",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          borderLeft:  "1px solid var(--bg-border)",
          borderRight: "1px solid var(--bg-border)",
          background: "var(--bg-base)",
        }}
      >
        <Header />

        <main
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 7rem)",
          }}
        >
          {children}
        </main>

        <BottomNavbar onAddClick={onFabClick} />
      </div>
    </div>
  )
}
