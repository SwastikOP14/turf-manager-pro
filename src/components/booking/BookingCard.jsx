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
      className="fixed inset-0 z-99999 flex items-end"
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
    Paid:    {
      accent: "var(--status-paid)",
      bg: "rgba(16,185,129,0.04)",
      pillBg: "rgba(16,185,129,0.12)",
      pillColor: "#065f46",
      pillColorDark: "#6ee7b7",
      label: "Paid",
      badgeClass: "badge badge-paid",
    },
    Partial: {
      accent: "var(--status-partial)",
      bg: "rgba(245,158,11,0.04)",
      pillBg: "rgba(245,158,11,0.12)",
      pillColor: "#92400e",
      pillColorDark: "#fcd34d",
      label: "To Pay",
      badgeClass: "badge badge-partial",
    },
    Pending: {
      accent: "var(--status-pending)",
      bg: "rgba(239,68,68,0.04)",
      pillBg: "rgba(239,68,68,0.10)",
      pillColor: "#991b1b",
      pillColorDark: "#fca5a5",
      label: "Unpaid",
      badgeClass: "badge badge-pending",
    },
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
          className="relative overflow-hidden cursor-pointer transition-all duration-150"
          style={{
            padding: "14px 14px 14px 20px",
            outline:    selected ? "2px solid #3b82f6" : "none",
            outlineOffset: "1px",
            background: selected
              ? "rgba(59,130,246,0.08)"   /* light blue for multi-select */
              : status.bg,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {/* Status accent bar — full card height, flush left */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: "4px",
            background: selected ? "#3b82f6" : status.accent,
            borderRadius: "0",
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Row 1: sport pill + amount */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              {/* Sport pill — colored bg */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                background: status.pillBg,
                borderRadius: "99px",
                padding: "4px 10px",
              }}>
                <SportIcon sportId={sportId} sportName={sportName} sport={sport} size={12} />
                <span style={{
                  fontSize: "11px", fontWeight: 700,
                  color: document.documentElement.classList.contains("dark")
                    ? status.pillColorDark
                    : status.pillColor,
                }}>
                  {sportLabel}
                </span>
              </div>
              {/* Amount — 20px bold */}
              <div style={{ textAlign: "right" }}>
                <p style={{
                  fontSize: "20px", fontWeight: 700,
                  color: selected ? "#3b82f6" : status.accent,
                  margin: 0, fontFeatureSettings: '"tnum" 1', letterSpacing: "-0.03em",
                }}>
                  {formatCurrency(totalAmt)}
                </p>
                {hasMisc && (
                  <p style={{ fontSize: "9px", color: "var(--status-partial)", margin: 0, fontWeight: 600 }}>+misc</p>
                )}
              </div>
            </div>

            {/* Row 2: turf + booking ID */}
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
              <h3 style={{
                fontSize: "15px", fontWeight: 700, color: "var(--text-primary)",
                margin: 0, letterSpacing: "-0.01em",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
              }}>
                {turfName}
              </h3>
              <span style={{
                fontSize: "10px", fontWeight: 600, color: "var(--text-muted)",
                textTransform: "uppercase", letterSpacing: "0.12em", flexShrink: 0,
              }}>
                {booking.id?.startsWith("#") ? booking.id : `#${booking.id}`}
              </span>
            </div>

            {/* Row 3: date / time / players / status badge */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
                  <Calendar size={11} style={{ color: "var(--brand)", flexShrink: 0 }} />
                  {formatDisplayDate(booking.date)}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
                  <Clock size={11} style={{ color: "var(--brand)", flexShrink: 0 }} />
                  {formatTimeRange(booking.startTime, booking.endTime)}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", color: "var(--text-muted)" }}>
                  <Users size={11} style={{ color: "var(--brand)" }} />
                  {playerCount}
                </span>
                <span className={status.badgeClass} style={{ fontSize: "10px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />
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
