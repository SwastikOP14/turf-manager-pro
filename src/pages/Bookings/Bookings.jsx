import { useMemo, useState } from "react"
import { Trash2, X, CheckSquare } from "lucide-react"

import MobileLayout from "../../components/layout/MobileLayout"
import BookingPeriodTabs from "../../components/booking/BookingPeriodTabs"
import BookingFilterMenu from "../../components/booking/BookingFilterMenu"
import BookingCard from "../../components/booking/BookingCard"
import BookingCalendar from "../../components/booking/BookingCalendar"
import DateRangeModal from "../../components/booking/DateRangeModal"
import { useApp } from "../../context/useApp"
import { filterBookingsByPeriod } from "../../utils/dates"
import { useModalBackHandler } from "../../hooks/useModalBackHandler"

const PERIODS = ["All", "This Week", "This Month", "This Year", "Custom"]
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function fmtSelectedDate(key) {
  if (!key) return null
  const [, m, d] = key.split("-")
  return `${d} ${MONTH_SHORT[Number(m) - 1]}`
}

export default function Bookings() {
  const { bookings, getTurfById, getSportById, deleteBooking } = useApp()

  // ── List mode state ────────────────────────────────────────────────────
  const [period, setPeriod]               = useState("All")
  const [statusFilters, setStatusFilters] = useState([])
  const [customRange, setCustomRange]     = useState({ start: null, end: null })
  const [rangeModalOpen, setRangeModalOpen] = useState(false)
  const [draftStart, setDraftStart]       = useState(null)
  const [draftEnd, setDraftEnd]           = useState(null)

  // ── Calendar date selection ────────────────────────────────────────────
  const [selectedDate, setSelectedDate]   = useState(null)

  // ── Multi-select ────────────────────────────────────────────────────────
  const [selectMode, setSelectMode]       = useState(false)
  const [selectedIds, setSelectedIds]     = useState(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)

  useModalBackHandler(selectMode ? exitSelectMode : null)

  // ── Derived data ────────────────────────────────────────────────────────

  const counts = useMemo(() => {
    const result = {}
    PERIODS.forEach((item) => {
      result[item] = item === "Custom"
        ? filterBookingsByPeriod(bookings, "Custom", customRange).length
        : filterBookingsByPeriod(bookings, item).length
    })
    return result
  }, [bookings, customRange])

  const filteredBookings = useMemo(() => {
    let list = filterBookingsByPeriod(bookings, period, customRange)
    if (statusFilters.length) list = list.filter((b) => statusFilters.includes(b.status))
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [bookings, period, customRange, statusFilters])

  // Bookings on the selected calendar date
  const calendarDayBookings = useMemo(() => {
    if (!selectedDate) return []
    return bookings
      .filter((b) => b.date === selectedDate)
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
  }, [bookings, selectedDate])

  // ── Helpers ─────────────────────────────────────────────────────────────

  const toggleStatus = (s) =>
    setStatusFilters((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])

  function exitSelectMode() {
    setSelectMode(false)
    setSelectedIds(new Set())
    setConfirmDelete(false)
  }

  const enterSelectMode = (id) => { setSelectMode(true); setSelectedIds(new Set([id])) }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => setSelectedIds(new Set(filteredBookings.map((b) => b.id)))
  const allSelected = filteredBookings.length > 0 && filteredBookings.every((b) => selectedIds.has(b.id))

  const handleDeleteConfirmed = () => {
    selectedIds.forEach((id) => deleteBooking(id))
    exitSelectMode()
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  const renderBookingCard = (booking) => {
    const turf  = getTurfById(booking.turfId)
    const sport = getSportById(booking.sportId)
    return (
      <BookingCard
        key={booking.id}
        booking={booking}
        turfName={turf?.name || "Unknown Turf"}
        sportName={sport?.name || "Sport"}
        sportId={sport?.id}
        sport={sport}
        selectMode={selectMode}
        selected={selectedIds.has(booking.id)}
        onSelect={toggleSelect}
        onLongPress={enterSelectMode}
      />
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <MobileLayout>
      <div className="pt-2 px-5 pb-5 space-y-4 animate-fade-in-up">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--brand)", letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long" })}
            </p>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", margin: "2px 0 0", lineHeight: 1.1 }}>
              {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0" }}>
              Premium turf dashboard
            </p>
          </div>
          {!selectMode && (
            <BookingFilterMenu activeStatuses={statusFilters} onToggle={toggleStatus} />
          )}
        </div>

        {/* ── Collapsible calendar dropdown ────────────────────────────── */}
        <BookingCalendar
          bookings={bookings}
          selected={selectedDate}
          onSelect={setSelectedDate}
        />

        {/* ── Selected date heading (always visible) ────────────────────── */}
        {selectedDate ? (
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {fmtSelectedDate(selectedDate)}
              <span className="ml-2 text-green-600 dark:text-green-400">
                — {calendarDayBookings.length} booking{calendarDayBookings.length !== 1 ? "s" : ""}
              </span>
            </p>
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-white font-medium"
            >
              Clear ×
            </button>
          </div>
        ) : (
          /* Period tabs — shown when no calendar date selected */
          <BookingPeriodTabs
            activePeriod={period}
            onChange={setPeriod}
            counts={counts}
            onCustomClick={() => {
              setDraftStart(customRange.start)
              setDraftEnd(customRange.end)
              setRangeModalOpen(true)
            }}
          />
        )}

        {/* ── Booking list ─────────────────────────────────────────────── */}
        <div className="space-y-3.5">
          {(selectedDate ? calendarDayBookings : filteredBookings).map(renderBookingCard)}

          {(selectedDate ? calendarDayBookings : filteredBookings).length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "48px 24px", gap: "14px" }}>
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                <rect x="12" y="8" width="48" height="56" rx="10" fill="var(--brand-subtle)" />
                <rect x="20" y="20" width="32" height="4" rx="2" fill="var(--brand)" opacity="0.5" />
                <rect x="20" y="30" width="24" height="4" rx="2" fill="var(--brand)" opacity="0.35" />
                <rect x="20" y="40" width="28" height="4" rx="2" fill="var(--brand)" opacity="0.25" />
                <circle cx="52" cy="54" r="12" fill="var(--bg-card)" stroke="var(--bg-border)" strokeWidth="1.5" />
                <text x="52" y="59" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text-muted)">?</text>
              </svg>
              <div>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  {selectedDate ? "No bookings on this date" : "No bookings yet"}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "6px 0 0" }}>
                  {selectedDate ? "Try selecting a different date" : "Tap + to add your first booking"}
                </p>
              </div>
              {!selectedDate && (
                <button
                  type="button"
                  onClick={() => {}}
                  className="btn-primary"
                  style={{ width: "auto", padding: "0 24px", fontSize: "13px" }}
                >
                  Add Booking
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Date range modal ─────────────────────────────────────────────── */}
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

      {/* ── Floating select-mode bar ──────────────────────────────────────── */}
      {selectMode && (
        <div
          className="fixed left-0 right-0 z-99998 flex items-center justify-center px-5"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 4.5rem)" }}
        >
          <div
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
            style={{
              background:     "rgba(10,16,30,0.96)",
              backdropFilter: "blur(18px)",
              border:         "1px solid rgba(255,255,255,0.12)",
              maxWidth:       "28rem",
            }}
          >
            <button type="button" onClick={exitSelectMode}
              className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 active:scale-95">
              <X size={17} className="text-white" />
            </button>
            <span className="text-white font-bold text-[15px] flex-1 select-none">
              {selectedIds.size} selected
            </span>
            <button type="button"
              onClick={allSelected ? () => setSelectedIds(new Set()) : selectAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold shrink-0 active:scale-95">
              <CheckSquare size={13} />
              {allSelected ? "None" : "All"}
            </button>
            <button type="button"
              onClick={() => selectedIds.size > 0 && setConfirmDelete(true)}
              disabled={selectedIds.size === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm shrink-0 active:scale-95 disabled:opacity-40"
              style={{ background: "#ef4444", color: "#fff" }}>
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ── Delete confirmation sheet ─────────────────────────────────────── */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-99999 flex items-end"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="w-full bg-white dark:bg-[#0f172a] rounded-t-3xl px-5 pt-5 pb-8 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-500/15 flex items-center justify-center shrink-0">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-slate-900 dark:text-white">
                  Delete {selectedIds.size} booking{selectedIds.size !== 1 ? "s" : ""}?
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  This cannot be undone. Player balances will be recalculated.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setConfirmDelete(false)}
                className="flex-1 py-3.5 rounded-2xl border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold text-[15px]">
                Cancel
              </button>
              <button type="button" onClick={handleDeleteConfirmed}
                className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-bold text-[15px] flex items-center justify-center gap-2">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  )
}
