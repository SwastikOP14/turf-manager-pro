import { useNavigate } from "react-router-dom"

import GlassCard from "../common/GlassCard"
import { formatCurrency } from "../../utils/format"
import { formatPhoneDisplay } from "../../utils/phone"
import { getInitials, getBalanceTone } from "../../utils/players"

export default function PlayerCard({
  player
}) {
  const navigate = useNavigate()

  const tone = getBalanceTone(player.balance)

  const balanceClass = {
    positive: "text-green-500",
    low: "text-orange-400",
    negative: "text-red-500"
  }[tone]

  return (
    <GlassCard
      onClick={() => navigate(`/player/${player.id}`)}
      className="flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="
          w-12 h-12 rounded-full shrink-0 overflow-hidden
          bg-green-500 text-black
          font-bold flex items-center justify-center
        ">
          {player.photo ? (
            <img
              src={player.photo}
              alt={player.name}
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(player.name)
          )}
        </div>

        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
            {player.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-gray-400">
            {formatPhoneDisplay(player.phone)}
          </p>
        </div>
      </div>

      <p className={`text-xl font-bold shrink-0 ${balanceClass}`}>
        {formatCurrency(player.balance)}
      </p>
    </GlassCard>
  )
}
