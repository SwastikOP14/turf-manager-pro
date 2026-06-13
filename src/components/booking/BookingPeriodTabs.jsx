import { CalendarRange } from "lucide-react"

const PERIODS = ["All", "This Week", "This Month", "This Year", "Custom"]

export default function BookingPeriodTabs({ 
  activePeriod, 
  onChange, 
  counts, 
  onCustomClick,
  // New props for filter
  filterMenu
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Period pills */}
      <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 -mx-1 px-1">
        {PERIODS.map((period) => {
          const active = activePeriod === period
          const count  = counts?.[period] ?? 0
          const label  = period === "Custom" ? "Custom" : `${period}${count > 0 ? ` ${count}` : " 0"}`

          return (
            <button
              key={period}
              type="button"
              onClick={() => {
                if (period === "Custom") { onCustomClick?.(); return }
                onChange(period)
              }}
              className="shrink-0 flex items-center gap-1.5 whitespace-nowrap"
              style={{
                padding: "7px 14px",
                borderRadius: "99px",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "inherit",
                border: active ? "none" : "1.5px solid var(--bg-border)",
                background: active
                  ? "var(--brand)"
                  : "var(--bg-card)",
                color: active ? "#000" : "var(--text-secondary)",
                cursor: "pointer",
                boxShadow: active ? "0 2px 12px var(--brand-glow)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {period === "Custom" && <CalendarRange size={12} />}
              {label}
            </button>
          )
        })}
      </div>
      
      {/* Filter icon at the right end */}
      {filterMenu && <div className="shrink-0">{filterMenu}</div>}
    </div>
  )
}
