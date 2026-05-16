import { Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function FloatingButton() {

  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate("/add-booking")}
      className="
        fixed bottom-20 left-1/2
        -translate-x-1/2
        w-16 h-16
        rounded-full
        bg-green-500
        text-black
        shadow-2xl
        flex items-center justify-center
        z-50
        active:scale-95
        transition
      "
    >

      <Plus size={30} />

    </button>
  )
}