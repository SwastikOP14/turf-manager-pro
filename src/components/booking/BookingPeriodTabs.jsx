import { CalendarRange } from "lucide-react"

const PERIODS = [
  "All",
  "This Week",
  "This Month",
  "This Year",
  "Custom"
]

export default function BookingPeriodTabs({
  activePeriod,
  onChange,
  counts,
  onCustomClick
}) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {PERIODS.map((period) => {
        const active = activePeriod === period

        return (
          <button
            key={period}
            onClick={() => {
              if (period === "Custom") {
                onCustomClick?.()
                return
              }

              onChange(period)
            }}
            className={`
              min-w-[88px] px-3 py-2 rounded-2xl border transition
              ${active
                ? "bg-green-500 text-black border-green-500 shadow-[var(--shadow-glow)]"
                : "bg-[var(--color-card)] text-slate-900 dark:text-white border-[var(--color-card-border)]"
              }
            `}
          >
            <div className="flex items-center justify-center gap-1 text-[11px] font-medium">
              {period === "Custom" && <CalendarRange size={12} />}
              <span>{period}</span>
            </div>
            <div className="text-sm font-bold text-center">
              {counts[period] ?? 0}
            </div>
          </button>
        )
      })}
    </div>
  )
}
