import GlassCard from "../common/GlassCard"
import { Trash2 } from "lucide-react"
export default function PlayerCard({
  name,
  phone,
  balance,
  onDelete
}) {

  const initials = name
    .split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 2)

  const balanceColor =
    balance > 0
      ? "text-green-500"
      : balance < 0
      ? "text-red-500"
      : "text-orange-400"

  return (
    <GlassCard>

      <div className="
        flex items-center justify-between
      ">

        {/* Left */}
        <div className="flex items-center gap-3">

          {/* Avatar */}
          <div className="
            w-12 h-12
            rounded-full

            bg-green-500/15
            text-green-500

            flex items-center justify-center

            font-bold
          ">
            {initials}
          </div>

          {/* Details */}
          <div>

            <h3 className="
              font-semibold
              text-black dark:text-white
            ">
              {name}
            </h3>

            <p className="
              text-sm
              text-gray-500 dark:text-gray-400
            ">
              {phone}
            </p>

          </div>

        </div>
            {/* Right */}
            <div className="
              flex items-center gap-3
            ">

              {/* Balance */}
              <div className="text-right">

                <h3 className={`
                  text-lg font-bold
                  ${balanceColor}
                `}>

                  {
                    balance > 0
                      ? `+ ₹${balance}`
                      : balance < 0
                      ? `- ₹${Math.abs(balance)}`
                      : `₹0`
                  }

                </h3>

                <p className="
                  text-xs
                  text-gray-500
                ">
                  Balance
                </p>

              </div>

              {/* Delete */}
              <button
                onClick={onDelete}

                className="
                  text-red-400

                  hover:scale-110
                  transition
                "
              >

                <Trash2 size={18} />

              </button>

            </div>
      </div>

    </GlassCard>
  )
}