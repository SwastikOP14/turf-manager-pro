import { Plus } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

export default function FloatingButton({ onClick }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = () => {
    // If a custom onClick is provided, use it
    if (onClick) {
      onClick()
      return
    }

    if (location.pathname.startsWith("/players")) {
      navigate("/player/new")
      return
    }

    navigate("/booking/new")
  }

  return (
    <button
      onClick={handleClick}
      className="
        fixed bottom-24 left-1/2 -translate-x-1/2
        w-16 h-16 rounded-full
        bg-green-500 text-black
        flex items-center justify-center
        shadow-[var(--shadow-glow)]
        z-50
        transition hover:scale-90 hover:bg-green-600 active:scale-95
      "
    >
      <Plus size={32} />
    </button>
  )
}
