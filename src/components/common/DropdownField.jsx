import { ChevronDown, Check } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"

export default function DropdownField({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select",
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState({})
  const triggerRef = useRef(null)
  const ref = useRef(null)

  // Position the portal menu under the trigger button
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    setMenuStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999
    })
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClick = (e) => {
      if (
        ref.current && !ref.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [isOpen])

  // Close on scroll (repositioning would be needed otherwise)
  useEffect(() => {
    if (!isOpen) return
    const handleScroll = () => setIsOpen(false)
    window.addEventListener("scroll", handleScroll, true)
    return () => window.removeEventListener("scroll", handleScroll, true)
  }, [isOpen])

  const selectedOption = options.find((opt) => {
    const optValue = typeof opt === "string" ? opt : opt.value
    return optValue === value
  })

  const selectedLabel = selectedOption
    ? typeof selectedOption === "string" ? selectedOption : selectedOption.label
    : ""

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } })
    setIsOpen(false)
  }

  const menu = isOpen ? createPortal(
    <div
      ref={ref}
      style={menuStyle}
      className="
        rounded-2xl overflow-hidden
        bg-white dark:bg-[#1e293b]
        border border-black/10 dark:border-white/12
        shadow-xl
        max-h-64 overflow-y-auto
        scrollbar-hide
      "
    >
      {/* Placeholder option */}
      {placeholder && (
        <button
          type="button"
          onClick={() => handleSelect("")}
          className={`
            w-full px-4 py-3 text-left transition-colors
            flex items-center justify-between
            ${!value
              ? "bg-green-500/10 text-green-700 dark:text-green-400"
              : "text-slate-400 dark:text-slate-500 hover:bg-black/5 dark:hover:bg-white/5"
            }
          `}
        >
          <span className="text-sm">{placeholder}</span>
          {!value && <Check size={14} className="text-green-700 dark:text-green-400" />}
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
                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                : "text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
              }
            `}
          >
            <span className="text-sm font-medium">{optionLabel}</span>
            {isSelected && <Check size={14} className="text-green-700 dark:text-green-400" />}
          </button>
        )
      })}

      {options.length === 0 && (
        <div className="px-4 py-6 text-center text-slate-400 dark:text-slate-500 text-sm">
          No options available
        </div>
      )}
    </div>,
    document.body
  ) : null

  return (
    <div className={`flex flex-col gap-2 relative ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-900 dark:text-white">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          premium-input
          py-3 px-4
          text-left
          flex items-center justify-between gap-2
          transition-all
          ${value ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}
          ${isOpen ? "border-green-500 ring-2 ring-green-500/20" : ""}
        `}
      >
        <span className="truncate flex-1">
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-500 dark:text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {menu}
    </div>
  )
}
