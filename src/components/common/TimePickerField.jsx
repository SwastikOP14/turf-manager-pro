import { useState, useCallback, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useModalBackHandler } from "../../hooks/useModalBackHandler"
import { useHaptics } from "../../context/HapticsContext"

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))
const PERIODS = ["AM", "PM"]

const DURATION_PRESETS = [1, 1.5, 2, 2.5, 3, 3.5, 4]

function ScrollColumn({ items, selected, onSelect, width = "w-16" }) {
  const haptics = useHaptics()
  const containerRef = useRef(null)
  const itemHeight = 48

  useEffect(() => {
    const idx = items.indexOf(selected)
    if (containerRef.current && idx !== -1) {
      containerRef.current.scrollTop = idx * itemHeight
    }
  }, [selected, items])

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const idx = Math.round(containerRef.current.scrollTop / itemHeight)
    const clamped = Math.max(0, Math.min(idx, items.length - 1))
    if (items[clamped] !== selected) onSelect(items[clamped])
  }, [items, selected, onSelect])

  return (
    <div className={`relative ${width} shrink-0`} style={{ height: "192px" }}>
      <div className="absolute left-0 right-0 pointer-events-none rounded-xl bg-green-500/10 border border-green-500/20"
        style={{ top: "72px", height: `${itemHeight}px`, zIndex: 1 }} />
      <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10"
        style={{ background: "linear-gradient(to bottom, var(--bg-card, white) 0%, transparent 100%)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10"
        style={{ background: "linear-gradient(to top, var(--bg-card, white) 0%, transparent 100%)" }} />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scrollbar-hide"
        style={{ scrollSnapType: "y mandatory", paddingTop: "72px", paddingBottom: "72px" }}
      >
        {items.map((item) => (
          <div
            key={item}
            onClick={() => { haptics.trigger(10); onSelect(item) }}
            style={{ height: `${itemHeight}px`, scrollSnapAlign: "center" }}
            className={`flex items-center justify-center cursor-pointer text-xl font-bold transition-all
              ${item === selected
                ? "text-slate-900 dark:text-white scale-110"
                : "text-slate-400 dark:text-slate-600 scale-90"
              }`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

function TimeModal({ title, onClose, hour, minute, period, onHourChange, onMinuteChange, onPeriodChange }) {
  useEffect(() => {
    document.body.classList.add("modal-open")
    return () => document.body.classList.remove("modal-open")
  }, [])

  useModalBackHandler(onClose)

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-md px-6">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-xs rounded-3xl bg-white dark:bg-[#111827] border border-black/10 dark:border-white/10 shadow-2xl p-5 animate-fade-in-up">

        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {title}
          </span>
          <button type="button" onClick={onClose}
            className="text-sm font-bold text-green-700 dark:text-green-400 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-green-500/10 transition-colors">
            Done
          </button>
        </div>

        <div className="mb-5 py-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
          <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide">
            {hour || "--"}:{minute || "--"}
          </span>
          <span className="text-2xl font-bold text-green-700 dark:text-green-400 ml-2">{period}</span>
        </div>

        <div className="flex items-center justify-center gap-2">
          <ScrollColumn items={HOURS} selected={hour} onSelect={onHourChange} width="w-16" />
          <span className="text-2xl font-bold text-slate-400 dark:text-slate-500 mb-1">:</span>
          <ScrollColumn items={MINUTES} selected={minute} onSelect={onMinuteChange} width="w-16" />
          <div className="w-px h-32 bg-black/10 dark:bg-white/10 mx-1" />
          <ScrollColumn items={PERIODS} selected={period} onSelect={onPeriodChange} width="w-14" />
        </div>

      </div>
    </div>,
    document.body
  )
}

function DurationModal({ onClose, durationHours, onSelect }) {
  const haptics = useHaptics()
  const [customValue, setCustomValue] = useState("")

  useEffect(() => {
    document.body.classList.add("modal-open")
    return () => document.body.classList.remove("modal-open")
  }, [])

  useModalBackHandler(onClose)

  const formatLabel = (h) => {
    if (h === 1) return "1 hour"
    return `${h} hours`
  }

  const handleCustomSet = () => {
    const parsed = Number(customValue)
    if (!parsed || parsed <= 0) return
    haptics.trigger(10)
    onSelect(parsed)
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-md px-6">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-xs rounded-3xl bg-white dark:bg-[#111827] border border-black/10 dark:border-white/10 shadow-2xl p-5 animate-fade-in-up space-y-3">

        {DURATION_PRESETS.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => { haptics.trigger(10); onSelect(h); onClose() }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors
              ${durationHours === h
                ? "bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30"
                : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200"
              }`}
          >
            {formatLabel(h)}
          </button>
        ))}

        <div className="pt-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
            Custom
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="e.g. 2.5"
              className="flex-1 premium-input px-4 py-3 text-sm"
            />
            <button
              type="button"
              onClick={handleCustomSet}
              className="px-5 py-3 rounded-xl bg-green-500 text-black font-bold text-sm shrink-0"
            >
              Set
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  )
}

function SingleTimePicker({ label, hour, minute, period, onHourChange, onMinuteChange, onPeriodChange }) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</label>}
      <button type="button" onClick={() => setOpen(true)}
        className="premium-input w-full flex items-center justify-between gap-2 px-4 py-3 cursor-pointer">
        <span className={hour && minute ? "text-slate-900 dark:text-white font-semibold text-sm" : "text-slate-400 dark:text-slate-500 text-sm"}>
          {hour && minute ? `${hour}:${minute} ${period}` : "--:-- --"}
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      </button>
      {open && <TimeModal title="Pick Time" onClose={close}
        hour={hour} minute={minute} period={period}
        onHourChange={onHourChange} onMinuteChange={onMinuteChange} onPeriodChange={onPeriodChange} />}
    </div>
  )
}

// Computes end time fields from start time + duration (in hours, can be fractional like 1.5)
function computeEndFromDuration(startHour, startMinute, startPeriod, durationHours) {
  if (!startHour || !startMinute || !durationHours) return null

  let h24 = parseInt(startHour, 10) % 12
  if (startPeriod === "PM") h24 += 12

  const totalStartMinutes = h24 * 60 + parseInt(startMinute, 10)
  const totalEndMinutes = (totalStartMinutes + Math.round(durationHours * 60)) % (24 * 60)

  let endH24 = Math.floor(totalEndMinutes / 60)
  const endMin = totalEndMinutes % 60

  const endPeriod = endH24 >= 12 ? "PM" : "AM"
  let endH12 = endH24 % 12
  if (endH12 === 0) endH12 = 12

  return {
    hour: String(endH12).padStart(2, "0"),
    minute: String(endMin).padStart(2, "0"),
    period: endPeriod,
  }
}

function DualTimePicker({
  label,
  startHour, startMinute, startPeriod,
  onStartHourChange, onStartMinuteChange, onStartPeriodChange,
  endHour, endMinute, endPeriod,
  onEndHourChange, onEndMinuteChange, onEndPeriodChange,
  durationHours, onDurationChange,
}) {
  const [openPicker, setOpenPicker] = useState(null) // "start" | "duration" | null
  const close = useCallback(() => setOpenPicker(null), [])

  // Whenever start time or duration changes, recompute and push the end time up.
  const applyDuration = useCallback((hours) => {
    onDurationChange?.(hours)
    const end = computeEndFromDuration(startHour, startMinute, startPeriod, hours)
    if (end) {
      onEndHourChange(end.hour)
      onEndMinuteChange(end.minute)
      onEndPeriodChange(end.period)
    }
  }, [startHour, startMinute, startPeriod, onDurationChange, onEndHourChange, onEndMinuteChange, onEndPeriodChange])

  const handleStartHourChange = (h) => {
    onStartHourChange(h)
    if (durationHours) {
      const end = computeEndFromDuration(h, startMinute, startPeriod, durationHours)
      if (end) { onEndHourChange(end.hour); onEndMinuteChange(end.minute); onEndPeriodChange(end.period) }
    }
  }
  const handleStartMinuteChange = (m) => {
    onStartMinuteChange(m)
    if (durationHours) {
      const end = computeEndFromDuration(startHour, m, startPeriod, durationHours)
      if (end) { onEndHourChange(end.hour); onEndMinuteChange(end.minute); onEndPeriodChange(end.period) }
    }
  }
  const handleStartPeriodChange = (p) => {
    onStartPeriodChange(p)
    if (durationHours) {
      const end = computeEndFromDuration(startHour, startMinute, p, durationHours)
      if (end) { onEndHourChange(end.hour); onEndMinuteChange(end.minute); onEndPeriodChange(end.period) }
    }
  }

  const durationLabel = durationHours
    ? (durationHours === 1 ? "1 hour" : `${durationHours} hours`)
    : "Select duration"

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</label>}
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setOpenPicker("start")}
          className="flex-1 premium-input px-4 pt-2 pb-3.5 cursor-pointer text-left">
          <p className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1">Start</p>
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400 shrink-0">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {startHour && startMinute ? (
              <span className="font-bold text-[16px] text-slate-900 dark:text-white leading-none">
                {startHour}:{startMinute} <span className="text-green-700 dark:text-green-400">{startPeriod}</span>
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 text-[15px] font-semibold">--:--</span>
            )}
          </div>
        </button>

        <button type="button" onClick={() => setOpenPicker("duration")}
          className="flex-1 premium-input px-4 pt-2 pb-3.5 cursor-pointer text-left">
          <p className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1">Duration</p>
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400 shrink-0">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {durationHours ? (
              <span className="font-bold text-[15px] text-slate-900 dark:text-white leading-none truncate">
                {durationLabel}
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 text-[14px] font-semibold">Hour(s)</span>
            )}
          </div>
        </button>
      </div>

      {openPicker === "start" && (
        <TimeModal title="Start Time" onClose={close}
          hour={startHour} minute={startMinute} period={startPeriod}
          onHourChange={handleStartHourChange} onMinuteChange={handleStartMinuteChange} onPeriodChange={handleStartPeriodChange} />
      )}
      {openPicker === "duration" && (
        <DurationModal onClose={close} durationHours={durationHours} onSelect={applyDuration} />
      )}
    </div>
  )
}

export default function TimePickerField(props) {
  if ("onStartHourChange" in props) return <DualTimePicker {...props} />
  return <SingleTimePicker {...props} />
}