import { useNavigate } from "react-router-dom"

import GlassCard from "../common/GlassCard"
import { formatCurrency } from "../../utils/format"
import { formatPhoneDisplay } from "../../utils/phone"
import { getInitials, getBalanceTone } from "../../utils/players"

export default function PlayerCard({ player }) {
  const navigate = useNavigate()
  const tone = getBalanceTone(player.balance)

  const balanceClass = {
    positive: "text-green-700 dark:text-green-400",
    low:      "text-orange-500 dark:text-orange-400",
    negative: "text-red-600 dark:text-red-500"
  }[tone]

  return (
    <GlassCard
      onClick={() => navigate(`/player/${player.id}`)}
      className="flex items-center justify-between gap-4 py-4 px-4"
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Avatar — bigger, more presence */}
        <div className="w-14 h-14 rounded-full shrink-0 overflow-hidden bg-green-500 text-black font-bold text-lg flex items-center justify-center">
          {player.photo ? (
            <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            getInitials(player.name)
          )}
        </div>

        <div className="min-w-0 space-y-0.5">
          <h3 className="font-bold text-[16px] text-slate-900 dark:text-white truncate leading-snug">
            {player.name}
          </h3>
          <p className="text-[13px] text-slate-500 dark:text-gray-400">
            {formatPhoneDisplay(player.phone)}
          </p>
        </div>
      </div>

      {/* Balance */}
      <p className={`text-[20px] font-extrabold shrink-0 ${balanceClass}`}>
        {formatCurrency(player.balance)}
      </p>
    </GlassCard>
  )
}
