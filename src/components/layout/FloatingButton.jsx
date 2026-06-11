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

  return (
    <button
      onClick={handleClick}
      aria-label="Add new"
      style={{
        position: "fixed",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 90px)",
        left: "50%",
        transform: "translateX(-50%)",
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--brand), #00B4D8)",
        color: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(0,212,160,0.45)",
        zIndex: 49999,
        transition: "transform 0.1s ease, box-shadow 0.1s ease",
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.transform = "translateX(-50%) scale(0.93)"
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.transform = "translateX(-50%) scale(1)"
      }}
    >
      <Plus size={26} strokeWidth={2.5} />
    </button>
  )
}
