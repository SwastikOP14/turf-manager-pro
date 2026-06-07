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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Statistics
          </h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
            Dynamic turf business analytics
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
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
              className={`
                px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap
                ${period === item
                  ? "bg-green-500 text-black"
                  : "bg-[var(--color-card)] text-slate-900 dark:text-white border border-[var(--color-card-border)]"
                }
              `}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard title="Total Bookings" value={String(filtered.length)} />
          <StatCard title="Total Amount Paid" value={formatCurrency(totalAmountPaid)} />
          <StatCard title="Total Players" value={String(players.length)} />
          <StatCard
            title="Avg Share / Person"
            value={formatCurrency(averageShare)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <GlassCard className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Players With Most Bookings
            </h2>

            {topPlayers.map((item) => (
              <div
                key={item.playerId}
                className="flex justify-between text-sm"
              >
                <span className="text-slate-600 dark:text-gray-300">
                  {item.name}
                </span>
                <span className="text-green-700 dark:text-green-400 font-semibold">
                  {item.count}
                </span>
              </div>
            ))}

            {!topPlayers.length && (
              <p className="text-sm text-slate-500">No data for this range.</p>
            )}
          </GlassCard>

          <GlassCard className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Turf/Ground Most Played
            </h2>

            {topTurfs.map((item) => (
              <div
                key={item.turfId}
                className="flex justify-between text-sm"
              >
                <span className="text-slate-600 dark:text-gray-300">
                  {item.name}
                </span>
                <span className="text-green-700 dark:text-green-400 font-semibold">
                  {item.count}
                </span>
              </div>
            ))}

            {!topTurfs.length && (
              <p className="text-sm text-slate-500">No data for this range.</p>
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
