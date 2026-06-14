import { useState, useMemo } from "react"
import { createPortal } from "react-dom"
import { X, Plus, Trash2, Clock } from "lucide-react"
import { useHaptics } from "../../context/HapticsContext"
import { useModalBackHandler } from "../../hooks/useModalBackHandler"
import { formatCurrency, formatDisplayDate, formatTimeRange } from "../../utils/format"
import { useApp } from "../../context/useApp"
import SportIcon from "../common/SportIcon"

const STATUS_OPTIONS = ["Paid", "Partial", "Pending"]
const TIME_OPTIONS = [0, 5, 10, 15, 30, 45, 60]

export default function EditBookingSheet({ booking, onSave, onClose }) {
  const haptics = useHaptics()
  const { players, getTurfById, getSportById, getPlayerById } = useApp()
  
  const [status, setStatus] = useState(booking.status || "Pending")
  const [paidByPlayerId, setPaidByPlayerId] = useState(booking.paidByPlayerId || "")
  const [additionalTime, setAdditionalTime] = useState(0)
  const [miscCosts, setMiscCosts] = useState(booking.miscCosts || [])
  const [newMiscName, setNewMiscName] = useState("")
  const [newMiscQty, setNewMiscQty] = useState("1")
  const [newMiscPrice, setNewMiscPrice] = useState("")

  useModalBackHandler(onClose)

  const turf = getTurfById(booking.turfId)
  const sport = getSportById(booking.sportId)
  
  // Calculate new end time with additional minutes
  const updatedEndTime = useMemo(() => {
    if (!booking.endTime || additionalTime === 0) return booking.endTime
    const [hours, minutes] = booking.endTime.split(":").map(Number)
    const totalMinutes = hours * 60 + minutes + additionalTime
    const newHours = Math.floor(totalMinutes / 60) % 24
    const newMinutes = totalMinutes % 60
    return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`
  }, [booking.endTime, additionalTime])

  // Calculate costs
  const baseAmount = Number(booking.amount) || 0
  const additionalTimeCost = additionalTime * 10 // ₹10 per minute
  const miscTotal = miscCosts.reduce((sum, item) => sum + (item.qty * item.price), 0)
  const totalAmount = baseAmount + additionalTimeCost + miscTotal

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
    setNewMiscQty("1")
    setNewMiscPrice("")
    haptics.trigger(8)
  }

  const handleRemoveMisc = (id) => {
    setMiscCosts(miscCosts.filter(item => item.id !== id))
    haptics.trigger(8)
  }

  const handleSave = () => {
    haptics.trigger([10, 30, 10])
    
    const updates = {
      status,
      paidByPlayerId,
      miscCosts,
      additionalTime: additionalTime > 0 ? additionalTime : undefined,
      endTime: updatedEndTime,
      amount: totalAmount
    }
    
    onSave(updates)
    onClose()
  }

  const playerCount = booking.bookingType === "Team"
    ? booking.teams?.reduce((sum, t) => sum + (t.playerIds?.length || 0), 0) || 0
    : booking.playerIds?.length || 0

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

        {/* Booking Details Summary - Read Only */}
        <div className="rounded-2xl p-4 bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/8 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Booking Details
          </p>
          
          <div className="flex items-center gap-2">
            <SportIcon sportId={sport?.id} sportName={sport?.name} sport={sport} size={16} />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{sport?.name || "Sport"}</span>
          </div>
          
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-medium">{turf?.name || "Unknown Turf"}</span>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
            <span>{formatDisplayDate(booking.date)}</span>
            <span>•</span>
            <span>{formatTimeRange(booking.startTime, updatedEndTime)}</span>
            {additionalTime > 0 && (
              <>
                <span className="text-orange-500 font-semibold">+{additionalTime} min</span>
              </>
            )}
            <span>•</span>
            <span>{playerCount} players</span>
          </div>
        </div>

        {/* Payment Status */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Payment Status
          </label>
          <div className="flex rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 p-1 gap-1">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => { haptics.trigger(8); setStatus(s) }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: status === s ? (s === "Paid" ? "#10b981" : s === "Partial" ? "#f59e0b" : "#ef4444") : "transparent",
                  color: status === s ? "#000" : undefined,
                }}
              >
                {s === "Pending" ? "Unpaid" : s === "Partial" ? "To Pay" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Paid By */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Paid By
          </label>
          <select
            value={paidByPlayerId}
            onChange={(e) => { haptics.trigger(8); setPaidByPlayerId(e.target.value) }}
            className="w-full px-4 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white outline-none"
          >
            <option value="">Select player</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({formatCurrency(p.balance)})
              </option>
            ))}
          </select>
        </div>

        {/* Additional Time */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Additional Time
          </label>
          <select
            value={additionalTime}
            onChange={(e) => { haptics.trigger(8); setAdditionalTime(Number(e.target.value)) }}
            className="w-full px-4 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white outline-none"
          >
            {TIME_OPTIONS.map(min => (
              <option key={min} value={min}>
                {min === 0 ? "No additional time" : `+${min} minutes (₹${min * 10})`}
              </option>
            ))}
          </select>
          {additionalTime > 0 && (
            <p className="text-xs text-orange-500 font-medium px-1">
              Updated time: {formatTimeRange(booking.startTime, updatedEndTime)} (+{additionalTime} min)
            </p>
          )}
        </div>

        {/* Miscellaneous Costs */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Miscellaneous Costs
          </label>
          
          {miscCosts.length > 0 && (
            <div className="space-y-2">
              {miscCosts.map((item) => (
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

          {/* Add new misc item */}
          <div className="space-y-2 pt-2">
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
                placeholder="Qty"
                className="w-20 px-4 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
              />
              <input
                type="number"
                value={newMiscPrice}
                onChange={(e) => setNewMiscPrice(e.target.value)}
                placeholder="Price per item"
                className="flex-1 px-4 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
              />
              <button
                type="button"
                onClick={handleAddMisc}
                className="px-4 py-3 rounded-2xl bg-green-500 text-black font-bold text-sm flex items-center gap-1.5 shrink-0"
              >
                <Plus size={15} />
                Add
              </button>
            </div>
          </div>
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
          
          {additionalTime > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Additional Time (+{additionalTime} min)</span>
              <span className="font-semibold text-orange-500">+{formatCurrency(additionalTimeCost)}</span>
            </div>
          )}
          
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
