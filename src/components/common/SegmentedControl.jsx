export default function SegmentedControl({
  options,
  value,
  onChange
}) {
  return (
    <div className="
      flex
      p-1
      rounded-2xl
      bg-slate-200/80
      dark:bg-white/5
      border border-black/5 dark:border-white/10
    ">
      {options.map((option) => {
        const active = value === option

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`
              flex-1
              py-2.5
              rounded-xl
              text-sm font-semibold
              transition
              ${active
                ? "bg-green-500 text-black shadow-sm"
                : "text-slate-600 dark:text-slate-300"
              }
            `}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
