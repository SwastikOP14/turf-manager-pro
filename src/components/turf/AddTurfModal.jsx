import { useState } from "react"

import Modal from "../common/Modal"
import InputField from "../common/InputField"
import PrimaryButton from "../common/PrimaryButton"
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
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Add New Turf/Ground
        </h2>

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

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="
              flex-1 py-3 rounded-2xl
              border border-black/10 dark:border-white/10
              text-slate-900 dark:text-white
            "
          >
            Cancel
          </button>

          <PrimaryButton
            text="Save Turf"
            onClick={handleSave}
          />
        </div>
      </div>
    </Modal>
  )
}
