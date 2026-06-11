import { useMemo, useState } from "react"
import { Trash2, X, CheckSquare } from "lucide-react"

import MobileLayout from "../../components/layout/MobileLayout"
import BookingPeriodTabs from "../../components/booking/BookingPeriodTabs"
import BookingFilterMenu from "../../components/booking/BookingFilterMenu"
import BookingCard from "../../components/booking/BookingCard"
import DateRangeModal from "../../components/booking/DateRangeModal"
import { useApp } from "../../context/useApp"
import { filterBookingsByPeriod } from "../../utils/dates"
import { useModalBackHandler } from "../../hooks/useModalBackHandler"

const PERIODS = ["All", "This Week", "This Month", "This Year", "Custom"]

export default function Bookings() {
  const { bookings, getTurfById, getSportById, deleteBooking } = useApp()

  const [period, setPeriod]               = useState("All")
  const [statusFilters, setStatusFilters] = useState([])
  const [customRange, setCustomRange]     = useState({ start: null, end: null })
  const [rangeModalOpen, setRangeModalOpen] = useState(false)
  const [draftStart, setDraftStart]       = useState(null)
  const [draftEnd, setDraftEnd]           = useState(null)

  // ── Multi-select ─────────────────────────────────────────────────────────
  const [selectMode, setSelectMode]       = useState(false)
  const [selectedIds, setSelectedIds]     = useState(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)

  useModalBackHandler(selectMode ? exitSelectMode : null)

  // ── Counts + filtered list ────────────────────────────────────────────────
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
    if (statusFilters.length) {
      list = list.filter((b) => statusFilters.includes(b.status))
    }
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [bookings, period, customRange, statusFilters])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toggleStatus = (status) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  function exitSelectMode() {
    setSelectMode(false)
    setSelectedIds(new Set())
    setConfirmDelete(false)
  }

  const enterSelectMode = (id) => {
    setSelectMode(true)
    setSelectedIds(new Set([id]))
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => setSelectedIds(new Set(filteredBookings.map((b) => b.id)))

  const allSelected =
    filteredBookings.length > 0 &&
    filteredBookings.every((b) => selectedIds.has(b.id))

  const handleDeleteConfirmed = () => {
    selectedIds.forEach((id) => deleteBooking(id))
    exitSelectMode()
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <MobileLayout>
      <div className="pt-2 px-5 pb-5 space-y-4 animate-fade-in-up">

        {/* Title */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bookings</h1>
            <p className="text-[14px] text-slate-500 dark:text-gray-400 mt-1.5">
              Premium turf booking dashboard
            </p>
          </div>
          {!selectMode && (
            <BookingFilterMenu activeStatuses={statusFilters} onToggle={toggleStatus} />
          )}
        </div>

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

        {/* Booking list */}
        <div className="space-y-3.5">
          {filteredBookings.map((booking) => {
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
          })}

          {!filteredBookings.length && (
            <div className="premium-card p-8 text-center text-slate-500 dark:text-gray-400">
              No bookings found for this filter.
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

      {/* ── Floating select-mode action bar ─────────────────────────────────
           Sits fixed above the bottom nav bar so it's always reachable.
      ─────────────────────────────────────────────────────────────────────── */}
      {selectMode && (
        <div
          className="fixed left-0 right-0 z-99998 flex items-center justify-center px-5"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 4.5rem)" }}
        >
          <div
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
            style={{
              background:    "rgba(10,16,30,0.96)",
              backdropFilter:"blur(18px)",
              border:        "1px solid rgba(255,255,255,0.12)",
              maxWidth:      "28rem",
            }}
          >
            {/* Cancel */}
            <button
              type="button"
              onClick={exitSelectMode}
              className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 active:scale-95"
            >
              <X size={17} className="text-white" />
            </button>

            {/* Count */}
            <span className="text-white font-bold text-[15px] flex-1 select-none">
              {selectedIds.size} selected
            </span>

            {/* Select all / none */}
            <button
              type="button"
              onClick={allSelected ? () => setSelectedIds(new Set()) : selectAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold shrink-0 active:scale-95"
            >
              <CheckSquare size={13} />
              {allSelected ? "None" : "All"}
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => selectedIds.size > 0 && setConfirmDelete(true)}
              disabled={selectedIds.size === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm shrink-0 active:scale-95 transition-all disabled:opacity-40"
              style={{ background: "#ef4444", color: "#fff" }}
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ── Delete confirmation bottom sheet ─────────────────────────────── */}
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
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-3.5 rounded-2xl border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold text-[15px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-bold text-[15px] flex items-center justify-center gap-2"
              >
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
