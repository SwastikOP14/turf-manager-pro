import { useEffect } from "react"
import { createPortal } from "react-dom"

export default function Modal({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return
    document.body.classList.add("modal-open")
    return () => document.body.classList.remove("modal-open")
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md px-5">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Content */}
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#111827] border border-black/10 dark:border-white/10 p-5 shadow-2xl">
        {children}
      </div>
    </div>,
    document.body
  )
}
