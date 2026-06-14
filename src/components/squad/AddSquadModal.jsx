import { useState } from "react"
import { createPortal } from "react-dom"
import { X, Check, Search } from "lucide-react"
import { useApp } from "../../context/useApp"
import { useHaptics } from "../../context/HapticsContext"
import { useModalBackHandler } from "../../hooks/useModalBackHandler"
import { formatCurrency } from "../../utils/format"
import { formatPhoneDisplay } from "../../utils/phone"

export default function AddSquadModal({ onClose, onSquadAdded }) {
  const { players, addSquad } = useApp()
  const haptics = useHaptics()
  
  const [squadName, setSquadName] = useState("")
  const [selectedPlayerIds, setSelectedPlayerIds] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState("")

  useModalBackHandler(onClose)

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.phone.includes(searchQuery)
  )

  const togglePlayer = (playerId) => {
    haptics.trigger(8)
    setSelectedPlayerIds(prev => {
      const next = new Set(prev)
      if (next.has(playerId)) {
        next.delete(playerId)
      } else {
        next.add(playerId)
      }
      return next
    })
  }

  const handleSave = () => {
    const name = squadName.trim()
    
    if (!name) {
      setError("Please enter squad name")
      return
    }
    
    if (selectedPlayerIds.size === 0) {
      setError("Please select at least one player")
      return
    }

    const result = addSquad({
      name,
      memberPlayerIds: Array.from(selectedPlayerIds)
    })

    if (!result.ok) {
      setError(result.error)
      return
    }

    haptics.trigger([10, 30, 10])
    onSquadAdded?.(result.squad)
    onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-99999 flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="w-full bg-white dark:bg-[#0f172a] rounded-3xl px-5 pt-5 pb-6 space-y-4"
        style={{ maxWidth: "24rem", maxHeight: "85vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-slate-900 dark:text-white">
            Add Squad
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center"
          >
            <X size={17} />
          </button>
        </div>

        {/* Squad Name Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Squad Name
          </label>
          <input
            type="text"
            value={squadName}
            onChange={(e) => { setSquadName(e.target.value); setError("") }}
            placeholder="e.g., Weekend Warriors"
            className="w-full px-4 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
          />
        </div>

        {/* Search Players */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Select Players ({selectedPlayerIds.size})
          </label>
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search players..."
              className="w-full px-4 py-3 pl-10 rounded-2xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredPlayers.map((player) => {
            const isSelected = selectedPlayerIds.has(player.id)
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => togglePlayer(player.id)}
                className={`w-full flex items-center justify-between rounded-2xl p-3 border transition-all cursor-pointer text-left
                  ${isSelected ? "bg-green-500/15 border-green-500/50" : "bg-slate-100 dark:bg-white/5 border-black/5 dark:border-white/10 hover:border-green-500/30"}`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${isSelected ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-white"}`}>
                    {player.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-slate-500 dark:text-gray-400">{formatPhoneDisplay(player.phone)}</p>
                    <span className="text-xs text-slate-400">•</span>
                    <p className={`text-xs font-semibold ${player.balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                      {formatCurrency(player.balance)}
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all
                  ${isSelected ? "bg-green-500 border-green-500" : "border-slate-300 dark:border-white/30"}`}>
                  {isSelected && <Check size={11} className="text-white" />}
                </div>
              </button>
            )
          })}
          {filteredPlayers.length === 0 && (
            <p className="text-sm text-center text-slate-400 py-4">No players found</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

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
            Create Squad
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
