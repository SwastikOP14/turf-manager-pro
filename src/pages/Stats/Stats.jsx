import { useMemo, useState } from "react"

import MobileLayout from "../../components/layout/MobileLayout"
import StatCard from "../../components/stats/StatCard"
import GlassCard from "../../components/common/GlassCard"
import DateRangeModal from "../../components/booking/DateRangeModal"
import { useApp } from "../../context/useApp"
import { filterBookingsByPeriod } from "../../utils/dates"
import { formatCurrency } from "../../utils/format"

const PERIODS = ["This Week", "This Month", "This Year", "Custom"]

export default function Stats() {
  const { bookings, players, getPlayerById, getTurfById } = useApp()

  const [period, setPeriod] = useState("This Week")
  const [customRange, setCustomRange] = useState({ start: null, end: null })
  const [rangeModalOpen, setRangeModalOpen] = useState(false)
  const [draftStart, setDraftStart] = useState(null)
  const [draftEnd, setDraftEnd] = useState(null)

  const filtered = useMemo(
    () => filterBookingsByPeriod(bookings, period, customRange),
    [bookings, period, customRange]
  )

  const totalAmountPaid = useMemo(
    () =>
      filtered.reduce(
        (sum, booking) => sum + Number(booking.paidAmount || 0),
        0
      ),
    [filtered]
  )

  const averageShare = useMemo(() => {
    const shares = filtered.flatMap((booking) => {
      if (!booking.playerIds?.length) {
        return []
      }

      const share = booking.amount / booking.playerIds.length
      return booking.playerIds.map(() => share)
    })

    if (!shares.length) {
      return 0
    }

    return shares.reduce((a, b) => a + b, 0) / shares.length
  }, [filtered])

  const topPlayers = useMemo(() => {
    const counts = {}

    filtered.forEach((booking) => {
      booking.playerIds?.forEach((playerId) => {
        counts[playerId] = (counts[playerId] || 0) + 1
      })
    })

    return Object.entries(counts)
      .map(([playerId, count]) => ({
        playerId,
        count,
        name: getPlayerById(playerId)?.name || "Unknown"
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)
  }, [filtered, getPlayerById])

  const topTurfs = useMemo(() => {
    const counts = {}

    filtered.forEach((booking) => {
      counts[booking.turfId] = (counts[booking.turfId] || 0) + 1
    })

    return Object.entries(counts)
      .map(([turfId, count]) => ({
        turfId,
        count,
        name: getTurfById(turfId)?.name || "Unknown"
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)
  }, [filtered, getTurfById])

  return (
    <MobileLayout>
      <div className="pt-2 px-5 pb-5 space-y-4 animate-fade-in-up">
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", margin: 0 }}>Statistics</h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0" }}>
            Business analytics
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {PERIODS.map((item) => (
            <button
              key={item}
              onClick={() => {
                if (item === "Custom") {
                  setDraftStart(customRange.start)
                  setDraftEnd(customRange.end)
                  setRangeModalOpen(true)
                  return
                }
                setPeriod(item)
              }}
              style={{
                padding: "7px 14px",
                borderRadius: "99px",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "inherit",
                border: period === item ? "none" : "1.5px solid var(--bg-border)",
                background: period === item ? "var(--brand)" : "var(--bg-card)",
                color: period === item ? "#000" : "var(--text-secondary)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                boxShadow: period === item ? "0 2px 12px var(--brand-glow)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard title="Total Bookings"   value={String(filtered.length)}           gradient="linear-gradient(135deg,#6366f1,#4f46e5)" />
          <StatCard title="Amount Collected" value={formatCurrency(totalAmountPaid)}    gradient="linear-gradient(135deg,var(--brand),#00B4D8)" />
          <StatCard title="Total Players"    value={String(players.length)}             gradient="linear-gradient(135deg,#a855f7,#7c3aed)" />
          <StatCard title="Avg per Person"   value={formatCurrency(averageShare)}       gradient="linear-gradient(135deg,#f59e0b,#ef4444)" />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <GlassCard className="space-y-3">
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              🏆 Most Active Players
            </h2>

            {topPlayers.map((item, i) => {
              const maxCount = topPlayers[0]?.count || 1
              return (
                <div key={item.playerId} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", width: "16px", flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand)", flexShrink: 0, marginLeft: "8px" }}>
                        {item.count}
                      </span>
                    </div>
                    <div style={{ height: "4px", borderRadius: "2px", background: "var(--bg-elevated)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(item.count / maxCount) * 100}%`, background: "var(--brand)", borderRadius: "2px", transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                </div>
              )
            })}

            {!topPlayers.length && (
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No data for this range.</p>
            )}
          </GlassCard>

          <GlassCard className="space-y-3">
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              🏟️ Most Played Grounds
            </h2>

            {topTurfs.map((item, i) => {
              const maxCount = topTurfs[0]?.count || 1
              return (
                <div key={item.turfId} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", width: "16px", flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand)", flexShrink: 0, marginLeft: "8px" }}>
                        {item.count}
                      </span>
                    </div>
                    <div style={{ height: "4px", borderRadius: "2px", background: "var(--bg-elevated)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(item.count / maxCount) * 100}%`, background: "linear-gradient(90deg, var(--secondary), var(--brand))", borderRadius: "2px" }} />
                    </div>
                  </div>
                </div>
              )
            })}

            {!topTurfs.length && (
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No data for this range.</p>
            )}
          </GlassCard>
        </div>
      </div>

      <DateRangeModal
        open={rangeModalOpen}
        onClose={() => setRangeModalOpen(false)}
        startDate={draftStart}
        endDate={draftEnd}
        onStartChange={setDraftStart}
        onEndChange={setDraftEnd}
        onApply={() => {
          setCustomRange({ start: draftStart, end: draftEnd })
          setPeriod("Custom")
          setRangeModalOpen(false)
        }}
      />
    </MobileLayout>
  )
}
