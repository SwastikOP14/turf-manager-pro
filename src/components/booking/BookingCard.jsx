import { useNavigate } from "react-router-dom"
import { Check, Plus, Trash2, X } from "lucide-react"
import { useState, useRef } from "react"
import { createPortal } from "react-dom"
import { useApp } from "../../context/useApp"
import { useModalBackHandler } from "../../hooks/useModalBackHandler"

import GlassCard from "../common/GlassCard"
import SportIcon from "../common/SportIcon"
import { Calendar, Clock, Users } from "lucide-react"
import { formatCurrency, formatDisplayDate, formatTimeRange } from "../../utils/format"

// ── Misc Cost Sheet ──────────────────────────────────────────────────────────

function MiscCostSheet({ booking, onClose, onEnterSelect }) {
  const { updateBooking } = useApp()
  const miscCosts = booking.miscCosts || []
  const baseAmount = Number(booking.amount) || 0

  const [label,  setLabel]  = useState("")
  const [amount, setAmount] = useState("")
  const [error,  setError]  = useState("")

  useModalBackHandler(onClose)

  const total = baseAmount + miscCosts.reduce((s, c) => s + Number(c.amount), 0)

  const handleAdd = () => {
    const trimLabel = label.trim()
    const numAmt    = Number(amount)
    if (!trimLabel)    { setError("Enter a description"); return }
    if (!numAmt || numAmt <= 0) { setError("Enter a valid amount"); return }

    const newCost = {
      id:     `mc-${Date.now()}`,
      label:  trimLabel,
      amount: numAmt,
    }
    updateBooking(booking.id, {
      miscCosts: [...miscCosts, newCost],
    })
    setLabel("")
    setAmount("")
    setError("")
  }

  const handleRemove = (id) => {
    updateBooking(booking.id, {
      miscCosts: miscCosts.filter((c) => c.id !== id),
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-end"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="w-full bg-white dark:bg-[#0f172a] rounded-t-3xl px-5 pt-4 pb-8 space-y-4"
        style={{ maxHeight: "85vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle + header */}
        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto mb-1" />

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900 dark:text-white">
              Miscellaneous Costs
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {booking.id} · {booking.date}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center"
          >
            <X size={17} />
          </button>
        </div>

        {/* Total summary */}
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-green-500/8 border border-green-500/20">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Base booking</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {formatCurrency(baseAmount)}
            </p>
          </div>
          {miscCosts.length > 0 && (
            <div className="text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400">Misc added</p>
              <p className="text-sm font-semibold text-orange-500">
                +{formatCurrency(miscCosts.reduce((s, c) => s + Number(c.amount), 0))}
              </p>
            </div>
          )}
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
            <p className="text-base font-bold text-green-700 dark:text-green-400">
              {formatCurrency(total)}
            </p>
          </div>
        </div>

        {/* Existing misc costs */}
        {miscCosts.length > 0 && (
          <div className="space-y-2">
            {miscCosts.map((cost) => (
              <div
                key={cost.id}
                className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/8"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{cost.label}</p>
                  <p className="text-xs text-orange-500 font-medium mt-0.5">+{formatCurrency(Number(cost.amount))}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(cost.id)}
                  className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new misc cost */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Add Item
          </p>

          {/* Description input */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/5">
            <input
              type="text"
              value={label}
              onChange={(e) => { setLabel(e.target.value); setError("") }}
              placeholder="e.g. Water bottle, Extra kit…"
              className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400"
              onKeyDown={(e) => e.key === "Enter" && amount && handleAdd()}
            />
          </div>

          {/* Amount input + Add button */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/5">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium shrink-0">₹</span>
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => { setAmount(e.target.value.replace(/[^0-9]/g, "")); setError("") }}
                placeholder="Amount"
                className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400"
                onKeyDown={(e) => e.key === "Enter" && label && handleAdd()}
              />
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="px-5 py-3 rounded-2xl bg-green-500 text-black font-bold text-sm flex items-center gap-1.5 shrink-0"
            >
              <Plus size={15} />
              Add
            </button>
          </div>

          {error && <p className="text-xs text-red-500 px-1">{error}</p>}
        </div>

        {/* Divider + select option */}
        <div className="border-t border-black/5 dark:border-white/8 pt-3">
          <button
            type="button"
            onClick={() => { onClose(); onEnterSelect?.() }}
            className="w-full py-3 rounded-2xl border border-black/8 dark:border-white/8 text-slate-600 dark:text-slate-300 text-sm font-semibold flex items-center justify-center gap-2"
          >
            ☑ Select this booking
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── BookingCard ──────────────────────────────────────────────────────────────

export default function BookingCard({
  booking,
  turfName,
  sportName,
  sportId,
  sport,
  // multi-select props
  selectMode = false,
  selected   = false,
  onSelect,
  onLongPress,   // (id) => void — enter select mode from outside
}) {
  const navigate = useNavigate()
  const [miscOpen, setMiscOpen] = useState(false)
  const pressTimer = useRef(null)

  const statusConfig = {
    Paid:    { bg: "bg-[rgba(52,211,153,0.15)] text-[#34D399]", text: "text-[#34D399]", label: "Paid",    accent: "#34D399",  accentLight: "rgba(52,211,153,0.18)"  },
    Partial: { bg: "bg-[rgba(245,158,11,0.15)] text-[#F59E0B]", text: "text-[#F59E0B]", label: "Partial", accent: "#F59E0B",  accentLight: "rgba(245,158,11,0.18)"  },
    Pending: { bg: "bg-[rgba(251,113,133,0.15)] text-[#FB7185]", text: "text-[#FB7185]", label: "Pending",accent: "#FB7185",  accentLight: "rgba(251,113,133,0.18)" },
  }

  const status     = statusConfig[booking.status] ?? statusConfig.Pending
  const baseAmt    = Number(booking.amount) || 0
  const miscTotal  = (booking.miscCosts || []).reduce((s, c) => s + Number(c.amount), 0)
  const totalAmt   = baseAmt + miscTotal
  const sportLabel = sportName || sport?.name || "Sport"
  const hasMisc    = miscTotal > 0

  const playerCount = (() => {
    if (booking.bookingType === "Team" || booking.teams?.length) {
      return booking.teams?.reduce((sum, t) => sum + (t.playerIds?.length || 0), 0) || 0
    }
    return booking.playerIds?.length || 0
  })()

  // ── Press handlers ───────────────────────────────────────────────────────

  const startPress = () => {
    if (selectMode) return
    pressTimer.current = setTimeout(() => {
      // Long press → open misc sheet (NOT select mode)
      setMiscOpen(true)
    }, 500)
  }

  const endPress = () => clearTimeout(pressTimer.current)

  const handleClick = () => {
    if (miscOpen) return
    if (selectMode) {
      onSelect?.(booking.id)
    } else {
      navigate(`/booking/${booking.id}/edit`)
    }
  }

  return (
    <>
      <div
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
        onMouseDown={startPress}
        onMouseUp={endPress}
        onMouseLeave={endPress}
        onTouchStart={startPress}
        onTouchEnd={endPress}
        onTouchCancel={endPress}
        onClick={handleClick}
      >
        <GlassCard
          className="p-3 relative overflow-hidden cursor-pointer transition-all duration-150"
          style={{
            outline:    selected ? "2px solid #22c55e" : "none",
            outlineOffset: "2px",
            background: selected ? "rgba(34,197,94,0.12)" : undefined,
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
            {/* Sport + amount row */}
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/90 dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-100">
                <SportIcon sportId={sportId} sportName={sportName} sport={sport} size={14} />
                {sportLabel}
              </div>
              <div className="text-right">
                <p className={`text-base font-semibold tracking-tight ${status.text}`}>
                  {formatCurrency(totalAmt)}
                </p>
                {/* Subtle misc indicator — just a tiny dot, no text */}
                {hasMisc && (
                  <p className="text-[9px] text-orange-400 font-medium leading-none mt-0.5">
                    +misc
                  </p>
                )}
              </div>
            </div>

            {/* Turf + ID */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                {turfName}
              </h3>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                {booking.id?.startsWith("#") ? booking.id : `#${booking.id}`}
              </p>
            </div>

            {/* Meta */}
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

        {/* Select-mode checkbox */}
        {selectMode && (
          <div
            className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all"
            style={{
              background:     selected ? "#22c55e" : "rgba(255,255,255,0.15)",
              border:         selected ? "none"    : "2px solid rgba(255,255,255,0.35)",
              backdropFilter: "blur(4px)",
            }}
          >
            {selected && <Check size={13} strokeWidth={3} className="text-black" />}
          </div>
        )}
      </div>

      {/* Misc cost sheet — portal, no layout impact */}
      {miscOpen && (
        <MiscCostSheet
          booking={booking}
          onClose={() => setMiscOpen(false)}
          onEnterSelect={() => onLongPress?.(booking.id)}
        />
      )}
    </>
  )
}
