import { useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Trash2, X } from "lucide-react"

import MobileLayout from "../../components/layout/MobileLayout"
import GlassCard from "../../components/common/GlassCard"
import InputField from "../../components/common/InputField"
import PrimaryButton from "../../components/common/PrimaryButton"
import AddBalanceModal from "../../components/player/AddBalanceModal"
import PhotoUpload from "../../components/common/PhotoUpload"
import SportIcon from "../../components/common/SportIcon"
import Modal from "../../components/common/Modal"
import SportPreferencesEditor from "../../components/player/SportPreferencesEditor"
import SportPreferencesDisplay from "../../components/player/SportPreferencesDisplay"
import { useApp } from "../../context/useApp"
import {
  formatCurrency,
  formatDisplayDate,
  formatTime12
} from "../../utils/format"
import { formatPhoneDisplay, formatPhoneInput } from "../../utils/phone"
import { getInitials } from "../../utils/players"

// ── Tabs ─────────────────────────────────────────────────────────────────────

function TabBar({ active, onChange }) {
  const tabs = ["Basic Info", "Sport Preferences"]
  return (
    <div
      className="flex rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className="flex-1 py-2.5 text-sm font-semibold transition-all"
          style={{
            background: active === tab ? "#22c55e" : "transparent",
            color: active === tab ? "#000" : "#94a3b8",
            borderRadius: active === tab ? "0.875rem" : "0",
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EditPlayer() {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    getPlayerById, bookings,
    getTurfById, getSportById,
    updatePlayer, deletePlayer, addBalance
  } = useApp()

  const player = getPlayerById(id)

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("Basic Info")

  // ── Basic Info edit state ──────────────────────────────────────────────────
  const [editing, setEditing]   = useState(false)
  const [name, setName]         = useState(player?.name || "")
  const [phone, setPhone]       = useState(player ? formatPhoneDisplay(player.phone) : "+91 ")
  const [address, setAddress]   = useState(player?.address || "")
  const [photo, setPhoto]       = useState(player?.photo || null)

  // ── Sport preferences edit state ───────────────────────────────────────────
  const [sportPrefs, setSportPrefs] = useState(player?.sportPreferences || [])
  const [prefsDirty, setPrefsDirty] = useState(false)

  // ── Other state ────────────────────────────────────────────────────────────
  const [balanceModalOpen, setBalanceModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [error, setError] = useState("")

  const playerBookings = useMemo(
    () => bookings.filter((b) => b.playerIds?.includes(id)),
    [bookings, id]
  )

  if (!player) {
    return (
      <MobileLayout hideFab>
        <div className="p-5 text-center text-slate-500">Player not found.</div>
      </MobileLayout>
    )
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSaveProfile = () => {
    if (!name.trim())               { setError("Please fill player name"); return }
    if (!phone || phone === "+91 ") { setError("Please fill mobile number"); return }
    if (!address.trim())            { setError("Please fill address"); return }

    const result = updatePlayer(id, { name, phone, address, photo })
    if (!result.ok) { setError(result.error); return }
    setEditing(false)
    setError("")
  }

  const handleCancelEdit = () => {
    setName(player?.name || "")
    setPhone(player ? formatPhoneDisplay(player.phone) : "+91 ")
    setAddress(player?.address || "")
    setPhoto(player?.photo || null)
    setEditing(false)
    setError("")
  }

  const handleSavePrefs = () => {
    updatePlayer(id, { sportPreferences: sportPrefs })
    setPrefsDirty(false)
    setError("")
  }

  const handleRevertPrefs = () => {
    setSportPrefs(player?.sportPreferences || [])
    setPrefsDirty(false)
  }

  const handleDeletePlayer = () => {
    const result = deletePlayer(id)
    if (result.ok) { setDeleteConfirmOpen(false); navigate("/players") }
    else setError(result.error)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <MobileLayout hideFab>
      <div className="pt-2 px-5 pb-5 space-y-4 animate-fade-in-up">

        {/* ── Profile header card ─────────────────────────────────────────── */}
        <GlassCard className="space-y-4">
          {!editing ? (
            /* View mode */
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-green-500 text-black flex items-center justify-center text-xl font-bold shrink-0">
                  {player.photo
                    ? <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                    : getInitials(player.name)
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{player.name}</h1>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{formatPhoneDisplay(player.phone)}</p>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">{player.address || "No address added"}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="w-10 h-10 rounded-xl bg-green-500/15 text-green-500 flex items-center justify-center hover:bg-green-500/25 transition-all"
                  title="Edit player"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                  </svg>
                </button>
                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center hover:bg-red-500/25 transition-all"
                  title="Delete player"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* Edit mode */
            <div className="space-y-5 transition-all duration-300">
              <div className="flex justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center hover:bg-red-500/25 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col items-center gap-2 py-3">
                <PhotoUpload name={name} photo={photo} onPhotoChange={setPhoto} size="large" />
              </div>
              <div className="space-y-4">
                <InputField label="Name"   value={name}    onChange={(e) => setName(e.target.value)} />
                <InputField label="Mobile" value={phone}   onChange={(e) => setPhone(formatPhoneInput(e.target.value))} />
                <InputField label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-3 rounded-xl bg-green-500/15 text-green-500 border border-green-500/30 font-semibold text-sm hover:bg-green-500/25 transition-all"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-3 rounded-xl bg-red-500/15 text-red-500 border border-red-500/30 font-semibold text-sm hover:bg-red-500/25 transition-all"
                >
                  Revert
                </button>
              </div>
            </div>
          )}
        </GlassCard>

        {/* ── Stats grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <GlassCard>
            <p className="text-xs text-slate-500 dark:text-gray-400">Total Bookings</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">{playerBookings.length}</p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs text-slate-500 dark:text-gray-400">Total Balance</p>
            <p className={`text-2xl font-bold mt-1 ${
              player.balance < 0 ? "text-red-600 dark:text-red-500"
              : player.balance < 300 ? "text-orange-500 dark:text-orange-400"
              : "text-green-700 dark:text-green-400"
            }`}>
              {formatCurrency(player.balance)}
            </p>
          </GlassCard>
        </div>

        <button
          onClick={() => setBalanceModalOpen(true)}
          className="w-full py-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 font-semibold hover:bg-green-500/20 transition-colors"
        >
          Add Balance
        </button>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <TabBar active={activeTab} onChange={setActiveTab} />

        {/* ── Basic Info tab: Sport Preferences display ────────────────── */}
        {activeTab === "Basic Info" && (
          <GlassCard className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏅</span>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Sport Preferences</h2>
            </div>
            <SportPreferencesDisplay prefs={player.sportPreferences || []} />
          </GlassCard>
        )}

        {/* ── Basic Info tab: Booking History ──────────────────────────── */}
        {activeTab === "Basic Info" && (
          <GlassCard className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Booking History</h2>

            {player.history.map((item) => {
              const turf  = getTurfById(item.turfId)
              const sport = getSportById(item.sportId)
              const tone  =
                item.type === "credit" ? "text-green-700 dark:text-green-400"
                : item.type === "debit" ? "text-red-600 dark:text-red-400"
                : "text-orange-500 dark:text-orange-400"

              return (
                <div
                  key={item.id}
                  className="rounded-2xl p-3 bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      <SportIcon sportId={sport?.id} sportName={sport?.name} size={18} />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {item.bookingId || "Balance"} • {sport?.name || "Top-up"}
                        </p>
                        <p className="text-xs text-slate-500">{turf?.name || "—"} • {formatDisplayDate(item.date)}</p>
                        <p className="text-xs text-slate-500">{formatTime12(item.startTime)}</p>
                      </div>
                    </div>
                    <p className={`font-semibold ${tone}`}>
                      {item.type === "credit" ? "+" : "-"}{formatCurrency(item.amount)}
                    </p>
                  </div>
                </div>
              )
            })}

            {!player.history.length && (
              <p className="text-sm text-slate-500">No transactions yet.</p>
            )}
          </GlassCard>
        )}

        {/* ── Sport Preferences tab ────────────────────────────────────── */}
        {activeTab === "Sport Preferences" && (
          <div className="space-y-4">
            <SportPreferencesEditor
              prefs={sportPrefs}
              onChange={(newPrefs) => { setSportPrefs(newPrefs); setPrefsDirty(true) }}
            />

            {/* Save / Revert */}
            <button
              type="button"
              onClick={handleSavePrefs}
              className="w-full py-4 rounded-2xl font-bold text-[15px] transition-colors"
              style={{ background: "#22c55e", color: "#000" }}
            >
              Save
            </button>

            {prefsDirty && (
              <button
                type="button"
                onClick={handleRevertPrefs}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all"
                style={{
                  border: "1px solid rgba(239,68,68,0.4)",
                  color: "#f87171",
                  background: "rgba(239,68,68,0.06)",
                }}
              >
                Revert Changes
              </button>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </div>

      <AddBalanceModal
        open={balanceModalOpen}
        onClose={() => setBalanceModalOpen(false)}
        playerName={player.name}
        onSubmit={(payload) => addBalance(id, payload)}
      />

      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Player"
        className="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-slate-700 dark:text-gray-300">
            Are you sure you want to delete <strong>{player.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setDeleteConfirmOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-200/50 dark:bg-white/10 text-slate-700 dark:text-gray-300 font-medium text-sm hover:bg-slate-300/50 dark:hover:bg-white/15 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDeletePlayer}
              className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-all"
            >
              Delete Player
            </button>
          </div>
        </div>
      </Modal>
    </MobileLayout>
  )
}
