import { useNavigate } from "react-router-dom"

import GlassCard from "../common/GlassCard"
import SportIcon from "../common/SportIcon"
import { formatCurrency, formatDisplayDate, formatTimeRange } from "../../utils/format"

export default function BookingCard({
  booking,
  turfName,
  sportName,
  sportId
}) {
  const navigate = useNavigate()

  const statusColors = {
    Paid: "text-green-500",
    Partial: "text-orange-400",
    Pending: "text-red-500"
  }

  const statusEmojis = {
    Paid: "✅",
    Partial: "🕐",
    Pending: "⏳"
  }

  const remaining = Math.max(
    0,
    Number(booking.amount) - Number(booking.paidAmount || 0)
  )

  return (
    <GlassCard
      className="space-y-3"
      onClick={() => navigate(`/booking/${booking.id}/edit`)}
    >
      <div className="flex justify-between gap-3">
        <div className="flex gap-3 min-w-0">
          <div className="
            w-12 h-12 rounded-2xl shrink-0
            bg-green-500/15 text-green-500
            flex items-center justify-center
          ">
            <SportIcon sportId={sportId} sportName={sportName} />
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate">
              {turfName}
            </h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">
              {sportName}
            </p>
            <p className="text-xs mt-1 text-slate-400">
              {booking.id}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <h3 className="text-green-500 font-bold text-xl">
            {formatCurrency(booking.amount)}
          </h3>
          <p className={`text-sm font-medium ${statusColors[booking.status]}`}>
            {statusEmojis[booking.status]} {booking.status}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5 text-xs text-slate-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <span>📅</span>
          <span>{formatDisplayDate(booking.date)}</span>
        </div>

        <div className="flex items-center gap-1">
          <span>🕒</span>
          <span>{formatTimeRange(booking.startTime, booking.endTime)}</span>
        </div>
      </div>

      {booking.status === "Partial" && (
        <div className="flex justify-between text-sm font-medium">
          <span className="text-green-500 line-through decoration-green-500/60">
            💵 Paid {formatCurrency(booking.paidAmount)}
          </span>
          <span className="text-orange-400">
            💸 Remaining {formatCurrency(remaining)}
          </span>
        </div>
      )}
    </GlassCard>
  )
}
