import { ChevronDown, Check } from "lucide-react"
import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { useModalBackHandler } from "../../hooks/useModalBackHandler"
import { useHaptics } from "../../context/HapticsContext"

export default function DropdownField({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select",
  className = ""
}) {
  const haptics = useHaptics()
  const [isOpen, setIsOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState({})
  const wrapperRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  // ─── Calculate position ONCE when opening ───────────────────────
  // Use scrollY so menu is absolutely positioned in document space,
  // not viewport space — it doesn't move when the page scrolls.
  const open = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const absTop = rect.bottom + window.scrollY
    const absLeft = rect.left + window.scrollX

    // Header height — clamp so dropdown never covers the sticky header
    const headerEl = document.querySelector("header")
    const headerH = headerEl ? headerEl.getBoundingClientRect().bottom : 0

    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top - headerH   // space above = from header bottom to trigger
    const maxH = 280

    let top
    if (spaceBelow >= 150 || spaceBelow >= spaceAbove) {
      // Open downward — clamp to never overlap header visually
      top = absTop + 4
    } else {
      // Open upward
      const height = Math.min(maxH, spaceAbove - 8)
      top = rect.top + window.scrollY - height - 4
    }

    // Never let top go above the header (in document space)
    const minTop = headerH + window.scrollY + 4
    top = Math.max(top, minTop)

    setMenuStyle({
      position: "absolute",
      top: `${top}px`,
      left: `${absLeft}px`,
      width: `${rect.width}px`,
      maxHeight: `${Math.min(maxH, Math.max(spaceBelow, spaceAbove) - 8)}px`,
      zIndex: 99999,
    })
    setIsOpen(true)
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  // ─── Outside pointer-down → close ───────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (
        !wrapperRef.current?.contains(e.target) &&
        !menuRef.current?.contains(e.target)
      ) {
        close()
      }
    }
    // Slight delay so the open-click doesn't immediately close
    const id = setTimeout(() =>
      document.addEventListener("pointerdown", handler, true), 0)
    return () => {
      clearTimeout(id)
      document.removeEventListener("pointerdown", handler, true)
    }
  }, [isOpen, close])

  // ─── Android back button ─────────────────────────────────────────
  useModalBackHandler(isOpen ? close : null)

  // ─── Derived ─────────────────────────────────────────────────────
  const selectedOption = options.find((opt) =>
    (typeof opt === "string" ? opt : opt.value) === value
  )
  const selectedLabel = selectedOption
    ? (typeof selectedOption === "string" ? selectedOption : selectedOption.label)
    : ""

  const handleSelect = (optionValue) => {
    haptics.trigger(10)
    onChange({ target: { value: optionValue } })
    close()
  }

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col gap-2 ${className}`} ref={wrapperRef}>
      {label && (
        <label className="text-sm" style={{ color: "var(--text-primary)" }}>
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? close() : open())}
        className={`
          premium-input w-full py-3 px-4
          text-left flex items-center justify-between gap-2 transition-all
          ${value ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}
          ${isOpen ? "border-green-500 ring-2 ring-green-500/20" : ""}
        `}
      >
        <span className="truncate flex-1">{selectedLabel || placeholder}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Portal menu — absolute in document space, never repositioned */}
      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={menuStyle}
          className="overflow-y-auto overscroll-contain rounded-2xl bg-white dark:bg-[#1e293b] border border-black/10 dark:border-white/10 shadow-2xl"
        >
          {/* Placeholder / clear */}
          {placeholder && (
            <button
              type="button"
              onClick={() => handleSelect("")}
              className={`
                w-full px-4 py-3.5 text-left flex items-center justify-between transition-colors
                ${!value
                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
                  : "text-slate-400 dark:text-slate-500 hover:bg-black/5 dark:hover:bg-white/5"}
              `}
            >
              <span className="text-sm">{placeholder}</span>
              {!value && <Check size={14} />}
            </button>
          )}

          {options.map((option) => {
            const optVal = typeof option === "string" ? option : option.value
            const optLabel = typeof option === "string" ? option : option.label
            const selected = optVal === value
            return (
              <button
                key={optVal}
                type="button"
                onClick={() => handleSelect(optVal)}
                className={`
                  w-full px-4 py-3.5 text-left flex items-center justify-between transition-colors
                  ${selected
                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                    : "text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/5"}
                `}
              >
                <span className="text-sm font-medium">{optLabel}</span>
                {selected && <Check size={14} />}
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
      )}
    </div>
  )
}
