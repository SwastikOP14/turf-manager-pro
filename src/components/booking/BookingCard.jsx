import { useNavigate } from "react-router-dom"
import { Check, Calendar, Clock, Users } from "lucide-react"
import { useState, useRef } from "react"
import { useApp } from "../../context/useApp"
import { useHaptics } from "../../context/HapticsContext"
import EditBookingSheet from "./EditBookingSheet"

import GlassCard from "../common/GlassCard"
import SportIcon from "../common/SportIcon"
import { formatCurrency, formatDisplayDate, formatTimeRange } from "../../utils/format"

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
  const { updateBooking, getPlayerById } = useApp()
  const haptics = useHaptics()
  const pressTimer = useRef(null)

  const statusConfig = {
    Paid:    {
      accent: "#10b981",        // Green
      bg: "var(--bg-card)",     // Standard card background
      pillBg: "rgba(16,185,129,0.12)",
      pillColor: "#065f46",
      pillColorDark: "#6ee7b7",
      label: "Paid",
      badgeClass: "badge badge-paid",
    },
    Partial: {
      accent: "#f59e0b",        // Amber
      bg: "var(--bg-card)",     // Standard card background
      pillBg: "rgba(245,158,11,0.12)",
      pillColor: "#92400e",
      pillColorDark: "#fcd34d",
      label: "To Pay",
      badgeClass: "badge badge-partial",
    },
    Pending: {
      accent: "#ef4444",        // Red
      bg: "var(--bg-card)",     // Standard card background
      pillBg: "rgba(239,68,68,0.10)",
      pillColor: "#991b1b",
      pillColorDark: "#fca5a5",
      label: "Unpaid",
      badgeClass: "badge badge-pending",
    },
  }

  const status     = statusConfig[booking.status] ?? statusConfig.Pending
  const baseAmt    = Number(booking.amount) || 0
  const miscTotal  = (booking.miscCosts || []).reduce((s, c) => s + (c.qty * c.price), 0)
  const additionalTimeCost = (booking.additionalTime || 0) * 10
  const totalAmt   = baseAmt + miscTotal + additionalTimeCost
  const sportLabel = sportName || sport?.name || "Sport"
  const hasExtras  = miscTotal > 0 || additionalTimeCost > 0

  const playerCount = (() => {
    if (booking.bookingType === "Team" || booking.teams?.length) {
      return booking.teams?.reduce((sum, t) => sum + (t.playerIds?.length || 0), 0) || 0
    }
    return booking.playerIds?.length || 0
  })()

  const paidByPlayer = getPlayerById(booking.paidByPlayerId)

  // ── Press handlers ───────────────────────────────────────────────────────

  const startPress = () => {
    if (selectMode) return
    pressTimer.current = setTimeout(() => {
      // Long press → enter select mode
      haptics.trigger(8)
      onLongPress?.(booking.id)
    }, 500)
  }

  const endPress = () => {
    clearTimeout(pressTimer.current)
  }

  const handleClick = () => {
    // Clear any pending long-press
    clearTimeout(pressTimer.current)
    
    if (selectMode) {
      // In select mode: toggle selection
      haptics.trigger(8)
      onSelect?.(booking.id)
    } else {
      // Normal mode: navigate to edit
      navigate(`/booking/${booking.id}/edit`)
    }
  }

  return (
    <>
      <div
        style={{ userSelect: "none", WebkitUserSelect: "none", position: "relative" }}
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
            padding: "16px 16px 16px 20px",
            outline:    selected ? "2px solid #10b981" : "none",
            outlineOffset: "1px",
            background: selected
              ? "rgba(16,185,129,0.08)"   /* light green for selection */
              : status.bg,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {/* Status accent bar — 4px, flush left */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: "4px",
            background: selected ? "#10b981" : status.accent,
            borderRadius: "0",
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Row 1: sport emoji+name pill (left) + amount (right) */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
              {/* Sport pill */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: status.pillBg,
                borderRadius: "99px",
                padding: "5px 12px",
              }}>
                <SportIcon sportId={sportId} sportName={sportName} sport={sport} size={14} />
                <span style={{
                  fontSize: "13px", fontWeight: 700,
                  color: document.documentElement.classList.contains("dark")
                    ? status.pillColorDark
                    : status.pillColor,
                }}>
                  {sportLabel}
                </span>
              </div>
              
              {/* Amount - with strikethrough if partial payment */}
              <div style={{ textAlign: "right" }}>
                {booking.status === "Partial" && baseAmt !== totalAmt ? (
                  <>
                    <p style={{
                      fontSize: "13px", fontWeight: 600,
                      color: "var(--text-muted)",
                      margin: 0,
                      textDecoration: "line-through",
                    }}>
                      {formatCurrency(baseAmt)}
                    </p>
                    <p style={{
                      fontSize: "18px", fontWeight: 700,
                      color: "#f59e0b",
                      margin: 0, fontFeatureSettings: '"tnum" 1', letterSpacing: "-0.03em",
                    }}>
                      {formatCurrency(totalAmt - (booking.paidAmount || 0))} left
                    </p>
                  </>
                ) : (
                  <p style={{
                    fontSize: "20px", fontWeight: 700,
                    color: selected ? "#10b981" : status.accent,
                    margin: 0, fontFeatureSettings: '"tnum" 1', letterSpacing: "-0.03em",
                  }}>
                    {formatCurrency(totalAmt)}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: turf/ground name (bold) + booking ID */}
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
              <h3 style={{
                fontSize: "16px", fontWeight: 700, color: "var(--text-primary)",
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

            {/* Row 3: date/time/players + extras + paid-by + status badge */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {/* Main info row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
                    <Calendar size={11} style={{ color: "var(--brand)", flexShrink: 0 }} />
                    {formatDisplayDate(booking.date)}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
                    <Clock size={11} style={{ color: "var(--brand)", flexShrink: 0 }} />
                    {formatTimeRange(booking.startTime, booking.endTime)}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
                    <Users size={11} style={{ color: "var(--brand)" }} />
                    {playerCount}
                  </span>
                </div>
                
                {/* Status badge pill */}
                <span className={status.badgeClass} style={{ fontSize: "10px", flexShrink: 0 }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />
                  {status.label}
                </span>
              </div>
              
              {/* Extras + paid-by row (if applicable) */}
              {(hasExtras || paidByPlayer) && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  {miscTotal > 0 && (
                    <span style={{
                      fontSize: "10px", fontWeight: 600,
                      color: "#f59e0b",
                      padding: "2px 8px",
                      borderRadius: "99px",
                      background: "rgba(245,158,11,0.12)"
                    }}>
                      +{formatCurrency(miscTotal)} Extras
                    </span>
                  )}
                  {booking.additionalTime > 0 && (
                    <span style={{
                      fontSize: "10px", fontWeight: 600,
                      color: "#f59e0b",
                      padding: "2px 8px",
                      borderRadius: "99px",
                      background: "rgba(245,158,11,0.12)"
                    }}>
                      +{booking.additionalTime} min
                    </span>
                  )}
                  {paidByPlayer && (
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 500 }}>
                      Paid by {paidByPlayer.name}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Select-mode checkbox (top-left) */}
        {selectMode && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "28px",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: selected ? "#10b981" : "rgba(255,255,255,0.9)",
              border: selected ? "none" : "2px solid rgba(0,0,0,0.2)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "all 0.15s ease",
              pointerEvents: "none",
            }}
          >
            {selected && <Check size={14} strokeWidth={3} style={{ color: "#000" }} />}
          </div>
        )}
      </div>
    </>
  )
}
