import { useState, useMemo, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, ChevronDown, Plus, Search, UserPlus } from "lucide-react"
import GlassCard from "../common/GlassCard"
import AddPlayerModal from "./AddPlayerModal"
import { searchPlayers } from "../../utils/players"
import { useModalBackHandler } from "../../hooks/useModalBackHandler"

// ─── Portal wrapper ────────────────────────────────────────────────────────
function Portal({ children }) {
  useEffect(() => {
    document.body.classList.add("modal-open")
    return () => document.body.classList.remove("modal-open")
  }, [])
  return createPortal(children, document.body)
}

// ─── Add / Edit Team modal ──────────────────────────────────────────────────
function AddTeamModal({ allPlayers, usedPlayerIds, onSave, onClose, editTeam }) {
  const [teamName, setTeamName] = useState(editTeam?.name || "")
  const [selectedIds, setSelectedIds] = useState(editTeam?.playerIds || [])
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false)
  const [localPlayers, setLocalPlayers] = useState(allPlayers)

  const availablePlayers = useMemo(() => {
    const otherTeamIds = new Set(
      [...usedPlayerIds].filter((id) => !editTeam?.playerIds?.includes(id))
    )
    return searchPlayers(
      localPlayers.filter((p) => !otherTeamIds.has(p.id)),
      query
    )
  }, [localPlayers, usedPlayerIds, query, editTeam])

  const togglePlayer = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
    setError("")
  }

  const handlePlayerAdded = (newPlayer) => {
    setLocalPlayers((prev) => [...prev, newPlayer])
    setSelectedIds((prev) => [...prev, newPlayer.id])
    setQuery("")
  }

  useModalBackHandler(onClose)

  const handleSave = () => {
    if (!teamName.trim()) {
      setError("Team name is required")
      return
    }
    if (selectedIds.length === 0) {
      setError("Add at least one player")
      return
    }
    onSave({ name: teamName.trim(), playerIds: selectedIds })
  }

  return (
    <>
      <Portal>
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

          {/* Modal — theme-aware */}
          <div
            className="relative w-full max-w-sm rounded-3xl shadow-2xl flex flex-col
              bg-white dark:bg-[#0b1120]
              border border-slate-200 dark:border-white/10"
            style={{ maxHeight: "88vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editTeam ? "Edit Team" : "New Team"}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/15 hover:bg-red-500/30 transition-colors"
              >
                <X size={16} className="text-red-500" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 pb-2 space-y-3 min-h-0 scrollbar-hide">
              {/* Team Name */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
                  Team Name
                </label>
                <input
                  value={teamName}
                  onChange={(e) => { setTeamName(e.target.value); setError("") }}
                  placeholder="e.g., Team A"
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition
                    bg-slate-100 dark:bg-white/8
                    border border-slate-200 dark:border-white/10
                    text-slate-900 dark:text-white
                    placeholder-slate-400 dark:placeholder-slate-500
                    focus:border-green-500"
                />
              </div>

              {/* Players section */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
                  Players List
                  {selectedIds.length > 0 && (
                    <span className="ml-2 text-green-500 normal-case font-normal">
                      {selectedIds.length} selected
                    </span>
                  )}
                </label>

                {/* Search + Add row */}
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full py-2.5 rounded-2xl text-sm outline-none transition
                        bg-slate-100 dark:bg-white/8
                        border border-slate-200 dark:border-white/10
                        text-slate-900 dark:text-white
                        placeholder-slate-400 dark:placeholder-slate-500
                        focus:border-green-500"
                      style={{ paddingLeft: "2.25rem" }}
                    />
                  </div>
                  <button
                    onClick={() => setShowAddPlayerModal(true)}
                    className="px-3 py-2.5 rounded-2xl bg-green-500/15 border border-green-500/40 text-green-600 dark:text-green-400 hover:bg-green-500/25 transition-colors font-semibold text-sm shrink-0"
                  >
                    + Add
                  </button>
                </div>

                {/* Player rows */}
                <div className="space-y-2">
                  {availablePlayers.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                      {query ? "No players found" : "No players available"}
                    </p>
                  ) : (
                    availablePlayers.map((player) => {
                      const checked = selectedIds.includes(player.id)
                      return (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => togglePlayer(player.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all
                            ${checked
                              ? "bg-green-500/15 border-green-500/40"
                              : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/8 hover:border-green-500/40"
                            }`}
                        >
                          {/* Checkbox */}
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                            ${checked
                              ? "bg-green-500 border-green-500"
                              : "border-slate-300 dark:border-white/30"
                            }`}>
                            {checked && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <p className={`text-sm font-medium
                            ${checked
                              ? "text-green-700 dark:text-green-400"
                              : "text-slate-900 dark:text-white"
                            }`}>
                            {player.name}
                          </p>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-5 pt-3 pb-5 border-t border-slate-100 dark:border-white/8 space-y-3">
              {error && (
                <p className="text-xs text-red-500 font-medium text-center">{error}</p>
              )}
              <button
                onClick={handleSave}
                className="w-full py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 text-black font-bold text-sm transition-colors"
              >
                Save Team
              </button>
            </div>
          </div>
        </div>
      </Portal>

      {/* Add Player Modal */}
      {showAddPlayerModal && (
        <AddPlayerModal
          onClose={() => setShowAddPlayerModal(false)}
          onPlayerAdded={handlePlayerAdded}
        />
      )}
    </>
  )
}

// ─── Main TeamManager ───────────────────────────────────────────────────────
export default function TeamManager({ teams, allPlayers, onTeamsChange }) {
  const [expandedTeams, setExpandedTeams] = useState(new Set())
  const [showAddTeamModal, setShowAddTeamModal] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)

  const usedPlayerIds = useMemo(
    () => new Set(teams.flatMap((t) => t.playerIds)),
    [teams]
  )

  const toggleExpand = (teamId) => {
    setExpandedTeams((prev) => {
      const next = new Set(prev)
      if (next.has(teamId)) next.delete(teamId)
      else next.add(teamId)
      return next
    })
  }

  const handleSaveTeam = ({ name, playerIds }) => {
    if (editingTeam) {
      onTeamsChange(
        teams.map((t) => (t.id === editingTeam.id ? { ...t, name, playerIds } : t))
      )
    } else {
      onTeamsChange([...teams, { id: `team_${Date.now()}`, name, playerIds }])
    }
    setShowAddTeamModal(false)
    setEditingTeam(null)
  }

  const handleRemoveTeam = (teamId) => {
    onTeamsChange(teams.filter((t) => t.id !== teamId))
  }

  const handleRemovePlayer = (teamId, playerId) => {
    onTeamsChange(
      teams.map((t) =>
        t.id === teamId ? { ...t, playerIds: t.playerIds.filter((p) => p !== playerId) } : t
      )
    )
  }

  return (
    <div className="space-y-3">
      {/* Existing Teams — green-tinted cards */}
      {teams.map((team) => {
        const isExpanded = expandedTeams.has(team.id)
        return (
          <div
            key={team.id}
            className="rounded-2xl border border-green-500/30 bg-green-500/8 overflow-hidden"
          >
            {/* Team Header */}
            <div
              className="flex items-center justify-between cursor-pointer px-4 py-3 hover:bg-green-500/10 transition-colors"
              onClick={() => toggleExpand(team.id)}
            >
              <div className="flex items-center gap-2 flex-1">
                <div className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                  <ChevronDown size={16} className="text-green-500" />
                </div>
                <div>
                  <span className="font-bold text-sm text-green-700 dark:text-green-400">
                    {team.name}
                  </span>
                  <span className="text-xs text-green-700/60 dark:text-green-600 ml-2">
                    ({team.playerIds.length} player{team.playerIds.length !== 1 ? "s" : ""})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Edit */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingTeam(team)
                    setShowAddTeamModal(true)
                  }}
                  className="p-1.5 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors"
                  title="Edit team"
                >
                  <UserPlus size={15} />
                </button>
                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveTeam(team.id)
                  }}
                  className="p-1.5 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                  title="Remove team"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Expanded player list */}
            {isExpanded && (
              <div className="border-t border-green-500/20 px-4 py-3 space-y-1.5">
                {team.playerIds.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-gray-400 italic py-1">
                    No players added yet
                  </p>
                ) : (
                  team.playerIds.map((pid) => {
                    const player = allPlayers.find((p) => p.id === pid)
                    return (
                      <div
                        key={pid}
                        className="flex items-center justify-between bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-xl"
                      >
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                          {player?.name || "Unknown"}
                        </p>
                        <button
                          onClick={() => handleRemovePlayer(team.id, pid)}
                          className="p-1 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Add Team button */}
      <button
        onClick={() => {
          setEditingTeam(null)
          setShowAddTeamModal(true)
        }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-green-500/60 text-green-500 font-semibold text-sm hover:bg-green-500/10 transition-all duration-200"
      >
        <Plus size={18} />
        Add Team
      </button>

      {/* Add / Edit Team modal */}
      {showAddTeamModal && (
        <AddTeamModal
          allPlayers={allPlayers}
          usedPlayerIds={usedPlayerIds}
          editTeam={editingTeam}
          onSave={handleSaveTeam}
          onClose={() => {
            setShowAddTeamModal(false)
            setEditingTeam(null)
          }}
        />
      )}
    </div>
  )
}
