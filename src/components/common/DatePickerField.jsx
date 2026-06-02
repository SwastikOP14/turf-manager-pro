import { useState, useCallback } from "react"

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

function formatDisplay(date) {
  if (!date) return null
  const d = String(date.getDate()).padStart(2, "0")
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const y = date.getFullYear()
  return `${d}-${m}-${y}`
}

function isSameDay(a, b) {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isInRange(day, start, end) {
  if (!start || !end) return false
  const t = day.getTime()
  return t > start.getTime() && t < end.getTime()
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay()
}

function DateModal({
  title,
  selected,
  onChange,
  selectsRange,
  startDate,
  endDate,
  onClose
}) {
  const today = new Date()
  const initDate = selected || startDate || today
  const [viewYear, setViewYear] = useState(initDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initDate.getMonth())

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth)

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function handleDayClick(day) {
    const clicked = new Date(viewYear, viewMonth, day)
    onChange(clicked)
  }

  // Build calendar grid cells
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xs rounded-3xl bg-white dark:bg-[#111827] border border-black/10 dark:border-white/10 shadow-2xl p-5 animate-fade-in-up">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-bold text-slate-900 dark:text-white">
            📅 {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold text-green-500 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-green-500/10 transition-colors"
          >
            Done
          </button>
        </div>

        {/* Selected preview */}
        {!selectsRange && selected && (
          <div className="mb-4 py-2.5 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-wide">
              {formatDisplay(selected)}
            </span>
          </div>
        )}
        {selectsRange && (startDate || endDate) && (
          <div className="mb-4 py-2.5 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
              {formatDisplay(startDate) || "?"} → {formatDisplay(endDate) || "?"}
            </span>
          </div>
        )}

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={prevMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer bg-slate-100 dark:bg-white/5 hover:bg-green-500/20 text-slate-700 dark:text-gray-300 font-bold text-lg transition-colors"
          >
            ‹
          </button>

          <span className="font-bold text-slate-900 dark:text-white text-sm">
            {MONTHS[viewMonth]} {viewYear}
          </span>

          <button
            type="button"
            onClick={nextMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer bg-slate-100 dark:bg-white/5 hover:bg-green-500/20 text-slate-700 dark:text-gray-300 font-bold text-lg transition-colors"
          >
            ›
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-bold text-slate-400 dark:text-slate-500 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />

            const thisDate = new Date(viewYear, viewMonth, day)
            const isToday = isSameDay(thisDate, today)
            const isSelected = selectsRange
              ? isSameDay(thisDate, startDate) || isSameDay(thisDate, endDate)
              : isSameDay(thisDate, selected)
            const inRange = selectsRange && isInRange(thisDate, startDate, endDate)

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDayClick(day)}
                className={`
                  h-9 w-full rounded-xl text-sm font-semibold transition-all cursor-pointer
                  ${isSelected
                    ? "bg-green-500 text-white shadow-md"
                    : inRange
                      ? "bg-green-500/20 text-green-700 dark:text-green-300"
                      : isToday
                        ? "border-2 border-green-500 text-green-600 dark:text-green-400 bg-transparent hover:bg-green-500/10"
                        : "text-slate-800 dark:text-gray-200 hover:bg-green-500/15"
                  }
                `}
              >
                {day}
              </button>
            )
          })}
        </div>

      </div>
    </div>
  )
}

export default function DatePickerField({
  label,
  selected,
  onChange,
  selectsRange = false,
  startDate,
  endDate,
  placeholder = "DD-MM-YYYY"
}) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  const displayValue = selectsRange
    ? startDate || endDate
      ? `${formatDisplay(startDate) || "?"} → ${formatDisplay(endDate) || "?"}`
      : null
    : formatDisplay(selected)

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-slate-900 dark:text-white">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="premium-input h-11 w-full flex items-center justify-between gap-2 px-4 text-left cursor-pointer"
      >
        <span className={displayValue ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}>
          {displayValue || placeholder}
        </span>
        <span className="text-lg shrink-0">📅</span>
      </button>

      {open && (
        <DateModal
          title={selectsRange ? "Select Range" : "Select Date"}
          selected={selected}
          onChange={onChange}
          selectsRange={selectsRange}
          startDate={startDate}
          endDate={endDate}
          onClose={close}
        />
      )}
    </div>
  )
}
