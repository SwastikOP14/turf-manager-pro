import { Filter } from "lucide-react"
import { useState } from "react"

const STATUS_OPTIONS = ["Paid", "Partial", "Pending"]

export default function BookingFilterMenu({
  activeStatuses,
  onToggle
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="
          w-11 h-11 rounded-2xl
          bg-[var(--color-card)]
          border border-[var(--color-card-border)]
          flex items-center justify-center
          text-slate-700 dark:text-white
          shadow-[var(--shadow-card)]
        "
        aria-label="Filter bookings"
      >
        <Filter size={18} />
      </button>

      {open && (
        <div className="
          absolute right-0 top-14 w-44
          rounded-2xl overflow-hidden z-50
          bg-white dark:bg-[#111827]
          border border-black/10 dark:border-white/10
          shadow-[var(--shadow-card)]
        ">
          {STATUS_OPTIONS.map((status) => {
            const active = activeStatuses.includes(status)

            return (
              <button
                key={status}
                onClick={() => onToggle(status)}
                className={`
                  w-full px-4 py-3 text-left text-sm font-medium transition
                  ${active
                    ? "bg-green-500 text-black"
                    : "text-slate-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
                  }
                `}
              >
                {status}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
