import { useState } from "react"

import Modal from "../common/Modal"
import InputField from "../common/InputField"
import PrimaryButton from "../common/PrimaryButton"

export default function AddSportModal({
  open,
  onClose,
  onSave
}) {
  const [form, setForm] = useState({
    name: "",
    icon: "" // Default to no icon
  })

  const [error, setError] = useState("")

  const handleSave = () => {
    if (!form.name.trim()) {
      setError("Sport/Game name is required")
      return
    }

    onSave(form)
    setForm({ name: "", icon: "" })
    setError("")
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Add New Sport/Game
        </h2>

        <InputField
          label="Sport/Game Name"
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="e.g. Football, Cricket, Basketball"
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900 dark:text-white">
            Sport Icon (Optional)
          </label>
          <div className="grid grid-cols-6 gap-2">
            {/* No Icon Option */}
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, icon: "" }))}
              className={`
                aspect-square rounded-xl text-xs font-medium
                border transition-all flex items-center justify-center
                ${form.icon === ""
                  ? "border-green-500 bg-green-500/10 scale-110 text-green-600 dark:text-green-400"
                  : "border-black/10 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:scale-105 text-slate-600 dark:text-slate-400"
                }
              `}
            >
              None
            </button>
            
            {/* Icon Options */}
            {["⚽", "🏏", "🏀", "🏐", "🏸", "🎾", "🏓", "🥅", "🏈", "🏉", "⛳"].map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, icon }))}
                className={`
                  aspect-square rounded-xl text-xl
                  border transition-all
                  ${form.icon === icon
                    ? "border-green-500 bg-green-500/10 scale-110"
                    : "border-black/10 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:scale-105"
                  }
                `}
              >
                {icon}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Select an icon or leave as "None" to use a neutral emoji in bookings
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <div className="flex gap-3 items-center">
          <button
            onClick={onClose}
            className="
              w-12 h-12 rounded-2xl
              border border-black/10 dark:border-white/10
              bg-slate-100 dark:bg-white/5
              text-slate-600 dark:text-slate-400
              hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30
              transition-colors
              flex items-center justify-center
              text-lg
            "
            title="Cancel"
          >
            ✕
          </button>

          <PrimaryButton
            text="Save Sport/Game"
            onClick={handleSave}
            className="flex-1"
          />
        </div>
      </div>
    </Modal>
  )
}