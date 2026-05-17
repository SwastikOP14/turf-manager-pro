import { Plus } from "lucide-react"

import { useNavigate } from "react-router-dom"

export default function FloatingButton() {

  const navigate = useNavigate()

  return (

    <button
      onClick={() =>
        navigate("/add-booking")
      }

      className="
        fixed bottom-24 left-1/2
        -translate-x-1/2

        w-16 h-16

        rounded-full

        bg-green-500

        flex items-center justify-center

        shadow-2xl

        z-50
      "
    >

      <Plus
        size={32}
        className="text-black"
      />

    </button>

  )
}