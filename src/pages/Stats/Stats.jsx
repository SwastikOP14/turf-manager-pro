import { useMemo, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from "recharts"

import MobileLayout from "../../components/layout/MobileLayout"
import StatCard from "../../components/stats/StatCard"
import GlassCard from "../../components/common/GlassCard"
import DateRangeModal from "../../components/booking/DateRangeModal"
import { useApp } from "../../context/useApp"
import { filterBookingsByPeriod } from "../../utils/dates"
import { formatCurrency } from "../../utils/format"

const PERIODS = ["This Week", "This Month", "This Year", "Custom"]
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// ── Empty state component ─────────────────────────────────────────────────────
function EmptyStats() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", gap: "12px", textAlign: "center" }}>
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
        <rect x="8" y="8" width="56" height="56" rx="12" fill="var(--brand-subtle)" />
        <rect x="18" y="40" width="8" height="16" rx="3" fill="var(--brand)" opacity="0.4" />
        <rect x="32" y="28" width="8" height="28" rx="3" fill="var(--brand)" opacity="0.7" />
        <rect x="46" y="34" width="8" height="22" rx="3" fill="var(--brand)" />
      </svg>
      <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>No data for this period</p>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>Add bookings to see analytics here</p>
    </div>
  )
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "var(--bg-elevated)", border: "1px solid var(--bg-border)",
      borderRadius: "10px", padding: "8px 12px", boxShadow: "var(--shadow-card)",
    }}>
      <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>{label}</p>
      <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--brand)", margin: "2px 0 0" }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  )
}

// ── Custom donut label ────────────────────────────────────────────────────────
function DonutLabel({ cx, cy, total }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-6" style={{ fontSize: "20px", fontWeight: 800, fill: "var(--text-primary)" }}>
        {total}
      </tspan>
      <tspan x={cx} dy="20" style={{ fontSize: "10px", fill: "var(--text-muted)" }}>
        bookings
      </tspan>
    </text>
  )
}

