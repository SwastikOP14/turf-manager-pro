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
    <div className="
      -mx-1 px-1
      flex gap-2
      overflow-x-auto scrollbar-hide
      snap-x snap-mandatory
      pb-1
    ">
      {PERIODS.map((period) => {
        const active = activePeriod === period
        const count = counts[period] ?? 0
        const label =
          period === "Custom"
            ? `Custom`
            : `${period} ${count}`

        return (
          <button
            key={period}
            type="button"
            onClick={() => {
              if (period === "Custom") {
                onCustomClick?.()
                return
              }

              onChange(period)
            }}
            className={`
              shrink-0 snap-start
              px-3.5 py-2 rounded-2xl border transition
              whitespace-nowrap text-sm font-semibold
              flex items-center gap-1.5
              ${active
                ? "bg-green-500 text-black border-green-500 shadow-(--shadow-glow)"
                : "bg-(--color-card) text-slate-900 dark:text-white border-(--color-card-border)"
              }
            `}
          >
            {period === "Custom" && <CalendarRange size={14} />}
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
