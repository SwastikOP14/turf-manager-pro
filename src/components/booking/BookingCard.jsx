import { useNavigate } from "react-router-dom"
import { Check, Calendar, Clock, Users, RotateCcw } from "lucide-react"
import { useRef } from "react"
import { useApp } from "../../context/useApp"
import { useHaptics } from "../../context/HapticsContext"
import SportIcon from "../common/SportIcon"
import { formatCurrency, formatDisplayDate } from "../../utils/format"

export default function BookingCard({
  booking, turfName, sportName, sportId, sport,
  selectMode = false, selected = false, onSelect, onLongPress,
}) {
  const navigate = useNavigate()
  const { getPlayerById } = useApp()
  const haptics = useHaptics()
  const pressTimer = useRef(null)
  const touchStart = useRef({ x: 0, y: 0 })

  const statusColors = {
    Paid: { accent: "!border-l-green-600", amount: "text-green-600", pill: "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400" },
    Partial: { accent: "!border-l-amber-500", amount: "text-amber-500", pill: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400" },
    Pending: { accent: "!border-l-red-500", amount: "text-red-500", pill: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400" },
  }

  const status = statusColors[booking.status] ?? statusColors.Pending
  // Use baseAmount if available (from EditBookingSheet), otherwise use amount for backward compatibility
  const storedBaseAmt = booking.baseAmount ?? booking.amount
  const baseAmt = Number(storedBaseAmt) || 0
  const miscTotal = (booking.miscCosts || []).reduce((s, c) => s + (c.qty * c.price), 0)
  const addTime = (booking.additionalTime || 0) * 10
  const totalAmt = baseAmt + miscTotal + addTime
  const sportLabel = sportName || sport?.name || "Sport"

  const playerCount = (() => {
    if (booking.bookingType === "Team" || booking.teams?.length)
      return booking.teams?.reduce((s, t) => {
        const excluded = t.excludedPlayerIds || []
        const active = (t.playerIds || []).filter(pid => !excluded.includes(pid))
        return s + active.length
      }, 0) || 0
    if (booking.playerIds?.length > 0)
      return booking.playerIds.length
    return booking.nosOfPlayers || 0
  })()

  const paidByPlayer = getPlayerById(booking.paidByPlayerId)
  const paidByText = paidByPlayer?.name || booking.paidBy || ""
  const bookingTypeLabel = booking.bookingType === "Team" ? "Squad" : "Individual"

  // Duration calculation
  const getDuration = () => {
    if (booking.duration && booking.duration !== "custom") {
      return booking.duration + "h"
    }
    if (booking.duration === "custom" && booking.customDuration) {
      return booking.customDuration + "h"
    }
    // Fallback: calculate from times
    if (booking.startTime && booking.endTime) {
      const [sh, sm] = booking.startTime.split(":").map(Number)
      const [eh, em] = booking.endTime.split(":").map(Number)
      const diffMinutes = (eh * 60 + em) - (sh * 60 + sm)
      if (diffMinutes > 0) {
        const hours = diffMinutes / 60
        return hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`
      }
    }
    return "1h"
  }

  // Start time without AM/PM
  const getStartTime = () => {
    if (booking.startTime) {
      return booking.startTime.slice(0, 5) // HH:MM format
    }
    return "--:--"
  }

  const startPress = (e) => {
    if (selectMode) return
    const touch = e.touches?.[0] || e
    touchStart.current = { x: touch.clientX, y: touch.clientY }
    pressTimer.current = setTimeout(() => { 
      haptics.trigger(8)
      onLongPress?.(booking.id) 
    }, 450)
  }

  const handleTouchMove = (e) => {
    if (!pressTimer.current) return
    const touch = e.touches[0]
    const dx = Math.abs(touch.clientX - touchStart.current.x)
    const dy = Math.abs(touch.clientY - touchStart.current.y)
    if (dx > 10 || dy > 10) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  const endPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  const handleClick = () => {
    endPress()
    if (selectMode) { haptics.trigger(8); onSelect?.(booking.id) }
    else navigate(`/booking/${booking.id}/edit`)
  }

  return (
    <div
      className="select-none relative"
      onMouseDown={startPress} onMouseUp={endPress} onMouseLeave={endPress}
      onTouchStart={startPress} onTouchMove={handleTouchMove} onTouchEnd={endPress} onTouchCancel={endPress}
      onClick={handleClick}
    >
      <div className={`
        rounded-2xl border-l-4 relative cursor-pointer transition-all duration-200
        ${selected
          ? 'bg-green-500/5 border-green-500 border-r border-t border-b'
          : 'bg-white dark:bg-slate-800 border-black/[0.07] dark:border-white/8 border-r border-t border-b'
        }
        ${status.accent} shadow-[0_2px_8px_rgba(0,0,0,0.06)]
`} style={{ paddingLeft: "14px", paddingRight: "14px", paddingTop: "12px", paddingBottom: "12px" }}>
        {/* Row 1: Sport pill + Type pill + Amount */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 px-2 py-1 rounded-full">
              <SportIcon sportId={sportId} sportName={sportName} sport={sport} size={14} />
              <span className="text-[11px] font-bold text-green-700 dark:text-green-400">
                {sportLabel}
              </span>
            </div>
            <div className={`px-2 py-1 rounded-full text-[11px] font-semibold
              ${booking.bookingType === "Team"
                ? "bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400"
                : "bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400"
              }`}>
              {bookingTypeLabel}
            </div>
          </div>
          <div className={`text-[18px] font-bold ${status.amount}`}>
            {formatCurrency(totalAmt)}
          </div>
        </div>

        {/* Row 2: Turf name + Booking ID */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[15px] font-bold text-slate-900 dark:text-white truncate flex-1 mr-3">
            {turfName}
          </h3>
          <span className="text-[11px] font-semibold text-slate-400 tracking-wide">
            {`#BK${(booking.id || "").replace(/^#?BK/i, "")}`}
          </span>
        </div>

        {/* Row 3: Date + Status badge */}
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1">
            <Calendar size={12} className="text-green-500" />
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
              {formatDisplayDate(booking.date)}
            </span>
          </div>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${status.pill}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${booking.status === "Paid" ? "bg-green-600" :
              booking.status === "Partial" ? "bg-amber-500" : "bg-red-500"
              }`} />
            {booking.status === "Pending" ? "Unpaid" : booking.status}
          </div>
        </div>

        {/* Row 4: Start time + Duration */}
        <div className="flex items-center gap-3 mb-0.5">
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-green-500" />
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
              {getStartTime()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <RotateCcw size={12} className="text-slate-400" />
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
              {getDuration()}
            </span>
          </div>
        </div>

        {/* Row 5: Players + Paid by */}
        <div className="flex items-center justify-between mb-0">
          <div className="flex items-center gap-1">
            <Users size={12} className="text-green-500" />
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
              {playerCount} players
            </span>
          </div>
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {booking.status === "Paid" && paidByText ? `Paid by ${paidByText}` :
              booking.status === "Partial" && paidByText ? `Partially paid by ${paidByText}` :
                "Unpaid"}
          </div>
        </div>

        {/* Extras row (conditional) */}
        {(miscTotal > 0 || booking.additionalTime > 0) && (
          <div className="flex items-center gap-2 flex-wrap mt-2">
            {miscTotal > 0 && (
              <span className="text-[11px] font-semibold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">
                +{formatCurrency(miscTotal)} extras
              </span>
            )}
            {booking.additionalTime > 0 && (
              <span className="text-[11px] font-semibold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">
                +{booking.additionalTime} min
              </span>
            )}
          </div>
        )}
      </div>

      {/* Select checkbox */}
      {selectMode && (
        <div className={`
          absolute top-3 left-6 w-5 h-5 rounded-full flex items-center justify-center pointer-events-none
          ${selected
            ? "bg-green-500 border-none"
            : "bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-500"
          }
          shadow-md
        `}>
          {selected && <Check size={12} strokeWidth={3} className="text-white" />}
        </div>
      )}
    </div>
  )
}