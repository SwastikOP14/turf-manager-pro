import { ChevronDown, Check } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export default function DropdownField({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select",
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [isOpen])

  const selectedOption = options.find((opt) => {
    const optValue = typeof opt === "string" ? opt : opt.value
    return optValue === value
  })

  const selectedLabel = selectedOption
    ? typeof selectedOption === "string" ? selectedOption : selectedOption.label
    : ""

  const handleSelect = (optionValue) => {
    // Create synthetic event to match native select onChange
    const syntheticEvent = {
      target: { value: optionValue }
    }
    onChange(syntheticEvent)
    setIsOpen(false)
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`} ref={ref}>
      {label && (
        <label className="text-sm font-medium text-slate-900 dark:text-white">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            premium-input
            py-3 pr-10
            text-left
            flex items-center justify-between
            transition-all
            ${value ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}
            ${isOpen ? "border-green-500 ring-2 ring-green-500/20" : ""}
          `}
        >
          <span className="truncate">
            {selectedLabel || placeholder}
          </span>
          <ChevronDown
            size={18}
            className={`
              absolute right-3 top-1/2 -translate-y-1/2
              text-slate-500 dark:text-slate-400
              transition-transform
              ${isOpen ? "rotate-180" : ""}
            `}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="
            absolute top-[calc(100%+4px)] left-0 right-0 z-50
            rounded-2xl overflow-hidden
            bg-white dark:bg-[#1e293b]
            border border-black/10 dark:border-white/12
            shadow-lg
            max-h-64 overflow-y-auto
          ">
            {/* Placeholder option */}
            {placeholder && (
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={`
                  w-full px-4 py-3 text-left transition-colors
                  flex items-center justify-between
                  ${!value
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "text-slate-400 dark:text-slate-500 hover:bg-black/5 dark:hover:bg-white/5"
                  }
                `}
              >
                <span className="text-sm">{placeholder}</span>
                {!value && <Check size={14} className="text-green-500" />}
              </button>
            )}

            {/* Options */}
            {options.map((option) => {
              const optionValue = typeof option === "string" ? option : option.value
              const optionLabel = typeof option === "string" ? option : option.label
              const isSelected = optionValue === value

              return (
                <button
                  key={optionValue}
                  type="button"
                  onClick={() => handleSelect(optionValue)}
                  className={`
                    w-full px-4 py-3 text-left transition-colors
                    flex items-center justify-between
                    ${isSelected
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
                    }
                  `}
                >
                  <span className="text-sm font-medium">{optionLabel}</span>
                  {isSelected && <Check size={14} className="text-green-500" />}
                </button>
              )
            })}

            {options.length === 0 && (
              <div className="px-4 py-6 text-center text-slate-400 dark:text-slate-500 text-sm">
                No options available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}