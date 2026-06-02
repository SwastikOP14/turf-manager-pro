import { useState, useCallback } from "react"

const HOURS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
)
const MINUTES = ["00", "15", "30", "45"]

function TimeDisplay({ hour, minute, period, placeholder }) {
  if (!hour || !minute) {
    return (
      <span className="text-slate-400 dark:text-slate-500 text-sm">
        {placeholder}
      </span>
    )
  }
  return (
    <span className="text-slate-900 dark:text-white font-semibold text-sm">
      {hour}:{minute} <span className="text-green-500">{period}</span>
    </span>
  )
}

function TimeModal({ title, onClose, hour, minute, period, onHourChange, onMinuteChange, onPeriodChange }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
      {/* Backdrop close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-xs rounded-3xl bg-white dark:bg-[#111827] border border-black/10 dark:border-white/10 shadow-2xl p-5 animate-fade-in-up">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-bold text-slate-900 dark:text-white">
            🕒 {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold text-green-500 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-green-500/10 transition-colors"
          >
            Done
          </button>
        </div>

        {/* Preview */}
        <div className="mb-4 py-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
          <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide">
            {hour || "--"}:{minute || "--"}
          </span>
          <span className="text-2xl font-bold text-green-500 ml-2">{period}</span>
        </div>

        {/* AM / PM */}
        <div className="flex rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 mb-5">
          {["AM", "PM"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriodChange(p)}
              className={`
                flex-1 py-2.5 text-sm font-bold transition-all cursor-pointer
                ${period === p
                  ? "bg-green-500 text-white"
                  : "text-slate-500 dark:text-gray-400 hover:bg-green-500/10"
                }
              `}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Hour & Minute grids */}
        <div className="flex gap-4">
          <div className="flex-1">
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-2.5 font-semibold uppercase tracking-wide">
              Hour
            </p>
            <div className="grid grid-cols-3 gap-2">
              {HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => onHourChange(h)}
                  className={`
                    py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer
                    ${hour === h
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:bg-green-500/20"
                    }
                  `}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px bg-black/10 dark:bg-white/10 self-stretch" />

          <div className="flex-1">
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-2.5 font-semibold uppercase tracking-wide">
              Min
            </p>
            <div className="grid grid-cols-2 gap-2">
              {MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onMinuteChange(m)}
                  className={`
                    py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer
                    ${minute === m
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:bg-green-500/20"
                    }
                  `}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Single Time Mode (AddBalanceModal) ──────────────────────────────────────
function SingleTimePicker({ label, hour, minute, period, onHourChange, onMinuteChange, onPeriodChange }) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-slate-900 dark:text-white">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="premium-input w-full flex items-center justify-between gap-2 px-4 py-3 cursor-pointer"
      >
        <TimeDisplay hour={hour} minute={minute} period={period} placeholder="--:-- --" />
        <span className="text-base shrink-0">🕒</span>
      </button>

      {open && (
        <TimeModal
          title="Pick Time"
          onClose={close}
          hour={hour} minute={minute} period={period}
          onHourChange={onHourChange}
          onMinuteChange={onMinuteChange}
          onPeriodChange={onPeriodChange}
        />
      )}
    </div>
  )
}

// ─── Dual Time Mode (BookingForm) ────────────────────────────────────────────
function DualTimePicker({
  label,
  startHour, startMinute, startPeriod,
  onStartHourChange, onStartMinuteChange, onStartPeriodChange,
  endHour, endMinute, endPeriod,
  onEndHourChange, onEndMinuteChange, onEndPeriodChange
}) {
  const [openPicker, setOpenPicker] = useState(null) // "start" | "end" | null
  const close = useCallback(() => setOpenPicker(null), [])

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-slate-900 dark:text-white">{label}</label>
      )}

      <div className="flex items-center gap-2">
        {/* Start */}
        <button
          type="button"
          onClick={() => setOpenPicker("start")}
          className="premium-input flex-1 flex items-center justify-between gap-1.5 px-3 py-3 cursor-pointer"
        >
          <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 font-medium">Start</span>
          <TimeDisplay hour={startHour} minute={startMinute} period={startPeriod} placeholder="--:-- --" />
          <span className="text-sm shrink-0">🕐</span>
        </button>

        <span className="text-slate-400 dark:text-slate-500 font-bold text-sm shrink-0">→</span>

        {/* End */}
        <button
          type="button"
          onClick={() => setOpenPicker("end")}
          className="premium-input flex-1 flex items-center justify-between gap-1.5 px-3 py-3 cursor-pointer"
        >
          <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 font-medium">End</span>
          <TimeDisplay hour={endHour} minute={endMinute} period={endPeriod} placeholder="--:-- --" />
          <span className="text-sm shrink-0">🕑</span>
        </button>
      </div>

      {openPicker === "start" && (
        <TimeModal
          title="Start Time"
          onClose={close}
          hour={startHour} minute={startMinute} period={startPeriod}
          onHourChange={onStartHourChange}
          onMinuteChange={onStartMinuteChange}
          onPeriodChange={onStartPeriodChange}
        />
      )}

      {openPicker === "end" && (
        <TimeModal
          title="End Time"
          onClose={close}
          hour={endHour} minute={endMinute} period={endPeriod}
          onHourChange={onEndHourChange}
          onMinuteChange={onEndMinuteChange}
          onPeriodChange={onEndPeriodChange}
        />
      )}
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function TimePickerField(props) {
  if ("startHour" in props) return <DualTimePicker {...props} />
  return <SingleTimePicker {...props} />
}
