import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Check, Search, Trash2 } from "lucide-react"
import MobileLayout from "../../components/layout/MobileLayout"
import GlassCard from "../../components/common/GlassCard"
import InputField from "../../components/common/InputField"
import PrimaryButton from "../../components/common/PrimaryButton"
import { useApp } from "../../context/useApp"
import { useHaptics } from "../../context/HapticsContext"
import { formatCurrency } from "../../utils/format"
import { formatPhoneDisplay } from "../../utils/phone"
import { searchPlayers } from "../../utils/players"

export default function SquadEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const haptics = useHaptics()
  const { players, getSquadById, updateSquad, deleteSquad } = useApp()

  const squad = getSquadById(id)

  const [name, setName] = useState(squad?.name || "")
  const [memberIds, setMemberIds] = useState(squad?.memberPlayerIds || [])
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const filteredPlayers = useMemo(
    () => searchPlayers(players, query),
    [players, query]
  )

  if (!squad) {
    return (
      <MobileLayout>
        <div className="pt-2 px-5 pb-5 flex items-center justify-center h-full">
          <p className="text-slate-500">Squad not found</p>
        </div>
      </MobileLayout>
    )
  }

  const toggleMember = (pid) => {
    haptics.trigger(8)
    setMemberIds((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    )
  }

  const handleSave = () => {
    if (!name.trim()) {
      setError("Please enter a squad name")
      return
    }
    if (memberIds.length === 0) {
      setError("Please select at least one player")
      return
    }
    haptics.trigger([10, 30, 10])
    updateSquad(id, { name: name.trim(), memberPlayerIds: memberIds })
    navigate(`/squad/${id}`)
  }

  const handleDelete = () => {
    haptics.trigger([15, 50, 15])
    deleteSquad(id)
    navigate("/players")
  }

  return (
    <MobileLayout hideFab>
      <div className="pt-2 px-5 pb-5 space-y-4 animate-fade-in-up">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(`/squad/${id}`)}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-slate-700 dark:text-white" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Squad</h1>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <GlassCard className="space-y-4">
          <InputField
            label="Squad Name"
            value={name}
            onChange={(e) => { setName(e.target.value); setError("") }}
          />
        </GlassCard>

        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Members ({memberIds.length})
            </h2>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search players..."
              className="premium-input py-3 text-sm w-full"
              style={{ paddingLeft: "2.25rem" }}
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
            {filteredPlayers.map((player) => {
              const checked = memberIds.includes(player.id)
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => toggleMember(player.id)}
                  className={`w-full flex items-center justify-between rounded-2xl p-3 border transition-all cursor-pointer text-left
                    ${checked ? "bg-green-500/15 border-green-500/50" : "bg-slate-100 dark:bg-white/5 border-black/5 dark:border-white/10 hover:border-green-500/30"}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${checked ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-white"}`}>
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
                    ${checked ? "bg-green-500 border-green-500" : "border-slate-300 dark:border-white/30"}`}>
                    {checked && <Check size={11} className="text-white" />}
                  </div>
                </button>
              )
            })}
          </div>
        </GlassCard>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <PrimaryButton text="Save Changes" onClick={handleSave} />
      </div>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-99999 flex items-end"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full bg-white dark:bg-[#0f172a] rounded-t-3xl px-5 pt-5 pb-8 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-500/15 flex items-center justify-center shrink-0">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-slate-900 dark:text-white">Delete Squad?</h2>
                <p className="text-sm text-red-500 dark:text-red-400 mt-0.5 font-medium">
                  This will permanently delete "{squad.name}". Members won't be affected.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3.5 rounded-2xl border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold text-[15px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-bold text-[15px] flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  )
}