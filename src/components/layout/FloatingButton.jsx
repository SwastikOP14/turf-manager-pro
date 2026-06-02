import { Plus } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

export default function FloatingButton() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = () => {
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
        transition active:scale-95
      "
    >
      <Plus size={32} />
    </button>
  )
}
