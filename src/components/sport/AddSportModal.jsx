import { useState } from "react"
import { X } from "lucide-react"

import Modal from "../common/Modal"
import InputField from "../common/InputField"

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
      <div className="space-y-3">
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Add New Sport/Game
          </h2>

          <button
            onClick={onClose}
            className="
              w-10 h-10 rounded-xl
              bg-red-500/15 text-red-500
              flex items-center justify-center
              hover:bg-red-500/25 transition-all duration-200
            "
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

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
          <div className="grid grid-cols-6 gap-2.5 mt-2">
            {/* No Icon Option */}
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, icon: "" }))}
              className={`
                aspect-square rounded-lg text-xs font-semibold
                border-2 transition-all flex items-center justify-center
                ${form.icon === ""
                  ? "border-green-500 bg-green-500/10 scale-105 text-green-600 dark:text-green-400"
                  : "border-slate-600 dark:border-slate-500 bg-slate-700 dark:bg-slate-800 hover:scale-105 text-slate-300"
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
                  aspect-square rounded-lg text-2xl
                  border-2 transition-all flex items-center justify-center
                  ${form.icon === icon
                    ? "border-green-500 bg-green-500/10 scale-105"
                    : "border-slate-600 dark:border-slate-500 bg-slate-700 dark:bg-slate-800 hover:scale-105"
                  }
                `}
              >
                {icon}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">
            Select an icon or leave as "None" to use a neutral emoji
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          onClick={handleSave}
          className="
            w-full py-3 px-4 rounded-xl
            bg-green-500 text-black font-semibold
            hover:bg-green-600 transition-all
          "
        >
          Save Sport/Game
        </button>
      </div>
    </Modal>
  )
}