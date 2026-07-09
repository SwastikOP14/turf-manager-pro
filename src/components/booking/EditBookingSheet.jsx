import { useState } from "react"
import { createPortal } from "react-dom"
import { X, Plus, Trash2, Clock, Info, Lightbulb } from "lucide-react"
import { useHaptics } from "../../context/HapticsContext"
import { useModalBackHandler } from "../../hooks/useModalBackHandler"
import { formatCurrency, formatDisplayDate, formatTimeRange } from "../../utils/format"
import { useApp } from "../../context/useApp"
import SportIcon from "../common/SportIcon"
import PlayerAvatar from "../common/PlayerAvatar"

export default function EditBookingSheet({ booking, onSave, onClose }) {
  const haptics = useHaptics()
  const { players, squads, getTurfById, getSportById, getPlayerById } = useApp()

  const [status, setStatus] = useState(booking.status || "Pending")
  const [paidByPlayerId, setPaidByPlayerId] = useState(booking.paidByPlayerId || "")
  const [bookingType, setBookingType] = useState(booking.bookingType || "Individual")
  const [miscCosts, setMiscCosts] = useState(booking.miscCosts || [])
  const [newMiscName, setNewMiscName] = useState("")
  const [newMiscQty, setNewMiscQty] = useState("")
  const [newMiscPrice, setNewMiscPrice] = useState("")
  const [showAllMisc, setShowAllMisc] = useState(false)

  useModalBackHandler(onClose)

  // Check if this is an imported booking (has playerList/paidBy but no playerIds/paidByPlayerId)
  const isImportedBooking = booking.playerList && !booking.playerIds?.length

  const turf = getTurfById(booking.turfId)
  const sport = getSportById(booking.sportId)

  // Calculate costs - use baseAmount field if available, otherwise use booking.amount
  // This prevents compounding after multiple saves
  const storedBaseAmount = booking.baseAmount ?? booking.amount
  const baseAmount = Number(storedBaseAmount) || 0
  const miscTotal = miscCosts.reduce((sum, item) => sum + (item.qty * item.price), 0)
  const totalAmount = baseAmount + miscTotal

  const handleAddMisc = () => {
    if (!newMiscName.trim() || !newMiscPrice || newMiscPrice === "0") return

    const newItem = {
      id: `misc-${Date.now()}`,
      name: newMiscName.trim(),
      qty: Number(newMiscQty) || 1,
      price: Number(newMiscPrice)
    }

    setMiscCosts([...miscCosts, newItem])
    setNewMiscName("")
    setNewMiscQty("")
    setNewMiscPrice("")
    haptics.trigger(8)
  }

  const handleRemoveMisc = (id) => {
    setMiscCosts(miscCosts.filter(item => item.id !== id))
    haptics.trigger(8)
  }

  const handleSave = () => {
    haptics.trigger([10, 30, 10])

    // Save both baseAmount and total as amount for backward compatibility
    // baseAmount preserves the original booking amount without misc
    const updates = {
      miscCosts,
      baseAmount: baseAmount,  // Store base amount separately
      amount: totalAmount,     // Keep total for any legacy code that expects it
    }

    onSave(updates)
    onClose()
  }

  const playerCount = bookingType === "Squad"
    ? booking.squads?.reduce((sum, s) => sum + (s.memberPlayerIds?.length || 0), 0) || booking.nosOfPlayers || 0
    : booking.playerIds?.length || booking.nosOfPlayers || 0

  return createPortal(
    <div
      className="fixed inset-0 z-99999 flex items-end"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="w-full bg-white dark:bg-[#0f172a] rounded-t-3xl px-5 pt-4 pb-8 space-y-4"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle + header */}
        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto mb-1" />

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-slate-900 dark:text-white">
              Edit Booking {booking.id}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center"
          >
            <X size={17} />
          </button>
        </div>

        {/* Miscellaneous Costs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Miscellaneous Costs
            </label>
            {miscCosts.length > 2 && (
              <button
                type="button"
                onClick={() => setShowAllMisc(!showAllMisc)}
                className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-0.5"
              >
                {showAllMisc ? "Show less" : "See all"} {!showAllMisc && "→"}
              </button>
            )}
          </div>

          {/* Add new misc item — now shown first */}
          <div className="space-y-2">
            <input
              type="text"
              value={newMiscName}
              onChange={(e) => setNewMiscName(e.target.value)}
              placeholder="Item name (e.g., Water bottle)"
              className="w-full px-4 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={newMiscQty}
                onChange={(e) => setNewMiscQty(e.target.value)}
                placeholder="Qty."
                className="w-16 px-3 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none text-center"
              />
              <div className="relative flex-1 min-w-0">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium pointer-events-none">₹</span>
                <input
                  type="number"
                  value={newMiscPrice}
                  onChange={(e) => setNewMiscPrice(e.target.value)}
                  placeholder="Price per item"
                  className="w-full pl-7 pr-4 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddMisc}
              className="w-full py-3 rounded-2xl bg-green-500 text-black font-bold text-sm flex items-center justify-center gap-1.5"
            >
              <Plus size={15} />
              Add Item
            </button>
          </div>

          {/* Existing items list — now shown after the add form */}
          {miscCosts.length > 0 && (
            <div className="space-y-2">
              {(showAllMisc ? miscCosts : miscCosts.slice(0, 2)).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/8"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Qty: {item.qty} × {formatCurrency(item.price)} = {formatCurrency(item.qty * item.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMisc(item.id)}
                    className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center ml-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="rounded-2xl p-4 bg-green-500/8 border border-green-500/20 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Summary
          </p>

          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Booking Amount</span>
            <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(baseAmount)}</span>
          </div>

          {miscTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Miscellaneous Costs</span>
              <span className="font-semibold text-orange-500">+{formatCurrency(miscTotal)}</span>
            </div>
          )}

          <div className="flex justify-between text-base pt-2 border-t border-green-500/20">
            <span className="font-bold text-slate-900 dark:text-white">Total Amount</span>
            <span className="font-bold text-green-700 dark:text-green-400">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold text-[15px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3.5 rounded-2xl bg-green-500 text-black font-bold text-[15px]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
