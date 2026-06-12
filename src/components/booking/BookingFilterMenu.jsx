import { Filter } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const STATUS_OPTIONS = ["Paid", "Partial", "Pending"]

export default function BookingFilterMenu({
  activeStatuses,
  onToggle
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return

    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`
          w-11 h-11 rounded-2xl
          bg-(--color-card)
          border border-(--color-card-border)
          flex items-center justify-center
          shadow-(--shadow-card)
          transition
          ${activeStatuses.length > 0
            ? "text-green-500"
            : "text-slate-700 dark:text-white"
          }
        `}
        aria-label="Filter bookings"
      >
        <Filter size={18} />
        {activeStatuses.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 text-black text-[10px] font-bold flex items-center justify-center">
            {activeStatuses.length}
          </span>
        )}
      </button>

      {open && (
        <div className="
          absolute right-0 top-14 w-44
          rounded-2xl overflow-hidden z-50
          bg-white dark:bg-[#111827]
          border border-black/10 dark:border-white/10
          shadow-(--shadow-card)
        ">
          {STATUS_OPTIONS.map((status) => {
            const active = activeStatuses.includes(status)

            return (
              <button
                key={status}
                onClick={() => onToggle(status)}
                className={`
                  w-full px-4 py-3 text-left text-sm font-medium transition
                  flex items-center gap-2
                  ${active
                    ? "bg-green-500 text-black"
                    : "text-slate-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
                  }
                `}
              >
                <span className={`
                  w-4 h-4 rounded border-2 flex items-center justify-center shrink-0
                  ${active
                    ? "border-black bg-black/20"
                    : "border-slate-400 dark:border-white/40"
                  }
                `}>
                  {active && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                {status}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
