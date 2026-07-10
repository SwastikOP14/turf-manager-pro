import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Trophy, Plus, Trash2, X, Users } from "lucide-react"
import MobileLayout from "../../components/layout/MobileLayout"
import GlassCard from "../../components/common/GlassCard"
import PlayerAvatar from "../../components/common/PlayerAvatar"
import ConfirmDialog from "../../components/common/ConfirmDialog"
import { getSportMeta } from "../../constants/sportPreferences"
import { useApp } from "../../context/useApp"
import { useHaptics } from "../../context/HapticsContext"
import { formatCurrency } from "../../utils/format"
import { formatPhoneDisplay } from "../../utils/phone"
import { createPortal } from "react-dom"
import { useEffect, useCallback } from "react"
import { useModalBackHandler } from "../../hooks/useModalBackHandler"
import { useTheme } from "../../context/useTheme"

function DetailRow({ label, value }) {
  if (!value && value !== false) return null
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-slate-800 dark:text-white font-medium">{String(value)}</span>
    </div>
  )
}

function SportDetailBlock({ pref }) {
  switch (pref.sportId) {
    case "cricket":
      return (
        <div className="space-y-2">
          <DetailRow label="Batting Hand" value={pref.battingHand === "R" ? "Right Hand" : "Left Hand"} />
          <DetailRow label="Batting Position" value={pref.battingPosition} />
          <DetailRow label="Bowling Hand" value={pref.bowlingHand === "R" ? "Right Arm" : "Left Arm"} />
          <DetailRow label="Bowling Type" value={pref.bowlingType} />
          <DetailRow label="Wicket Keeper" value={pref.wicketKeeper ? "Yes" : "No"} />
        </div>
      )
    case "football":
      return (
        <div className="space-y-2">
          <DetailRow label="Preferred Foot" value={pref.preferredFoot === "R" ? "Right Foot" : "Left Foot"} />
          <DetailRow label="Position" value={pref.position} />
          <DetailRow label="Goal Keeper" value={pref.goalKeeper ? "Yes" : "No"} />
        </div>
      )
    case "badminton":
    case "tennis":
    case "hockey":
    case "tabletennis":
      return (
        <div className="space-y-2">
          <DetailRow label="Playing Hand" value={pref.playingHand === "R" ? "Right Hand" : "Left Hand"} />
          <DetailRow label="Position" value={pref.position} />
        </div>
      )
    case "basketball":
    case "volleyball":
      return (
        <div className="space-y-2">
          <DetailRow label="Position" value={pref.position} />
        </div>
      )
    default:
      return null
  }
}
function AddAchievementModal({ onClose, onSubmit, darkMode }) {
  const [achTitle, setAchTitle] = useState("")
  const [achDescription, setAchDescription] = useState("")
  const [achDate, setAchDate] = useState("")
  const [achError, setAchError] = useState("")

  useEffect(() => {
    document.body.classList.add("modal-open")
    return () => document.body.classList.remove("modal-open")
  }, [])

  useModalBackHandler(onClose)

  const handleSubmit = () => {
    if (!achTitle.trim()) { setAchError("Please enter a title"); return }
    onSubmit({
      id: `ach-${Date.now()}`,
      title: achTitle.trim(),
      description: achDescription.trim(),
      date: achDate || new Date().toISOString().slice(0, 10),
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-5"
      style={{ zIndex: 99999, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: darkMode ? "#111827" : "#ffffff",
          border: darkMode ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-lg">Add Achievement</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Add a milestone or award</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0"
          >
            <X size={17} />
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 pb-5 space-y-3">
          <input
            type="text"
            value={achTitle}
            onChange={(e) => { setAchTitle(e.target.value); setAchError("") }}
            placeholder="Title (e.g., Best Defender)"
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
            style={{
              background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              border: darkMode ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.12)",
              color: darkMode ? "#fff" : "#0f172a",
            }}
          />
          <textarea
            value={achDescription}
            onChange={(e) => setAchDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none"
            style={{
              background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              border: darkMode ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.12)",
              color: darkMode ? "#fff" : "#0f172a",
            }}
          />
          <input
            type="date"
            value={achDate}
            onChange={(e) => setAchDate(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
            style={{
              background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              border: darkMode ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.12)",
              color: darkMode ? "#fff" : "#0f172a",
            }}
          />

          {achError && (
            <p className="text-sm text-red-500 font-medium">{achError}</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-2xl bg-green-500 text-black font-bold text-[15px] mt-1"
          >
            Add Achievement
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
export default function SquadPlayerDetail() {
  const { squadId, playerId } = useParams()
  const navigate = useNavigate()
  const haptics = useHaptics()
  const { darkMode } = useTheme()
  const { getPlayerById, getSquadById, bookings, contributeToSquad, updatePlayer } = useApp()

  const player = getPlayerById(playerId)
  const squad = getSquadById(squadId)

  const [balanceModalOpen, setBalanceModalOpen] = useState(false)
  const [contributeAmount, setContributeAmount] = useState("")
  const [contributeError, setContributeError] = useState("")

  const [addAchievementOpen, setAddAchievementOpen] = useState(false)
  const [deleteAchId, setDeleteAchId] = useState(null)
  const [showAllContributions, setShowAllContributions] = useState(false)

  // Registers the native hardware back button to dismiss the contribute modal [1.1.8]
  useModalBackHandler(balanceModalOpen ? () => setBalanceModalOpen(false) : null)

  const playerSquadBookings = useMemo(() => {
    if (!player) return []
    return bookings.filter((b) => {
      if (b.bookingType !== "Team" || !b.teams?.length) return false
      return b.teams.some(
        (team) =>
          team.playerIds?.includes(player.id) &&
          !team.excludedPlayerIds?.includes(player.id)
      )
    })
  }, [bookings, player])

  const totalContribution = useMemo(() => {
    if (!squad || !player) return 0
    return (squad.contributions || [])
      .filter((c) => c.playerId === player.id && !c.bookingId && c.amount > 0)
      .reduce((sum, c) => sum + c.amount, 0)
  }, [squad, player])

  const achievements = player?.achievements || []

  if (!player || !squad) {
    return (
      <MobileLayout hideFab>
        <div className="p-5 text-center text-slate-500">Player or squad not found.</div>
      </MobileLayout>
    )
  }

  const handleAddAchievement = (newAch) => {
    updatePlayer(player.id, { achievements: [newAch, ...achievements] })
    haptics.trigger([10, 30, 10])
    setAddAchievementOpen(false)
  }

  const handleDeleteAchievement = () => {
    updatePlayer(player.id, { achievements: achievements.filter((a) => a.id !== deleteAchId) })
    haptics.trigger([15, 50, 15])
    setDeleteAchId(null)
  }

  const formatDate = (d) => {
    if (!d) return ""
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  }

  const contributionHistory = useMemo(() => {
    if (!squad || !player) return []
    return (squad.contributions || [])
      .filter((c) => c.playerId === player.id && c.amount > 0)
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
  }, [squad, player])

  const visibleContributions = showAllContributions
    ? contributionHistory
    : contributionHistory.slice(0, 4)

  return (
    <MobileLayout hideFab>
      <div className="pt-3 px-4 pb-24 space-y-3 animate-fade-in-up">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 dark:text-white leading-tight">Player Details</h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">View player information and activity</p>
          </div>
        </div>

        {/* Profile */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <PlayerAvatar player={player} size={56} />
            <div className="flex-1 min-w-0">
              <h2 className="text-[18px] font-bold text-slate-900 dark:text-white truncate">{player.name}</h2>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">{formatPhoneDisplay(player.phone)}</p>
              {player.address && (
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">{player.address}</p>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="p-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Total Bookings</p>
            <p className="text-[19px] font-bold text-green-700 dark:text-green-400 mt-0.5">{playerSquadBookings.length}</p>
          </GlassCard>
          <GlassCard className="p-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Total Contribution</p>
            <p className="text-[19px] font-bold text-green-700 dark:text-green-400 mt-0.5">{formatCurrency(totalContribution)}</p>
          </GlassCard>
        </div>

        <button
          onClick={() => { haptics.trigger(10); setBalanceModalOpen(true); }}
          className="w-full py-3.5 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 font-semibold hover:bg-green-500/20 transition-colors"
        >
          Contribute
        </button>

        {/* Sport Preferences — flat, no tabs, no accordion */}
        <GlassCard className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[15px]">🏅</span>
            <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">Sport Preferences</h2>
          </div>
          {(player.sportPreferences || []).length > 0 ? (
            <div className="space-y-3">
              {player.sportPreferences.map((pref) => {
                const meta = getSportMeta(pref.sportId)
                return (
                  <div key={pref.sportId} className="pb-3 border-b last:border-b-0 border-black/5 dark:border-white/8 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[16px]">{meta.emoji}</span>
                      <span className="font-bold text-slate-900 dark:text-white text-[14px]">{meta.name}</span>
                    </div>
                    <SportDetailBlock pref={pref} />
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">No sport preferences added yet.</p>
          )}
        </GlassCard>

        {/* Achievements */}
        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" />
              <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">Achievements</h2>
            </div>
            <button
              type="button"
              onClick={() => { haptics.trigger(8); setAddAchievementOpen(true) }}
              className="text-[13px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {achievements.length > 0 ? (
            <div className="space-y-2">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-amber-500/8 border border-amber-500/20"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                    <Trophy size={16} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-slate-900 dark:text-white">{ach.title}</p>
                    {ach.description && (
                      <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-0.5">{ach.description}</p>
                    )}
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{formatDate(ach.date)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { haptics.trigger(8); setDeleteAchId(ach.id) }}
                    className="w-7 h-7 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">No achievements added yet.</p>
          )}
        </GlassCard>

        {/* Contribution History (Styled exactly like Payment History) */}
        {contributionHistory.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">
                Contribution History ({contributionHistory.length})
              </h2>
              {contributionHistory.length > 4 && (
                <button
                  type="button"
                  onClick={() => setShowAllContributions((v) => !v)}
                  className="text-sm font-semibold text-green-600 dark:text-green-400"
                >
                  {showAllContributions ? "See Few" : "See All"}
                </button>
              )}
            </div>

            <div className="space-y-2">
              {visibleContributions.map((c, i) => (
                <GlassCard key={c.id || i} style={{ padding: "14px 16px" }}>
                  <div className="flex items-center justify-between gap-3">
                    {/* Icon Container (Using Users icon matching target layout) */}
                    <div style={{
                      width: "38px", height: "38px", borderRadius: "10px",
                      background: "rgba(16,185,129,0.1)", display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Users size={18} style={{ color: "#10b981" }} />
                    </div>

                    {/* Information */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white">
                        Squad Contribution
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {formatDate(c.date || c.createdAt)}
                      </p>
                    </div>

                    {/* Amount */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                      <p className="text-base font-bold text-green-600 dark:text-green-400">
                        +{formatCurrency(c.amount)}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

      </div> {/* <-- This closes the main grid container with pb-24 class */}

      {/* Contribution Dialog / Modal */}
      {balanceModalOpen && (
        <div
          className="fixed inset-0 z-99999 flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}
          onClick={() => setBalanceModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0f172a] p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white">
                Contribute to {squad.name}
              </h2>
              <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-1 font-normal">
                {player.name} · Personal balance:{" "}
                <span className={player.balance >= 0 ? "text-green-600" : "text-red-500"}>
                  {formatCurrency(player.balance)}
                </span>
              </p>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "var(--bg-card)", border: "1.5px solid var(--bg-border)",
              borderRadius: "12px", padding: "0 14px", height: "52px",
            }}>
              <span className="text-slate-500 font-semibold">₹</span>
              <input
                type="number"
                value={contributeAmount}
                onChange={(e) => { setContributeAmount(e.target.value); setContributeError("") }}
                placeholder="Enter amount to contribute"
                style={{ flex: 1, background: "transparent", outline: "none", fontSize: "16px", color: "var(--text-primary)", border: "none" }}
              />
            </div>
            {contributeError && <p className="text-sm text-red-500 font-medium">{contributeError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setBalanceModalOpen(false)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-semibold text-sm">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const result = contributeToSquad(squad.id, player.id, Number(contributeAmount))
                  if (!result.ok) { setContributeError(result.error); return }
                  haptics.trigger([10, 30, 10])
                  setBalanceModalOpen(false)
                  setContributeAmount("")
                }}
                className="px-4 py-2.5 rounded-2xl bg-green-600 text-white font-semibold text-sm"
              >
                Contribute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Achievement Modal */}
      {addAchievementOpen && (
        <AddAchievementModal
          darkMode={darkMode}
          onClose={() => setAddAchievementOpen(false)}
          onSubmit={handleAddAchievement}
        />
      )}

      {/* Delete Achievement Dialog */}
      {deleteAchId && (
        <ConfirmDialog
          isOpen={!!deleteAchId}
          onClose={() => setDeleteAchId(null)}
          onConfirm={handleDeleteAchievement}
          title="Delete Achievement"
          message="Are you sure you want to delete this achievement?"
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}

    </MobileLayout>
  )
}