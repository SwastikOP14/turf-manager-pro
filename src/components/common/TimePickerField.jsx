import { Clock3, ChevronDown } from "lucide-react"

const HOURS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
)

const MINUTES = ["00", "15", "30", "45"]

const selectClass =
  "h-11 rounded-2xl text-center premium-input appearance-none pr-8"

export default function TimePickerField({
  label,
  hour,
  minute,
  period,
  onHourChange,
  onMinuteChange,
  onPeriodChange
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-slate-900 dark:text-white">
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <select
            value={hour}
            onChange={(e) => onHourChange(e.target.value)}
            className={`${selectClass} w-full`}
          >
            <option value="">HH</option>
            {HOURS.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>

        <div className="relative flex-1">
          <select
            value={minute}
            onChange={(e) => onMinuteChange(e.target.value)}
            className={`${selectClass} w-full`}
          >
            <option value="">MM</option>
            {MINUTES.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>

        <div className="relative w-24">
          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
            className={`${selectClass} w-full`}
          >
            <option>AM</option>
            <option>PM</option>
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>

        <Clock3 size={18} className="text-green-500 shrink-0" />
      </div>
    </div>
  )
}
