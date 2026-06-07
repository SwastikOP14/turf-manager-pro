import { useMemo, useState } from "react"

import MobileLayout from "../../components/layout/MobileLayout"
import BookingPeriodTabs from "../../components/booking/BookingPeriodTabs"
import BookingFilterMenu from "../../components/booking/BookingFilterMenu"
import BookingCard from "../../components/booking/BookingCard"
import DateRangeModal from "../../components/booking/DateRangeModal"
import { useApp } from "../../context/useApp"
import { filterBookingsByPeriod } from "../../utils/dates"

const PERIODS = [
  "All",
  "This Week",
  "This Month",
  "This Year",
  "Custom"
]

export default function Bookings() {
  const { bookings, getTurfById, getSportById } = useApp()

  const [period, setPeriod] = useState("All")
  const [statusFilters, setStatusFilters] = useState([])
  const [customRange, setCustomRange] = useState({ start: null, end: null })
  const [rangeModalOpen, setRangeModalOpen] = useState(false)
  const [draftStart, setDraftStart] = useState(null)
  const [draftEnd, setDraftEnd] = useState(null)

  const counts = useMemo(() => {
    const result = {}

    PERIODS.forEach((item) => {
      if (item === "Custom") {
        result[item] = filterBookingsByPeriod(
          bookings,
          "Custom",
          customRange
        ).length
        return
      }

      result[item] = filterBookingsByPeriod(bookings, item).length
    })

    return result
  }, [bookings, customRange])

  const filteredBookings = useMemo(() => {
    let list = filterBookingsByPeriod(
      bookings,
      period,
      customRange
    )

    if (statusFilters.length) {
      list = list.filter((booking) =>
        statusFilters.includes(booking.status)
      )
    }

    return [...list].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )
  }, [bookings, period, customRange, statusFilters])

  const toggleStatus = (status) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status]
    )
  }

  return (
    <MobileLayout>
      <div className="pt-2 px-5 pb-5 space-y-4 animate-fade-in-up">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Bookings
            </h1>
            <p className="text-[14px] text-slate-500 dark:text-gray-400 mt-1.5">
              Premium turf booking dashboard
            </p>
          </div>

          <BookingFilterMenu
            activeStatuses={statusFilters}
            onToggle={toggleStatus}
          />
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

        <div className="space-y-3.5">
          {filteredBookings.map((booking) => {
            const turf = getTurfById(booking.turfId)
            const sport = getSportById(booking.sportId)

            return (
              <BookingCard
                key={booking.id}
                booking={booking}
                turfName={turf?.name || "Unknown Turf"}
                sportName={sport?.name || "Sport"}
                sportId={sport?.id}
                sport={sport}
              />
            )
          })}

          {!filteredBookings.length && (
            <div className="
              premium-card p-8 text-center
              text-slate-500 dark:text-gray-400
            ">
              No bookings found for this filter.
            </div>
          )}
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
