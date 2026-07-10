import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Trash2, X, Edit } from "lucide-react"
import ConfirmDialog from "../../components/common/ConfirmDialog"
import MobileLayout from "../../components/layout/MobileLayout"
import BookingPeriodTabs from "../../components/booking/BookingPeriodTabs"
import BookingFilterMenu from "../../components/booking/BookingFilterMenu"
import BookingCard from "../../components/booking/BookingCard"
import BookingCalendar from "../../components/booking/BookingCalendar"
import DateRangeModal from "../../components/booking/DateRangeModal"
import EditBookingSheet from "../../components/booking/EditBookingSheet"
import { useApp } from "../../context/useApp"
import { useHaptics } from "../../context/HapticsContext"
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
  const navigate = useNavigate()
  const { bookings, getTurfById, getSportById, deleteBooking, updateBooking } = useApp()
  const haptics = useHaptics()

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
  const [editMode, setEditMode]           = useState(false)

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
    setEditMode(false)
  }

  const enterSelectMode = (id) => { 
    haptics.trigger(8)
    setSelectMode(true)
    setSelectedIds(new Set([id]))
  }

  const toggleSelect = (id) => {
    haptics.trigger(8)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => setSelectedIds(new Set(filteredBookings.map((b) => b.id)))
  const allSelected = filteredBookings.length > 0 && filteredBookings.every((b) => selectedIds.has(b.id))

  const handleDeleteConfirmed = () => {
    haptics.trigger([15, 50, 15])
    selectedIds.forEach((id) => deleteBooking(id))
    exitSelectMode()
  }

  const handleEditBooking = () => {
    if (selectedIds.size !== 1) return
    setEditMode(true)
  }

  const handleSaveEdit = (bookingId, updates) => {
    updateBooking(bookingId, updates)
    haptics.trigger([10, 30, 10])
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
    <MobileLayout onFabClick={() => navigate("/booking/new")}>
      <div className="pt-3 px-4 pb-24 space-y-3 animate-fade-in-up">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 dark:text-white leading-tight">Bookings</h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Manage your turf sessions</p>
          </div>
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
              onClick={() => { haptics.trigger(10); setSelectedDate(null); }}
              className="text-[11px] font-bold text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full hover:bg-red-500/20 active:scale-95 transition-all"
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
            filterMenu={
              !selectMode && (
                <BookingFilterMenu activeStatuses={statusFilters} onToggle={toggleStatus} />
              )
            }
          />
        )}

        {/* ── Booking list ─────────────────────────────────────────────── */}
        <div className="space-y-3.5">
          {(selectedDate ? calendarDayBookings : filteredBookings).map(renderBookingCard)}

          {(selectedDate ? calendarDayBookings : filteredBookings).length === 0 && (
            <div className="flex flex-col items-center text-center py-12 px-6 gap-3.5">
              <svg width="48" height="48" viewBox="0 0 72 72" fill="none" className="text-slate-300 dark:text-slate-600">
                <rect x="12" y="8" width="48" height="56" rx="10" fill="currentColor" fillOpacity="0.2" />
                <rect x="20" y="20" width="32" height="4" rx="2" fill="currentColor" fillOpacity="0.5" />
                <rect x="20" y="30" width="24" height="4" rx="2" fill="currentColor" fillOpacity="0.35" />
                <rect x="20" y="40" width="28" height="4" rx="2" fill="currentColor" fillOpacity="0.25" />
                <circle cx="52" cy="54" r="12" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
                <text x="52" y="59" textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor" fillOpacity="0.6">?</text>
              </svg>
              <div>
                <p className="text-[16px] font-bold text-slate-900 dark:text-white">
                  {selectedDate ? "No bookings on this date" : "No bookings yet"}
                </p>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5">
                  {selectedDate ? "Try selecting a different date" : "Tap + to add your first booking"}
                </p>
              </div>
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
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)" }}
        >
          <div
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl"
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
              {selectedIds.size}
            </span>
            
            {selectedIds.size === 1 && (
              <button type="button"
                onClick={() => { haptics.trigger(10); handleEditBooking(); }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-white/30 text-white text-sm font-semibold shrink-0 active:scale-95">
                <Edit size={14} />
                Edit
              </button>
            )}
            
            <button type="button"
              onClick={() => selectedIds.size > 0 && setConfirmDelete(true)}
              disabled={selectedIds.size === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-[14px] shrink-0 active:scale-95 disabled:opacity-40">
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ── Delete confirmation ─────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete Bookings?"
        message={`You are about to permanently delete ${selectedIds.size} booking record${selectedIds.size !== 1 ? "s" : ""}.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(false)}
      />

      {/* ── Edit Booking Sheet ────────────────────────────────────────────── */}
      {editMode && selectedIds.size === 1 && (
        <EditBookingSheet
          booking={bookings.find(b => b.id === Array.from(selectedIds)[0])}
          onSave={(updates) => {
            handleSaveEdit(Array.from(selectedIds)[0], updates)
            exitSelectMode()
          }}
          onClose={() => setEditMode(false)}
        />
      )}
    </MobileLayout>
  )
}
