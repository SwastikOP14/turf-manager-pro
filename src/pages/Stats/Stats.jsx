import { useMemo, useState, useEffect } from "react"
import { TrendingUp, ArrowLeft, Calendar } from "lucide-react"
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, LabelList, ResponsiveContainer } from "recharts"

import MobileLayout from "../../components/layout/MobileLayout"
import GlassCard from "../../components/common/GlassCard"
import DateRangeModal from "../../components/booking/DateRangeModal"
import { useApp } from "../../context/useApp"
import { useHaptics } from "../../context/HapticsContext"
import { useNavigate } from "react-router-dom"
import { filterBookingsByPeriod, getPreviousPeriodRange, filterBookingsByDateRange } from "../../utils/dates"
import PlayerAvatar from "../../components/common/PlayerAvatar"
import { formatCurrency } from "../../utils/format"

const PERIODS = ["This Week", "This Month", "This Year", "Custom"]

export default function Stats() {
  const { bookings, players, getPlayerById, getTurfById, getSportById } = useApp()
  const haptics = useHaptics()
  const navigate = useNavigate()

  const [period, setPeriod] = useState("This Week")
  const [customRange, setCustomRange] = useState({ start: null, end: null })
  const [rangeModalOpen, setRangeModalOpen] = useState(false)
  const [draftStart, setDraftStart] = useState(null)
  const [draftEnd, setDraftEnd] = useState(null)


  const filtered = useMemo(
    () => filterBookingsByPeriod(bookings, period, customRange),
    [bookings, period, customRange]
  )

  const previousFiltered = useMemo(() => {
    const prevRange = getPreviousPeriodRange(period, customRange)
    if (!prevRange) return []
    return filterBookingsByDateRange(bookings, prevRange.start, prevRange.end)
  }, [bookings, period, customRange])

  const totalAmountCollected = useMemo(() => {
    return filtered.reduce((sum, b) => {
      if (b.status === "Paid") return sum + Number(b.paidAmount || 0)
      if (b.status === "Partial") return sum + Number(b.paidAmount || 0)
      return sum // Pending = 0
    }, 0)
  }, [filtered])

  const totalPlayers = useMemo(() => {
    const uniquePlayerIds = new Set()
    filtered.forEach(booking => {
      // Add individual booking players
      if (booking.playerIds?.length) {
        booking.playerIds.forEach(id => uniquePlayerIds.add(id))
      }
      // Add team booking players  
      if (booking.teams?.length) {
        booking.teams.forEach(team => {
          team.playerIds?.forEach(id => uniquePlayerIds.add(id))
        })
      }
    })
    return uniquePlayerIds.size
  }, [filtered])

  const avgPerBooking = filtered.length ? filtered.reduce((sum, b) => sum + Number(b.amount || 0), 0) / filtered.length : 0

  // Revenue chart data — bucketed by day/week/month depending on period
  const revenueData = useMemo(() => {
    const map = {}
    filtered.forEach(b => {
      if (!b.date) return
      const amount = Number(b.amount || 0)
      const d = new Date(b.date)
      let key
      if (period === "This Year") {
        key = d.toLocaleDateString("en-US", { month: "short" })
      } else if (period === "This Month") {
        const weekNum = Math.ceil(d.getDate() / 7)
        key = `Week ${weekNum}`
      } else {
        key = d.toLocaleDateString("en-US", { weekday: "short" })
      }
      map[key] = (map[key] || 0) + amount
    })

    if (period === "This Year") {
      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return monthOrder.filter(m => map[m] !== undefined).map(m => ({ date: m, amount: map[m] }))
    }
    if (period === "This Month") {
      return Object.entries(map)
        .sort(([a], [b]) => parseInt(a.replace("Week ", "")) - parseInt(b.replace("Week ", "")))
        .map(([date, amount]) => ({ date, amount }))
    }
    const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return dayOrder.filter(d => map[d] !== undefined).map(d => ({ date: d, amount: map[d] }))
  }, [filtered, period])

  const totalRevenue = useMemo(
    () => filtered.reduce((sum, b) => sum + Number(b.amount || 0), 0),
    [filtered]
  )

  const previousRevenue = useMemo(
    () => previousFiltered.reduce((sum, b) => sum + Number(b.amount || 0), 0),
    [previousFiltered]
  )

  const revenueGrowthPct = previousRevenue > 0
    ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
    : (totalRevenue > 0 ? 100 : 0)

  const periodLabel = period === "This Week" ? "week" : period === "This Month" ? "month" : "year"
  // Payment status data
  const paymentStatusData = useMemo(() => {
    const paid = filtered.filter(b => b.status === "Paid").length
    const partial = filtered.filter(b => b.status === "Partial").length
    const pending = filtered.filter(b => b.status === "Pending").length
    return [
      { name: "Paid", value: paid, color: "#16A34A" },
      { name: "Partial", value: partial, color: "#F59E08" },
      { name: "Pending", value: pending, color: "#EF4444" },
    ].filter(d => d.value > 0)
  }, [filtered])

  // Sport bookings data
  const sportData = useMemo(() => {
    const map = {}
    filtered.forEach(b => {
      const sport = getSportById(b.sportId)
      const name = sport?.name || b.sportName || "Unknown"
      map[name] = (map[name] || 0) + 1
    })
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [filtered, getSportById])

  // Peak hours data
  const peakHoursData = useMemo(() => {
    const map = {}
    filtered.forEach(b => {
      if (!b.startTime) return
      const hour = parseInt(b.startTime.split(":")[0])
      const label = hour === 0 ? "12AM" : hour < 12 ? `${hour}AM` : hour === 12 ? "12PM" : `${hour - 12}PM`
      map[label] = (map[label] || 0) + 1
    })
    return Object.entries(map)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => {
        const toNum = h => {
          const isPM = h.includes("PM")
          const n = parseInt(h)
          return isPM ? (n === 12 ? 12 : n + 12) : (n === 12 ? 0 : n)
        }
        return toNum(a.hour) - toNum(b.hour)
      })
  }, [filtered])

  // Most active players data
  const playerStats = useMemo(() => {
    const map = {}
    filtered.forEach(b => {
      const ids = [...(b.playerIds || []), ...(b.teams || []).flatMap(t => t.playerIds || [])]
      ids.forEach(pid => { map[pid] = (map[pid] || 0) + 1 })
    })
    return Object.entries(map)
      .map(([pid, count]) => ({ player: getPlayerById(pid), count }))
      .filter(x => x.player)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [filtered, getPlayerById])
  // Most played grounds data  
  const groundStats = useMemo(() => {
    const map = {}
    filtered.forEach(b => {
      const turf = getTurfById(b.turfId)
      const name = turf?.name || b.turfName || "Unknown"
      map[name] = (map[name] || 0) + 1
    })
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [filtered, getTurfById])
  return (
    <MobileLayout>
      <div className="pt-3 px-4 pb-24 space-y-3 animate-fade-in-up">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-[22px] font-bold text-slate-900 dark:text-white leading-tight">Statistics</h1>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Business analytics & insights</p>
            </div>
          </div>
        </div>
        {/* Period filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {PERIODS.map((item) => (
            <button key={item}
              onClick={() => {
                haptics.trigger(10)
                if (item === "Custom") {
                  setDraftStart(customRange.start);
                  setDraftEnd(customRange.end);
                  setRangeModalOpen(true);
                  return
                }
                setPeriod(item)
              }}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold cursor-pointer whitespace-nowrap shrink-0 transition-all
                  ${period === item
                  ? "bg-green-500 text-white shadow-lg border border-green-500"
                  : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-white/20 hover:border-green-500/50"
                }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4">
          <GlassCard className="p-3 bg-linear-to-br from-purple-500 to-purple-700 text-white relative overflow-hidden">
            <TrendingUp size={20} className="absolute top-3 right-3 opacity-30" />
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">Total Bookings</p>
            <p className="text-[20px] font-bold text-center">{filtered.length}</p>
          </GlassCard>

          <GlassCard className="p-3 bg-linear-to-br from-teal-500 to-green-600 text-white relative overflow-hidden">
            <TrendingUp size={20} className="absolute top-3 right-3 opacity-30" />
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">Amount Collected</p>
            <p className="text-[20px] font-bold text-center">{formatCurrency(totalAmountCollected)}</p>
          </GlassCard>

          <GlassCard className="p-3 bg-linear-to-br from-indigo-500 to-indigo-700 text-white relative overflow-hidden">
            <TrendingUp size={20} className="absolute top-3 right-3 opacity-30" />
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">Total Players</p>
            <p className="text-[20px] font-bold text-center">{totalPlayers || 0}</p>
          </GlassCard>

          <GlassCard className="p-3 bg-linear-to-br from-orange-400 to-orange-600 text-white relative overflow-hidden">
            <TrendingUp size={20} className="absolute top-3 right-3 opacity-30" />
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">Avg Per Booking</p>
            <p className="text-[20px] font-bold text-center">{avgPerBooking > 0 ? formatCurrency(avgPerBooking) : "—"}</p>
          </GlassCard>
        </div>
        {/* Revenue Area Chart */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Revenue Over Time</h2>
            {totalRevenue > 0 && (
              <span className="text-[11px] font-bold bg-green-500 text-white px-2.5 py-1 rounded-full relative z-10" 
                style={{ backgroundColor: 'rgba(34, 197, 94, 1)', backdropFilter: 'blur(8px)' }}>
                {totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(1)}K` : totalRevenue}
              </span>
            )}
          </div>
          {revenueData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220} style={{ outline: "none", WebkitTapHighlightColor: "transparent", pointerEvents: "none" }}>
                <AreaChart data={revenueData} style={{ outline: "none", userSelect: "none" }} margin={{ top: 20, right: 15, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" opacity={0.15} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis
                    tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                    tickCount={4}
                    dx={-3}
                  />
                  <Tooltip active={false} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#16A34A"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                    dot={{ r: 3, fill: "#16A34A", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  >
                    <LabelList
                      dataKey="amount"
                      content={(props) => {
                        const { x, y, value, index, data } = props
                        if (value === undefined || value === null) return null
                        const formatted = value >= 1000 ? `${(value/1000).toFixed(1)}K` : value
                        const isValley = index > 0 && index < (data?.length - 1)
                          ? value < (data[index-1]?.amount || 0) && value < (data[index+1]?.amount || 0)
                          : false
                        const dy = isValley ? 18 : -10
                        return (
                          <text
                            x={x}
                            y={y + dy}
                            textAnchor="middle"
                            fontSize={10}
                            fontWeight={700}
                            fill="#22C55E"
                          >
                            {formatted}
                          </text>
                        )
                      }}
                    />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5 dark:border-white/8">
                <div className={`flex items-center gap-1 text-[13px] font-semibold ${revenueGrowthPct >= 0 ? "text-green-600" : "text-red-500"}`}>
                  <TrendingUp size={14} className={revenueGrowthPct < 0 ? "rotate-180" : ""} />
                  {Math.abs(revenueGrowthPct).toFixed(1)}% vs last {periodLabel}
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400">Total Revenue</p>
                  <p className="text-[14px] font-bold text-slate-900 dark:text-white">{formatCurrency(totalRevenue)}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[180px]">
              <p className="text-slate-400 text-[13px]">No bookings in this period</p>
            </div>
          )}
        </GlassCard>

        {/* Payment Status Donut Chart */}
        <GlassCard className="p-4">
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">Payment Status</h2>
          {paymentStatusData.length > 0 ? (
            <div className="flex items-center gap-4">
              <div style={{ position: "relative", width: "150px", height: "150px" }}>
                <PieChart width={150} height={150} style={{ pointerEvents: "none" }}>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip active={false} />
                </PieChart>
                <div style={{
                  position: "absolute",
                  width: "150px",
                  height: "150px",
                  top: 0,
                  left: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none"
                }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "20px", fontWeight: 700 }} className="text-slate-900 dark:text-white">{filtered.length}</p>
                    <p style={{ fontSize: "10px" }} className="text-slate-500 dark:text-slate-400">Total</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-2.5">
                {paymentStatusData.map((item, index) => {
                  const pct = filtered.length > 0 ? Math.round((item.value / filtered.length) * 100) : 0
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                          {item.name} ({item.value})
                        </span>
                      </div>
                      <span className="text-[13px] font-bold text-slate-900 dark:text-white">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-slate-400 text-[13px]">No bookings yet</p>
            </div>
          )}
        </GlassCard>
        {/* Bookings by Sport */}
        <GlassCard className="p-4">
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">Bookings by Sport</h2>
          {sportData.length > 0 ? (
            <div className="space-y-3">
              {sportData.map((sport) => {
                const maxCount = Math.max(...sportData.map(s => s.count), 1)
                const progress = (sport.count / maxCount) * 100
                return (
                  <div key={sport.name} className="flex items-center gap-3">
                    <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 w-20 shrink-0 truncate">
                      {sport.name}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-white/5">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[13px] font-bold text-slate-900 dark:text-white w-6 text-right shrink-0">
                      {sport.count}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[100px]">
              <p className="text-slate-400 text-[13px]">No bookings yet</p>
            </div>
          )}
        </GlassCard>

        {/* Peak Hours Chart */}
        <GlassCard className="p-4">
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">Peak Booking Hours</h2>
          {peakHoursData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160} style={{ outline: "none", WebkitTapHighlightColor: "transparent", pointerEvents: "none" }}>              <BarChart data={peakHoursData} margin={{ top: 20, right: 5, left: 5, bottom: 0 }} cursor={false}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" vertical={false} />
              <XAxis
                dataKey="hour"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                width={30}
              />
              <Tooltip active={false} />
              <Bar
                dataKey="count"
                fill="#16A34A"
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="count"
                  position="top"
                  style={{ fontSize: '10px', fontWeight: 'bold', fill: '#16A34A' }}
                  offset={4}
                />
              </Bar>
            </BarChart>
            </ResponsiveContainer>) : (
            <div className="flex items-center justify-center h-[140px]">
              <p className="text-slate-400 text-[13px]">No bookings yet</p>
            </div>
          )}
        </GlassCard>
        {/* Most Active Players */}
        <GlassCard className="p-4">
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">🏆 Most Active Players</h2>
          {playerStats.length > 0 ? (
            <div className="space-y-0 divide-y divide-black/5 dark:divide-white/8">
              {playerStats.map((stat, index) => {
                const maxCount = Math.max(...playerStats.map(s => s.count), 1)
                const progress = (stat.count / maxCount) * 100
                return (
                  <div key={stat.player.id} className="flex items-center gap-3 py-2.5">
                    <span className="text-[12px] font-bold text-slate-400 w-5 shrink-0">
                      {index + 1}
                    </span>
                    <PlayerAvatar player={stat.player} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-slate-900 dark:text-white truncate">
                        {stat.player.name}
                      </p>
                      <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/5">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[11px] font-bold bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full shrink-0">
                      {stat.count}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-slate-400 text-[13px]">No data for this period</p>
            </div>
          )}
        </GlassCard>

        {/* Most Played Grounds */}
        <GlassCard className="p-4">
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">🏟️ Most Played Grounds</h2>
          {groundStats.length > 0 ? (
            <div className="space-y-0 divide-y divide-black/5 dark:divide-white/8">
              {groundStats.map((ground, index) => {
                const maxCount = Math.max(...groundStats.map(g => g.count), 1)
                const progress = (ground.count / maxCount) * 100
                return (
                  <div key={ground.name} className="flex items-center gap-3 py-2.5">
                    <span className="text-[12px] font-bold text-slate-400 w-5 shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-slate-900 dark:text-white truncate">
                        {ground.name}
                      </p>
                      <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/5">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[11px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full shrink-0">
                      {ground.count}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-slate-400 text-[13px]">No data for this period</p>
            </div>
          )}
        </GlassCard>

      </div>

      <DateRangeModal
        open={rangeModalOpen}
        onClose={() => setRangeModalOpen(false)}
        startDate={draftStart} endDate={draftEnd}
        onStartChange={setDraftStart} onEndChange={setDraftEnd}
        onApply={() => {
          setCustomRange({ start: draftStart, end: draftEnd });
          setPeriod("Custom");
          setRangeModalOpen(false)
        }}
      />
    </MobileLayout>
  )
}