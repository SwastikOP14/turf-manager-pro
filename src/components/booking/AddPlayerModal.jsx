import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { useApp } from "../../context/useApp"
import { formatPhoneInput } from "../../utils/phone"
import PhotoUpload from "../common/PhotoUpload"
import { useModalBackHandler } from "../../hooks/useModalBackHandler"

export default function AddPlayerModal({ onClose, onPlayerAdded }) {
  const { addPlayer } = useApp()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("+91 ")
  const [address, setAddress] = useState("")
  const [preferredPayment, setPreferredPayment] = useState("UPI")
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState("")

  useModalBackHandler(onClose)

  useEffect(() => {
    document.body.classList.add("modal-open")
    return () => document.body.classList.remove("modal-open")
  }, [])

  const handleSave = () => {
    if (!name.trim()) { setError("Player name is required"); return }
    if (!phone || phone === "+91 ") { setError("Mobile number is required"); return }
    if (!address.trim()) { setError("Address is required"); return }

    const result = addPlayer({ name, phone, address, preferredPayment, photo })
    if (!result.ok) { setError(result.error); return }

    onPlayerAdded(result.player)
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-5">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal — theme-aware */}
      <div
        className="relative w-full max-w-sm rounded-3xl shadow-2xl flex flex-col
          bg-white dark:bg-[#0b1120]
          border border-slate-200 dark:border-white/10"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Add New Player
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/15 hover:bg-red-500/30 transition-colors"
          >
            <X size={16} className="text-red-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pb-2 space-y-4 min-h-0 scrollbar-hide">

          {/* Photo */}
          <div className="flex justify-center pt-2 pb-1">
            <PhotoUpload name={name} photo={photo} onPhotoChange={setPhoto} size="large" />
          </div>

          {/* Player Name */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
              Player Name
            </label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setError("") }}
              placeholder="e.g., Arjun Sharma"
              autoFocus
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition
                bg-slate-100 dark:bg-white/8
                border border-slate-200 dark:border-white/10
                text-slate-900 dark:text-white
                placeholder-slate-400 dark:placeholder-slate-500
                focus:border-green-500 dark:focus:border-green-500"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
              Mobile Number
            </label>
            <input
              value={phone}
              onChange={(e) => { setPhone(formatPhoneInput(e.target.value)); setError("") }}
              placeholder="+91 9876543210"
              inputMode="numeric"
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition
                bg-slate-100 dark:bg-white/8
                border border-slate-200 dark:border-white/10
                text-slate-900 dark:text-white
                placeholder-slate-400 dark:placeholder-slate-500
                focus:border-green-500 dark:focus:border-green-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
              Address
            </label>
            <textarea
              value={address}
              onChange={(e) => { setAddress(e.target.value); setError("") }}
              placeholder="Enter full address"
              rows={3}
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition resize-none
                bg-slate-100 dark:bg-white/8
                border border-slate-200 dark:border-white/10
                text-slate-900 dark:text-white
                placeholder-slate-400 dark:placeholder-slate-500
                focus:border-green-500 dark:focus:border-green-500"
            />
          </div>

          {/* Preferred Payment */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
              Preferred Payment
            </label>
            <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              {["UPI", "Cash"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPreferredPayment(method)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition
                    ${preferredPayment === method
                      ? "bg-green-500 text-black shadow-sm"
                      : "text-slate-600 dark:text-slate-300"
                    }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 pt-3 pb-5 border-t border-slate-100 dark:border-white/8 space-y-3">
          {error && <p className="text-xs text-red-500 font-medium text-center">{error}</p>}
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 text-black font-bold text-sm transition-colors"
          >
            Save Player
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
