import { X, Pencil, Trash2 } from "lucide-react"

export default function BookingSelectionBar({
  count,
  onCancel,
  onEdit,
  onDelete
}) {
  const showEdit = count === 1

  return (
    <div
      className="
        fixed left-1/2 -translate-x-1/2 z-50
        w-full max-w-md px-4
      "
      style={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="
        premium-card
        flex items-center gap-2
        p-2.5
        bg-white dark:bg-[#0f172a]
        border border-black/10 dark:border-white/10
        shadow-[var(--shadow-card-hover)]
      ">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel selection"
          className="
            w-10 h-10 rounded-xl shrink-0
            flex items-center justify-center
            text-slate-600 dark:text-slate-300
            hover:bg-black/5 dark:hover:bg-white/10
          "
        >
          <X size={18} />
        </button>

        <span className="
          min-w-[2rem] h-8 px-2 rounded-full
          bg-blue-500 text-white text-sm font-bold
          flex items-center justify-center shrink-0
        ">
          {count}
        </span>

        {showEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="
              flex-1 h-10 rounded-xl
              bg-green-500 text-black
              font-semibold text-sm
              flex items-center justify-center gap-1.5
            "
          >
            <Pencil size={15} />
            Edit
          </button>
        )}

        <button
          type="button"
          onClick={onDelete}
          className={`
            h-10 rounded-xl
            bg-red-500/15 text-red-500
            font-semibold text-sm
            flex items-center justify-center gap-1.5
            ${showEdit ? "flex-1" : "flex-[2]"}
          `}
        >
          <Trash2 size={15} />
          Delete
        </button>
      </div>
    </div>
  )
}
