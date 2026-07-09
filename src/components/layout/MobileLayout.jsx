import { useLocation } from "react-router-dom"
import { useEffect, useRef } from "react"
import Header from "./Header"
import BottomNavbar from "./BottomNavbar"

export default function MobileLayout({ children, hideFab = false, onFabClick }) {
  const { pathname } = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    const handleFocusIn = (e) => {
      const target = e.target
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        // Small delay to ensure keyboard is opening
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 300)
      }
    }

    const mainElement = mainRef.current
    if (mainElement) {
      mainElement.addEventListener('focusin', handleFocusIn)
    }

    return () => {
      if (mainElement) {
        mainElement.removeEventListener('focusin', handleFocusIn)
      }
    }
  }, [])

  const handleContentClick = (e) => {
    // Dismiss keyboard when tapping outside input fields
    const target = e.target
    const isInput = target.tagName === 'INPUT' || 
                    target.tagName === 'TEXTAREA' || 
                    target.tagName === 'SELECT' ||
                    target.closest('input, textarea, select')
    
    if (!isInput && document.activeElement) {
      const activeEl = document.activeElement
      if (activeEl.tagName === 'INPUT' || 
          activeEl.tagName === 'TEXTAREA' || 
          activeEl.tagName === 'SELECT') {
        activeEl.blur()
      }
    }
  }

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
          borderLeft: "1px solid var(--bg-border)",
          borderRight: "1px solid var(--bg-border)",
          background: "var(--bg-base)",
        }}
      >
        <Header />

        <main
          ref={mainRef}
          onClick={handleContentClick}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 5rem)",
            scrollPaddingBottom: "6rem",
          }}
        >
          {children}
        </main>

        <BottomNavbar onAddClick={onFabClick} />
      </div>
    </div>
  )
}
