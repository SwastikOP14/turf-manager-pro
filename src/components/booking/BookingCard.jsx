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
    Paid:    { color: "text-green-500",  dot: "bg-green-500",  label: "Paid" },
    Partial: { color: "text-orange-400", dot: "bg-orange-400", label: "Partial" },
    Pending: { color: "text-red-500",    dot: "bg-red-500",    label: "Pending" },
  }

  const status = statusConfig[booking.status] ?? statusConfig.Pending
  const paidAmt   = Number(booking.paidAmount || 0)
  const totalAmt  = Number(booking.amount)
  const remaining = Math.max(0, totalAmt - paidAmt)
  const displayAmount = booking.status === "Partial" ? remaining : totalAmt

  return (
    <GlassCard onClick={() => navigate(`/booking/${booking.id}/edit`)}>

      {/* ── Main body ── */}
      <div className="flex items-start gap-4">

        {/* Sport emoji */}
        <div className="shrink-0 leading-none mt-1">
          <SportIcon sportId={sportId} sportName={sportName} sport={sport} size={36} />
        </div>

        {/* Two-column */}
        <div className="flex-1 min-w-0 flex justify-between gap-3">

          {/* Left: Name / Date / Time */}
          <div className="min-w-0">
            {/* Turf name — base size e.g. 17px */}
            <p className="font-bold text-[17px] text-slate-900 dark:text-white leading-tight truncate tracking-tight">
              {turfName}
            </p>
            {/* Date — 15px (2px smaller) */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[15px]">📅</span>
              <p className="text-[15px] font-semibold text-slate-600 dark:text-gray-300 tracking-tight">
                {formatDisplayDate(booking.date)}
              </p>
            </div>
            {/* Time — 15px */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[15px]">🕒</span>
              <p className="text-[15px] font-semibold text-slate-600 dark:text-gray-300 tracking-tight">
                {formatTimeRange(booking.startTime, booking.endTime)}
              </p>
            </div>
          </div>

          {/* Right: Amount / Booking ID / Players */}
          <div className="text-right shrink-0">
            {/* Amount — 21px */}
            <p className={`font-extrabold text-[21px] tracking-tight leading-tight ${status.color}`}>
              {formatCurrency(displayAmount)}
            </p>
            {/* Show "To Pay" label for partial under amount — removed */}
            {/* Booking ID — darker in both themes */}
            <p className="text-[15px] font-semibold text-slate-600 dark:text-gray-200 mt-2 tracking-wide">
              #{booking.id}
            </p>
            {/* Players — brighter in dark theme */}
            <p className="text-[15px] font-semibold text-slate-700 dark:text-gray-100 mt-1">
              👥 {booking.playerIds?.length || 0}
            </p>
          </div>

        </div>
      </div>

      {/* ── Bottom status bar ── */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-black/15 dark:border-white/20">

        {booking.status === "Partial" ? (
          <>
            <span className="text-[14px] font-bold text-slate-600 dark:text-gray-200 tracking-tight">
              Total {formatCurrency(totalAmt)}
            </span>
            <span className="text-[14px] font-semibold text-green-500 tracking-tight">
              Paid {formatCurrency(paidAmt)}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${status.dot}`} />
              <span className={`text-[14px] font-bold tracking-tight ${status.color}`}>
                To Pay
              </span>
            </div>
          </>
        ) : (
          <>
            <span className="text-[14px] font-bold text-slate-600 dark:text-gray-200 tracking-tight">
              Total {formatCurrency(totalAmt)}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${status.dot}`} />
              <span className={`text-[14px] font-bold tracking-tight ${status.color}`}>
                {status.label}
              </span>
            </div>
          </>
        )}

      </div>
    </GlassCard>
  )
}
