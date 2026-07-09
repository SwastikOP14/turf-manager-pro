import { createPortal } from "react-dom"
import { Trash2 } from "lucide-react"
import { useHaptics } from "../../context/HapticsContext"
import { useModalBackHandler } from "../../hooks/useModalBackHandler"

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}) {
  const haptics = useHaptics()

  useModalBackHandler(() => {
    if (open) onCancel?.()
  })

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-99999 flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0f172a] p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h2>

        {/* Message */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              haptics.trigger(10)
              onCancel?.()
            }}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              haptics.trigger([10, 50, 10])
              onConfirm?.()
            }}
            className="px-4 py-2.5 rounded-2xl bg-red-500 text-white font-semibold text-sm flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}