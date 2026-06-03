import { useNavigate } from "react-router-dom"

import GlassCard from "../common/GlassCard"
import SportIcon from "../common/SportIcon"
import { formatCurrency, formatDisplayDate, formatTimeRange } from "../../utils/format"

export default function BookingCard({
  booking,
  turfName,
  sportName,
  sportId,
  sport // Add sport object
}) {
  const navigate = useNavigate()

  const statusConfig = {
    Paid:    { color: "text-green-500",  bg: "bg-green-500/10",  label: "Paid" },
    Partial: { color: "text-orange-400", bg: "bg-orange-400/10", label: "Partial" },
    Pending: { color: "text-red-500",    bg: "bg-red-500/10",    label: "Pending" },
  }

  const status = statusConfig[booking.status] ?? statusConfig.Pending

  const paidAmt   = Number(booking.paidAmount || 0)
  const totalAmt  = Number(booking.amount)
  const remaining = Math.max(0, totalAmt - paidAmt)

  return (
    <GlassCard
      className="space-y-3"
      onClick={() => navigate(`/booking/${booking.id}/edit`)}
    >
      {/* ── Top row: sport icon + turf info + amount + status ── */}
      <div className="flex justify-between gap-3">
        <div className="flex gap-3 min-w-0">
          <div className="
            w-12 h-12 rounded-2xl shrink-0
            bg-green-500/15 text-green-500
            flex items-center justify-center
          ">
            <SportIcon sportId={sportId} sportName={sportName} sport={sport} />
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate">
              {turfName}
            </h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">
              {sportName}
            </p>
            <p className="text-xs mt-0.5 text-slate-400">
              {booking.id}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 flex flex-col items-end gap-1">
          {/* For Partial: top-right = remaining amount + "To Pay" label */}
          {booking.status === "Partial" ? (
            <>
              <h3 className={`font-bold text-xl ${status.color}`}>
                {formatCurrency(remaining)}
              </h3>
              <span className={`text-sm font-semibold ${status.color}`}>
                To Pay
              </span>
            </>
          ) : (
            <>
              <h3 className={`font-bold text-xl ${status.color}`}>
                {formatCurrency(totalAmt)}
              </h3>
              <span className={`text-sm font-semibold ${status.color}`}>
                {status.label}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Date & time row ── */}
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

      {/* ── Partial footer: paid (left) + total (right) ── */}
      {booking.status === "Partial" && (
        <div className="flex justify-between items-center text-sm font-semibold pt-1 border-t border-black/5 dark:border-white/5">
          <span className="text-green-500">
            Paid {formatCurrency(paidAmt)}
          </span>
          <span className="text-slate-500 dark:text-gray-400">
            Total {formatCurrency(totalAmt)}
          </span>
        </div>
      )}
    </GlassCard>
  )
}
