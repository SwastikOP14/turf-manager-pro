import { useState } from "react"
import { X } from "lucide-react"

import Modal from "../common/Modal"
import InputField from "../common/InputField"
import { formatPhoneInput, isValidIndianPhone } from "../../utils/phone"

export default function AddTurfModal({
  open,
  onClose,
  onSave
}) {
  const [form, setForm] = useState({
    name: "",
    location: "",
    ownerName: "",
    ownerContact: "+91 "
  })

  const [error, setError] = useState("")

  const handleSave = () => {
    if (!form.name.trim()) {
      setError("Turf/Ground name is required")
      return
    }

    if (
      form.ownerContact &&
      !isValidIndianPhone(form.ownerContact)
    ) {
      setError("Enter a valid owner contact number")
      return
    }

    onSave(form)
    setForm({
      name: "",
      location: "",
      ownerName: "",
      ownerContact: "+91 "
    })
    setError("")
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Add New Turf/Ground
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
          label="Turf/Ground Name"
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, name: e.target.value }))
          }
        />

        <InputField
          label="Location"
          value={form.location}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, location: e.target.value }))
          }
        />

        <InputField
          label="Owner Name"
          value={form.ownerName}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, ownerName: e.target.value }))
          }
        />

        <InputField
          label="Owner Contact Number"
          value={form.ownerContact}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              ownerContact: formatPhoneInput(e.target.value)
            }))
          }
        />

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
          Save Turf/Ground
        </button>
      </div>
    </Modal>
  )
}
