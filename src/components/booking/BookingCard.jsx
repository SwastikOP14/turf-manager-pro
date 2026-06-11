import { useNavigate } from "react-router-dom"
import { Check } from "lucide-react"

import GlassCard from "../common/GlassCard"
import SportIcon from "../common/SportIcon"
import { Calendar, Clock, Users } from "lucide-react"
import { formatCurrency, formatDisplayDate, formatTimeRange } from "../../utils/format"

export default function BookingCard({
  booking,
  turfName,
  sportName,
  sportId,
  sport,
  // multi-select props
  selectMode = false,
  selected   = false,
  onSelect,        // (id) => void — called in select mode on tap
  onLongPress,     // (id) => void — called on long press to enter select mode
}) {
  const navigate = useNavigate()

  const statusConfig = {
    Paid:    { bg: "bg-[rgba(52,211,153,0.15)] text-[#34D399] dark:text-[#34D399]", text: "text-[#34D399] dark:text-[#34D399]", label: "Paid", accent: "#34D399", accentLight: "rgba(52,211,153,0.18)" },
    Partial: { bg: "bg-[rgba(245,158,11,0.15)] text-[#F59E0B] dark:text-[#F59E0B]", text: "text-[#F59E0B] dark:text-[#F59E0B]", label: "Partial", accent: "#F59E0B", accentLight: "rgba(245,158,11,0.18)" },
    Pending: { bg: "bg-[rgba(251,113,133,0.15)] text-[#FB7185] dark:text-[#FB7185]", text: "text-[#FB7185] dark:text-[#FB7185]", label: "Pending", accent: "#FB7185", accentLight: "rgba(251,113,133,0.18)" },
  }

  const status     = statusConfig[booking.status] ?? statusConfig.Pending
  const totalAmt   = Number(booking.amount)
  const sportLabel = sportName || sport?.name || "Sport"

  const playerCount = (() => {
    if (booking.bookingType === "Team" || booking.teams?.length) {
      return booking.teams?.reduce((sum, t) => sum + (t.playerIds?.length || 0), 0) || 0
    }
    return booking.playerIds?.length || 0
  })()

  // ── Long-press detection ────────────────────────────────────────────────
  let pressTimer = null

  const handlePressStart = () => {
    if (selectMode) return
    pressTimer = setTimeout(() => {
      onLongPress?.(booking.id)
    }, 500)
  }

  const handlePressEnd = () => {
    clearTimeout(pressTimer)
  }

  const handleClick = () => {
    if (selectMode) {
      onSelect?.(booking.id)
    } else {
      navigate(`/booking/${booking.id}/edit`)
    }
  }

  return (
    <div
      className="relative"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      onClick={handleClick}
    >
      <GlassCard
        className="p-3 relative overflow-hidden cursor-pointer transition-all duration-150"
        style={{
          outline: selected ? "2px solid #22c55e" : "none",
          outlineOffset: "2px",
          background: selected
            ? "rgba(34,197,94,0.12)"
            : undefined,
        }}
      >
        {/* Status accent bar */}
        <div
          className="absolute left-0 top-3 bottom-3 w-1.25 rounded-r-full"
          style={{ backgroundColor: status.accent }}
        />
        <div
          className="absolute left-1.25 top-4 bottom-4 w-[2.5px] rounded-r-full"
          style={{ backgroundColor: status.accentLight }}
        />

        <div className="relative space-y-2 pl-3">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/90 dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-100">
              <SportIcon sportId={sportId} sportName={sportName} sport={sport} size={14} />
              {sportLabel}
            </div>
            <p className={`text-base font-semibold tracking-tight ${status.text}`}>
              {formatCurrency(totalAmt)}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              {turfName}
            </h3>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              {booking.id?.startsWith("#") ? booking.id : `#${booking.id}`}
            </p>
          </div>

          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-emerald-500 dark:text-emerald-300" />
              <span>{formatDisplayDate(booking.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-emerald-500 dark:text-emerald-300" />
              <span>{formatTimeRange(booking.startTime, booking.endTime)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2">
                <Users size={14} className="text-emerald-500 dark:text-emerald-300" />
                <span>{playerCount} players</span>
              </div>
              <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.bg}`}>
                <span className="h-2 w-2 rounded-full bg-current" />
                {status.label}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Checkbox overlay — shown in select mode */}
      {selectMode && (
        <div
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all"
          style={{
            background:  selected ? "#22c55e" : "rgba(255,255,255,0.15)",
            border:      selected ? "none"    : "2px solid rgba(255,255,255,0.35)",
            backdropFilter: "blur(4px)",
          }}
        >
          {selected && <Check size={13} strokeWidth={3} className="text-black" />}
        </div>
      )}
    </div>
  )
}