export default function Stats() {
  const { bookings, players, getPlayerById, getTurfById } = useApp()

  const [period, setPeriod]           = useState("This Week")
  const [customRange, setCustomRange] = useState({ start: null, end: null })
  const [rangeModalOpen, setRangeModalOpen] = useState(false)
  const [draftStart, setDraftStart]   = useState(null)
  const [draftEnd, setDraftEnd]       = useState(null)

  const isDark = document.documentElement.classList.contains("dark")

  const filtered = useMemo(
    () => filterBookingsByPeriod(bookings, period, customRange),
    [bookings, period, customRange]
  )

  const totalAmountPaid = useMemo(
    () => filtered.reduce((s, b) => s + Number(b.paidAmount || 0), 0),
    [filtered]
  )

  const averageShare = useMemo(() => {
    const shares = filtered.flatMap((b) => {
      if (!b.playerIds?.length) return []
      const share = b.amount / b.playerIds.length
      return b.playerIds.map(() => share)
    })
    return shares.length ? shares.reduce((a, b) => a + b, 0) / shares.length : 0
  }, [filtered])

  // ── Weekly revenue bar data (last 7 days, Mon-Sun) ───────────────────────
  const weeklyRevenue = useMemo(() => {
    // Build last 7 days from today
    const today = new Date()
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1) + i)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
      return { day: DAY_LABELS[i], key, revenue: 0 }
    })
    bookings.forEach((b) => {
      const entry = days.find((d) => d.key === b.date)
      if (entry) entry.revenue += Number(b.paidAmount || 0)
    })
    return days
  }, [bookings])

  const weekTotal = weeklyRevenue.reduce((s, d) => s + d.revenue, 0)

  // ── Payment breakdown donut data ─────────────────────────────────────────
  const paymentBreakdown = useMemo(() => {
    const counts = { Paid: 0, Partial: 0, Pending: 0 }
    filtered.forEach((b) => { if (counts[b.status] !== undefined) counts[b.status]++ })
    return [
      { name: "Paid",    value: counts.Paid,    color: "#10b981", pct: filtered.length ? Math.round(counts.Paid/filtered.length*100) : 0 },
      { name: "Partial", value: counts.Partial, color: "#f59e0b", pct: filtered.length ? Math.round(counts.Partial/filtered.length*100) : 0 },
      { name: "Unpaid",  value: counts.Pending, color: "#ef4444", pct: filtered.length ? Math.round(counts.Pending/filtered.length*100) : 0 },
    ].filter((d) => d.value > 0)
  }, [filtered])

  const topPlayers = useMemo(() => {
    const counts = {}
    filtered.forEach((b) => b.playerIds?.forEach((pid) => { counts[pid] = (counts[pid] || 0) + 1 }))
    return Object.entries(counts)
      .map(([pid, count]) => ({ playerId: pid, count, name: getPlayerById(pid)?.name || "Unknown" }))
      .sort((a, b) => b.count - a.count).slice(0, 10)
  }, [filtered, getPlayerById])

  const topTurfs = useMemo(() => {
    const counts = {}
    filtered.forEach((b) => { counts[b.turfId] = (counts[b.turfId] || 0) + 1 })
    return Object.entries(counts)
      .map(([tid, count]) => ({ turfId: tid, count, name: getTurfById(tid)?.name || "Unknown" }))
      .sort((a, b) => b.count - a.count).slice(0, 10)
  }, [filtered, getTurfById])

  const axisColor = isDark ? "#475569" : "#cbd5e1"
  const textColor = isDark ? "#94a3b8" : "#64748b"

  return (
    <MobileLayout>
      <div className="pt-2 px-5 pb-5 space-y-4 animate-fade-in-up">

        {/* Header */}
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", margin: 0 }}>
            Statistics
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0" }}>Business analytics</p>
        </div>

        {/* Period tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {PERIODS.map((item) => (
            <button key={item}
              onClick={() => {
                if (item === "Custom") { setDraftStart(customRange.start); setDraftEnd(customRange.end); setRangeModalOpen(true); return }
                setPeriod(item)
              }}
              style={{
                padding: "7px 14px", borderRadius: "99px", fontSize: "12px", fontWeight: 600,
                fontFamily: "inherit", border: period === item ? "none" : "1.5px solid var(--bg-border)",
                background: period === item ? "var(--brand)" : "var(--bg-card)",
                color: period === item ? "#000" : "var(--text-secondary)",
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                boxShadow: period === item ? "0 2px 12px var(--brand-glow)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard title="Total Bookings"   value={String(filtered.length)}        gradient="linear-gradient(135deg,#6366f1,#4f46e5)" />
          <StatCard title="Amount Collected" value={formatCurrency(totalAmountPaid)} gradient="linear-gradient(135deg,var(--brand),#00B4D8)" />
          <StatCard title="Total Players"    value={String(players.length)}          gradient="linear-gradient(135deg,#a855f7,#7c3aed)" />
          <StatCard title="Avg per Person"   value={formatCurrency(averageShare)}    gradient="linear-gradient(135deg,#f59e0b,#ef4444)" />
        </div>

        {/* ── Weekly Revenue Bar Chart ─────────────────────────────── */}
        <GlassCard>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Weekly Revenue</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                {formatCurrency(weekTotal)} this week
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyRevenue} barCategoryGap="30%">
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: textColor }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<RevenueTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {weeklyRevenue.map((entry, i) => (
                  <Cell key={i} fill={entry.revenue > 0 ? "var(--brand)" : axisColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* ── Payment Breakdown Donut ───────────────────────────────── */}
        <GlassCard>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px" }}>
            Payment Breakdown
          </p>
          {filtered.length === 0 ? (
            <EmptyStats />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, pct }) => `${name} ${pct}%`}
                    labelLine={false}
                  >
                    {paymentBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <DonutLabel cx="50%" cy="50%" total={filtered.length} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "8px" }}>
                {paymentBreakdown.map((d) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
                      {d.name} ({d.value})
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassCard>

        {/* ── Leaderboards ──────────────────────────────────────────── */}
        <GlassCard className="space-y-3">
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>🏆 Most Active Players</h2>
          {topPlayers.length === 0 ? (
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>No data for this period</p>
          ) : topPlayers.map((item, i) => {
            const max = topPlayers[0]?.count || 1
            return (
              <div key={item.playerId} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", width: "14px", flexShrink: 0 }}>{i+1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand)", flexShrink: 0, marginLeft: "8px" }}>{item.count}</span>
                  </div>
                  <div style={{ height: "4px", borderRadius: "2px", background: "var(--bg-elevated)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(item.count/max)*100}%`, background: "var(--brand)", borderRadius: "2px" }} />
                  </div>
                </div>
              </div>
            )
          })}
        </GlassCard>

        <GlassCard className="space-y-3">
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>🏟️ Most Played Grounds</h2>
          {topTurfs.length === 0 ? (
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>No data for this period</p>
          ) : topTurfs.map((item, i) => {
            const max = topTurfs[0]?.count || 1
            return (
              <div key={item.turfId} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", width: "14px", flexShrink: 0 }}>{i+1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand)", flexShrink: 0, marginLeft: "8px" }}>{item.count}</span>
                  </div>
                  <div style={{ height: "4px", borderRadius: "2px", background: "var(--bg-elevated)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(item.count/max)*100}%`, background: "linear-gradient(90deg,var(--secondary),var(--brand))", borderRadius: "2px" }} />
                  </div>
                </div>
              </div>
            )
          })}
        </GlassCard>

      </div>

      <DateRangeModal
        open={rangeModalOpen}
        onClose={() => setRangeModalOpen(false)}
        startDate={draftStart} endDate={draftEnd}
        onStartChange={setDraftStart} onEndChange={setDraftEnd}
        onApply={() => { setCustomRange({ start: draftStart, end: draftEnd }); setPeriod("Custom"); setRangeModalOpen(false) }}
      />
    </MobileLayout>
  )
}
