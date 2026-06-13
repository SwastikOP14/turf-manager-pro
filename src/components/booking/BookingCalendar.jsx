/**
 * BookingCalendar — always-expanded calendar (no dropdown)
 * ─────────────────────────────────────────────────
 * Props:
 *   bookings  – full bookings array
 *   selected  – "YYYY-MM-DD" | null
 *   onSelect  – (key: string | null) => void
 */

import { useState, useMemo, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"

// ─── constants ───────────────────────────────────────────────────────────────

const DAY_LABELS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const MONTH_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"]

const DOT_COLOR = { Paid: "#34D399", Partial: "#F59E0B", Pending: "#FB7185" }
const DOT_ORDER = ["Paid", "Partial", "Pending"]

// ─── pure helpers ─────────────────────────────────────────────────────────────

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`
}

function addDays(date, n) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d
}

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  d.setHours(0,0,0,0)
  return d
}

function weekDates(mon) {
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i))
}

function monthGrid(year, month) {
  const rows = []
  let cur = startOfWeek(new Date(year, month, 1))
  for (let w = 0; w < 6; w++) {
    rows.push(Array.from({ length: 7 }, (_, i) => addDays(cur, i)))
    cur = addDays(cur, 7)
    if (w >= 3 && rows[w][0].getMonth() > month) break
  }
  return rows
}

/** e.g. "Jun 9 – Jun 15" */
function rangeLabel(rows) {
  const all = rows.flat()
  const first = all[0], last = all[all.length - 1]
  if (first.getMonth() === last.getMonth()) {
    return `${MONTH_SHORT[first.getMonth()]} ${first.getDate()} – ${last.getDate()}`
  }
  return `${MONTH_SHORT[first.getMonth()]} ${first.getDate()} – ${MONTH_SHORT[last.getMonth()]} ${last.getDate()}`
}

// ─── DayCell ─────────────────────────────────────────────────────────────────

function DayCell({ date, inMonth = true, isToday, isSelected, dots, onTap }) {
  return (
    <button
      type="button"
      onClick={() => onTap(toKey(date))}
      className="flex flex-col items-center gap-[2px] py-1 rounded-xl transition-all active:scale-95 select-none"
      style={{
        flex: 1, minWidth: 0,
        background: isSelected ? "#22c55e"
          : isToday ? "rgba(34,197,94,0.12)"
          : "transparent",
        outline: isToday && !isSelected ? "1.5px solid #22c55e" : "none",
        outlineOffset: "-1px",
        opacity: inMonth ? 1 : 0.25,
      }}
    >
      <span className="text-[13px] font-bold leading-tight"
        style={{ color: isSelected ? "#000" : undefined }}>
        {date.getDate()}
      </span>
      <div className="flex gap-[2px] h-[5px] items-center">
        {dots.length === 0
          ? <span className="w-[5px] h-[5px]" />
          : dots.map(s => (
              <span key={s} className="w-[5px] h-[5px] rounded-full shrink-0"
                style={{ background: DOT_COLOR[s] }} />
            ))
        }
      </div>
    </button>
  )
}

// ─── main ────────────────────────────────────────────────────────────────────

export default function BookingCalendar({ bookings = [], selected, onSelect }) {
  const [view,        setView]        = useState("Weekly")
  const [anchor,      setAnchor]      = useState(() => startOfWeek(new Date()))
  const [monthAnchor, setMonthAnchor] = useState(() => {
    const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() }
  })

  const today = toKey(new Date())

  // dot map
  const dotMap = useMemo(() => {
    const raw = {}
    bookings.forEach(b => {
      if (!b.date) return
      if (!raw[b.date]) raw[b.date] = new Set()
      raw[b.date].add(b.status || "Pending")
    })
    const result = {}
    for (const [k, set] of Object.entries(raw)) {
      result[k] = DOT_ORDER.filter(s => set.has(s))
    }
    return result
  }, [bookings])

  // week rows
  const weekRows = useMemo(() => {
    if (view === "Weekly")    return [weekDates(anchor)]
    if (view === "Bi-Weekly") return [weekDates(anchor), weekDates(addDays(anchor, 7))]
    return monthGrid(monthAnchor.year, monthAnchor.month)
  }, [view, anchor, monthAnchor])

  // title inside calendar
  const calTitle = useMemo(() => {
    if (view === "Monthly") return `${MONTH_FULL[monthAnchor.month]} ${monthAnchor.year}`
    const mid = weekRows[Math.floor(weekRows.length / 2)][3]
    return `${MONTH_FULL[mid.getMonth()]} ${mid.getFullYear()}`
  }, [view, weekRows, monthAnchor])

  // summary for the header bar (preview dots + counts for visible range)
  const headerSummary = useMemo(() => {
    const allKeys = weekRows.flat().map(d => toKey(d))
    const counts = { Paid: 0, Partial: 0, Pending: 0 }
    bookings.forEach(b => {
      if (allKeys.includes(b.date) && b.status) {
        counts[b.status] = (counts[b.status] || 0) + 1
      }
    })
    return counts
  }, [bookings, weekRows])

  // header date label
  const headerLabel = useMemo(() => {
    if (view === "Monthly")
      return `${MONTH_FULL[monthAnchor.month]} ${monthAnchor.year}`
    return rangeLabel(weekRows)
  }, [view, weekRows, monthAnchor])

  const navigate = dir => {
    if (view === "Monthly") {
      setMonthAnchor(prev => {
        let m = prev.month + dir, y = prev.year
        if (m > 11) { m = 0; y++ }
        if (m < 0)  { m = 11; y-- }
        return { year: y, month: m }
      })
    } else {
      setAnchor(a => addDays(a, dir * (view === "Bi-Weekly" ? 14 : 7)))
    }
  }

  const currentMonth = view === "Monthly" ? monthAnchor.month : undefined

  const handleDayTap = key => onSelect(key === selected ? null : key)

  const handleViewChange = v => {
    setView(v)
    if (v !== "Monthly") {
      const base = selected ? new Date(selected + "T00:00:00") : new Date()
      setAnchor(startOfWeek(base))
    }
  }

  return (
    <div className="premium-card overflow-hidden">

      {/* ── View toggle tabs + navigation ──────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 space-y-3">

        {/* View toggle tabs */}
        <div className="flex rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 p-1 gap-1">
          {["Weekly", "Bi-Weekly", "Monthly"].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => handleViewChange(t)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: view === t ? "#22c55e" : "transparent",
                color:      view === t ? "#000"    : undefined,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Period title + prev/next */}
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/8 active:scale-95">
            <ChevronLeft size={15} className="text-slate-600 dark:text-slate-300" />
          </button>
          <span className="text-[14px] font-bold text-slate-900 dark:text-white">{calTitle}</span>
          <button type="button" onClick={() => navigate(1)}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/8 active:scale-95">
            <ChevronRight size={15} className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Day labels */}
        <div className="flex gap-1">
          {DAY_LABELS.map(d => (
            <span key={d} className="flex-1 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-1">
          {weekRows.map((row, i) => (
            <div key={i} className="flex gap-1">
              {row.map(date => {
                const key = toKey(date)
                return (
                  <DayCell
                    key={key}
                    date={date}
                    inMonth={currentMonth === undefined || date.getMonth() === currentMonth}
                    isToday={key === today}
                    isSelected={key === selected}
                    dots={dotMap[key] || []}
                    onTap={handleDayTap}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 pt-0.5">
          {DOT_ORDER.map(s => (
            <div key={s} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: DOT_COLOR[s] }} />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {s === "Pending" ? "Unpaid" : s}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
