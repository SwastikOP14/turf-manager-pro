import { useNavigate } from "react-router-dom"

import GlassCard from "../common/GlassCard"
import SportIcon from "../common/SportIcon"
import { formatCurrency, formatDisplayDate, formatTimeRange } from "../../utils/format"

export default function BookingCard({
  booking,
  turfName,
  sportName,
  sportId,
  sport
}) {
  const navigate = useNavigate()

  const statusConfig = {
    Paid:    { color: "text-green-700 dark:text-green-400",  dot: "bg-green-500",  label: "Paid" },
    Partial: { color: "text-orange-500 dark:text-orange-400", dot: "bg-orange-400", label: "Partial" },
    Pending: { color: "text-red-600 dark:text-red-500",      dot: "bg-red-500",    label: "Pending" },
  }

  const status = statusConfig[booking.status] ?? statusConfig.Pending
  const paidAmt      = Number(booking.paidAmount || 0)
  const totalAmt     = Number(booking.amount)
  const remaining    = Math.max(0, totalAmt - paidAmt)
  const displayAmount = booking.status === "Partial" ? remaining : totalAmt

  // Count players across both individual and team bookings
  const playerCount = booking.playerIds?.length
    || booking.teams?.reduce((s, t) => s + (t.playerIds?.length || 0), 0)
    || 0

  return (
    <GlassCard
      onClick={() => navigate(`/booking/${booking.id}/edit`)}
      className="p-5 space-y-4"
    >
      {/* ── Main body ── */}
      <div className="flex items-start gap-3">

        {/* Sport icon — same size as text, not dominant */}
        <div className="shrink-0 mt-0.5">
          <SportIcon sportId={sportId} sportName={sportName} sport={sport} size={28} />
        </div>

        {/* Two-column */}
        <div className="flex-1 min-w-0 flex justify-between gap-2">

          {/* Left: Name / Date / Time */}
          <div className="min-w-0 space-y-1.5 flex-1">
            <p className="font-bold text-[16px] text-slate-900 dark:text-white leading-snug">
              {turfName}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px]">📅</span>
              <p className="text-[13px] font-semibold text-slate-500 dark:text-gray-400">
                {formatDisplayDate(booking.date)}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px]">🕒</span>
              <p className="text-[13px] font-semibold text-slate-500 dark:text-gray-400">
                {formatTimeRange(booking.startTime, booking.endTime)}
              </p>
            </div>
          </div>

          {/* Right: Amount / ID / Players — compact, doesn't steal width */}
          <div className="text-right shrink-0 space-y-1.5">
            <p className={`font-bold text-[17px] leading-tight ${status.color}`}>
              {formatCurrency(displayAmount)}
            </p>
            <p className="text-[12px] font-semibold text-slate-500 dark:text-gray-400 tracking-wide">
              #{booking.id}
            </p>
            <p className="text-[12px] font-semibold text-slate-600 dark:text-gray-300">
              👥 {playerCount}
            </p>
          </div>

        </div>
      </div>

      {/* ── Bottom status bar ── */}
      <div className="flex items-center justify-between pt-3.5 border-t border-black/10 dark:border-white/15">

        {booking.status === "Partial" ? (
          <>
            <span className="text-[13px] font-semibold text-slate-500 dark:text-gray-400">
              Total {formatCurrency(totalAmt)}
            </span>
            <span className="text-[13px] font-semibold text-green-700 dark:text-green-400">
              Paid {formatCurrency(paidAmt)}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${status.dot}`} />
              <span className={`text-[13px] font-bold ${status.color}`}>
                To Pay
              </span>
            </div>
          </>
        ) : (
          <>
            <span className="text-[13px] font-semibold text-slate-500 dark:text-gray-400">
              Total {formatCurrency(totalAmt)}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${status.dot}`} />
              <span className={`text-[13px] font-bold ${status.color}`}>
                {status.label}
              </span>
            </div>
          </>
        )}

      </div>
    </GlassCard>
  )
}
