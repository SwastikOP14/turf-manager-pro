import { Plus } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

export default function FloatingButton({ onClick }) {
  const navigate  = useNavigate()
  const location  = useLocation()

  const handleClick = () => {
    if (onClick) { onClick(); return }
    if (location.pathname.startsWith("/players")) {
      navigate("/player/new")
      return
    }
    navigate("/booking/new")
  }
  
  // Only show on Bookings and Players pages
  const shouldShow = location.pathname === "/" || location.pathname.startsWith("/players")
  
  if (!shouldShow) return null

  return (
    <button
      onClick={handleClick}
      aria-label="Add new"
      style={{
        position: "fixed",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 42px)",
        left: "50%",
        transform: "translateX(-50%)",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--brand), #00B4D8)",
        color: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        cursor: "pointer",
        boxShadow: "0 6px 24px rgba(0,212,160,0.5), 0 2px 8px rgba(0,0,0,0.15)",
        zIndex: 50001,
        transition: "transform 0.1s ease, box-shadow 0.1s ease",
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.transform = "translateX(-50%) scale(0.93)"
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.transform = "translateX(-50%) scale(1)"
      }}
    >
      <Plus size={28} strokeWidth={2.5} />
    </button>
  )
}
