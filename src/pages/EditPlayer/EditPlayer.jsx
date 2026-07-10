import { useMemo, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { useParams, useNavigate } from "react-router-dom"
import { Trash2, X, User, Users, Wallet } from "lucide-react"
import MobileLayout from "../../components/layout/MobileLayout"
import GlassCard from "../../components/common/GlassCard"
import InputField from "../../components/common/InputField"
import AddBalanceModal from "../../components/player/AddBalanceModal"
import PhotoUpload from "../../components/common/PhotoUpload"
import Modal from "../../components/common/Modal"
import SportPreferencesEditor from "../../components/player/SportPreferencesEditor"
import SportPreferencesDisplay from "../../components/player/SportPreferencesDisplay"
import PlayerAvatar from "../../components/common/PlayerAvatar"
import { useApp } from "../../context/useApp"
import { formatCurrency, formatDisplayDate } from "../../utils/format"
import { formatPhoneDisplay, formatPhoneInput } from "../../utils/phone"
import { getInitials } from "../../utils/players"

function TabBar({ active, onChange }) {
  const tabs = ["Basic Info", "Sport Preferences"]
  return (
    <div className="flex rounded-2xl overflow-hidden bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
      {tabs.map((tab) => (
        <button key={tab} type="button" onClick={() => onChange(tab)}
          className={`flex-1 py-2.5 text-[14px] font-semibold transition-all rounded-xl m-1
            ${active === tab
              ? "bg-green-600 text-white"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}>
          {tab}
        </button>
      ))}
    </div>
  )
}

export default function EditPlayer() {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    getPlayerById, bookings, squads,
    getTurfById, getSportById,
    updatePlayer, deletePlayer, addBalance
  } = useApp()

  const player = getPlayerById(id)

  const [activeTab, setActiveTab] = useState("Basic Info")
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(player?.name || "")
  const [phone, setPhone] = useState(player ? formatPhoneDisplay(player.phone) : "+91 ")
  const [address, setAddress] = useState(player?.address || "")
  const [photo, setPhoto] = useState(player?.photo || null)
  const [sportPrefs, setSportPrefs] = useState(player?.sportPreferences || [])
  const [prefsDirty, setPrefsDirty] = useState(false)
  const [showAllHistory, setShowAllHistory] = useState(false)
  const [showAllBookings, setShowAllBookings] = useState(false)
  const [balanceModalOpen, setBalanceModalOpen] = useState(false)
  const [editTopUpOpen, setEditTopUpOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [editAmount, setEditAmount] = useState("")
  const [editError, setEditError] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [error, setError] = useState("")
  const [historyFilter, setHistoryFilter] = useState("All") // "All", "Personal", "Squad"
  const [bookingFilter, setBookingFilter] = useState("All") // "All", "Individual", "Squad"
  const phoneInputRef = useRef(null)
  // Bookings this player took part in — either as an Individual booking,
  // or via a Squad they're a member of (and not excluded from that booking).
  const playerBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (b.bookingType === "Individual" || (!b.bookingType && b.playerIds?.length)) {
        return b.playerIds?.includes(id)
      }
      if (b.bookingType === "Team" && b.teams?.length) {
        return b.teams.some(
          (team) =>
            team.playerIds?.includes(id) &&
            !team.excludedPlayerIds?.includes(id)
        )
      }
      return false
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [bookings, id])

  // Filter bookings dynamically based on active filter button
  const filteredBookings = useMemo(() => {
    if (bookingFilter === "Individual") {
      return playerBookings.filter(
        (b) => b.bookingType === "Individual" || (!b.bookingType && b.playerIds?.length)
      )
    }
    if (bookingFilter === "Squad") {
      return playerBookings.filter((b) => b.bookingType === "Team")
    }
    return playerBookings
  }, [playerBookings, bookingFilter])

  // Payment history = only balance events (top-ups, squad contributions)
  // Never includes booking-debit entries.
  const paymentHistory = useMemo(() => {
    return player.history
      .filter((h) => h.notes === "Balance added" || h.notes === "Squad contribution")
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
  }, [player.history])

  // Filter history dynamically based on active filter button
  const filteredHistory = useMemo(() => {
    if (historyFilter === "Personal") {
      return paymentHistory.filter((h) => h.notes === "Balance added")
    }
    if (historyFilter === "Squad") {
      return paymentHistory.filter((h) => h.notes === "Squad contribution")
    }
    return paymentHistory
  }, [paymentHistory, historyFilter])

  if (!player) {
    return (
      <MobileLayout hideFab>
        <div className="p-5 text-center text-slate-500">Player not found.</div>
      </MobileLayout>
    )
  }

  const handleSaveProfile = () => {
    try {
      if (!name.trim()) { setError("Please fill player name"); return }
      if (!phone || phone === "+91 ") { setError("Please fill mobile number"); return }
      if (!address.trim()) { setError("Please fill address"); return }
      const result = updatePlayer(id, { name, phone, address, photo })
      if (!result.ok) { setError(result.error); return }
      setEditing(false)
      setError("")
    } catch (error) {
      console.error('Error saving player:', error)
      setError('Failed to save player. Please try again.')
    }
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

  return (
    <MobileLayout hideFab>
      <div className="pt-3 px-4 pb-24 space-y-3 animate-fade-in-up">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 dark:text-white leading-tight">Edit Player</h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Update player information</p>
          </div>
        </div>

        {/* Profile header */}
        <GlassCard className="space-y-4">
          {!editing ? (
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <PlayerAvatar player={player} size={48} />
                <div className="flex-1 min-w-0">
                  <h1 className="text-[17px] font-bold text-slate-900 dark:text-white">{player.name}</h1>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">{formatPhoneDisplay(player.phone)}</p>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">{player.address || "No address added"}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => setEditing(true)}
                  className="w-10 h-10 rounded-xl bg-green-500/15 text-green-500 flex items-center justify-center hover:bg-green-500/25 transition-all active:scale-95">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>
                <button onClick={() => setDeleteConfirmOpen(true)}
                  className="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center hover:bg-red-500/25 transition-all active:scale-95">
                  <Trash2 size={18} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 transition-all duration-300">
              <div className="flex flex-col items-center py-2">
                <PhotoUpload name={name} photo={photo} onPhotoChange={setPhoto} size="medium" />
              </div>
              <div className="space-y-4">
                <InputField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <InputField
                  ref={phoneInputRef}
                  label="Mobile"
                  value={phone}
                  onChange={(e) => {
                    const input = e.target
                    const prevCursor = input.selectionStart
                    const digitsBeforeCursor = input.value.slice(0, prevCursor).replace(/\D/g, "").length

                    const formatted = formatPhoneInput(input.value)
                    setPhone(formatted)
                    setError("")

                    requestAnimationFrame(() => {
                      if (!phoneInputRef.current) return
                      // "+91 " is always 4 characters, then digits, with one extra space after the 5th digit
                      let newPos = 4 + digitsBeforeCursor
                      if (digitsBeforeCursor > 5) newPos += 1
                      newPos = Math.min(newPos, formatted.length)
                      phoneInputRef.current.setSelectionRange(newPos, newPos)
                    })
                  }}
                />
                <InputField label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="flex items-center justify-center gap-4">
                <button onClick={handleSaveProfile}
                  className="px-6 py-3 rounded-2xl bg-green-600 text-white font-semibold hover:bg-green-700 active:scale-97 transition-all">
                  Save
                </button>
                <button onClick={handleCancelEdit}
                  className="px-6 py-3 rounded-2xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-white/5 active:scale-97 transition-all">
                  Revert
                </button>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <GlassCard className="p-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Total Bookings</p>
            <p className="text-[19px] font-bold text-green-700 dark:text-green-400 mt-0.5">{playerBookings.length}</p>
          </GlassCard>
          <GlassCard className="p-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Total Balance</p>
            <p className={`text-[19px] font-bold mt-0.5 ${player.balance < 0 ? "text-red-600 dark:text-red-500" : player.balance < 300 ? "text-orange-500 dark:text-orange-400" : "text-green-700 dark:text-green-400"}`}>
              {formatCurrency(player.balance)}
            </p>
          </GlassCard>
        </div>

        <button onClick={() => setBalanceModalOpen(true)}
          className="w-full py-3.5 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 font-semibold hover:bg-green-500/20 transition-colors">
          Add Balance
        </button>

        <TabBar active={activeTab} onChange={setActiveTab} />

        {/* Sport Preferences display */}
        {activeTab === "Basic Info" && (
          <GlassCard className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[18px]">🏅</span>
              <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">Sport Preferences</h2>
            </div>
            <SportPreferencesDisplay prefs={player.sportPreferences || []} />
          </GlassCard>
        )}


        {/* Booking History */}
        {activeTab === "Basic Info" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">
                Booking History ({filteredBookings.length})
              </h2>
              <div className="flex items-center gap-3">
                {/* Segment Filter (Left of See All button) */}
                <div className="flex rounded-lg overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 p-0.5 text-[11px] font-semibold">
                  {["All", "Individual", "Squad"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setBookingFilter(f)}
                      className={`px-2 py-0.5 transition-all rounded-md ${bookingFilter === f
                        ? "bg-green-600 text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-955 dark:hover:text-slate-200"
                        }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {filteredBookings.length > 3 && (
                  <button
                    onClick={() => setShowAllBookings(!showAllBookings)}
                    className="text-[14px] font-semibold text-green-600 dark:text-green-400 bg-none border-none cursor-pointer"
                  >
                    {showAllBookings ? "See Few" : "See All"}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {(showAllBookings ? filteredBookings : filteredBookings.slice(0, 3)).map((booking) => {
                const turf = getTurfById(booking.turfId)
                const sport = getSportById(booking.sportId)

                let shareAmount = 0
                let squadName = null
                const isIndividual = booking.bookingType === "Individual" || (!booking.bookingType && booking.playerIds?.length)

                if (isIndividual) {
                  shareAmount = booking.playerIds?.length > 0
                    ? booking.amount / booking.playerIds.length
                    : 0
                } else if (booking.bookingType === "Team" && booking.teams?.length) {
                  const myTeam = booking.teams.find((t) => t.playerIds?.includes(id))
                  if (myTeam) {
                    const activeCount = (myTeam.playerIds || []).filter(
                      (pid) => !myTeam.excludedPlayerIds?.includes(pid)
                    ).length
                    const numSquads = booking.teams.length
                    const costPerSquad = numSquads > 0 ? booking.amount / numSquads : 0
                    shareAmount = activeCount > 0 ? costPerSquad / activeCount : 0
                    squadName = myTeam.name
                  }
                }

                // Differentiate styles: Blue for Individual Booking, Purple for Squad Booking
                const iconBg = isIndividual ? "rgba(59,130,246,0.1)" : "rgba(139,92,246,0.1)"
                const iconColor = isIndividual ? "#3b82f6" : "#8b5cf6"

                return (
                  <GlassCard key={booking.id} style={{ padding: "14px 16px" }}>
                    <div className="flex items-center justify-between gap-3">
                      <div style={{
                        width: "38px", height: "38px", borderRadius: "10px",
                        background: iconBg, display: "flex",
                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        {isIndividual ? (
                          <User size={18} style={{ color: iconColor }} />
                        ) : (
                          <Users size={18} style={{ color: iconColor }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-900 dark:text-white">
                          {isIndividual ? "Individual Booking" : "Squad Booking"} • {booking.id}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {turf?.name || "—"} • {formatDisplayDate(booking.date)}
                        </p>
                        {squadName && (
                          <p className="text-xs font-semibold mt-1" style={{ color: "var(--brand)" }}>
                            🏟 {squadName}
                          </p>
                        )}
                      </div>
                      <p className="text-base font-bold text-red-500">
                        -{formatCurrency(shareAmount)}
                      </p>
                    </div>
                  </GlassCard>
                )
              })}

              {playerBookings.length === 0 && (
                <GlassCard style={{ padding: "32px 24px", textAlign: "center" }}>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No bookings yet.</p>
                </GlassCard>
              )}
            </div>
          </div>
        )}

        {/* Payment History */}
        {activeTab === "Basic Info" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">
                Payment History ({filteredHistory.length})
              </h2>
              <div className="flex items-center gap-3">
                {/* Segment Filter (Left of See All button) */}
                <div className="flex rounded-lg overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 p-0.5 text-[11px] font-semibold">
                  {["All", "Personal", "Squad"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setHistoryFilter(f)}
                      className={`px-2 py-0.5 transition-all rounded-md ${historyFilter === f
                        ? "bg-green-600 text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200"
                        }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {filteredHistory.length > 4 && (
                  <button
                    onClick={() => setShowAllHistory(!showAllHistory)}
                    className="text-sm font-semibold text-green-600 dark:text-green-400"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    {showAllHistory ? "See Few" : "See All"}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {(showAllHistory ? filteredHistory : filteredHistory.slice(0, 4)).map((item) => {
                const isTopUp = item.notes === "Balance added"
                const matchedSquad = !isTopUp
                  ? squads.find((sq) => (sq.contributions || []).some(
                    (c) => c.playerId === id &&
                      c.amount === item.amount &&
                      (c.date === item.date || (c.date && item.date && new Date(c.date).toDateString() === new Date(item.date).toDateString()))
                  ))
                  : null

                const title = isTopUp ? "Personal Top-up" : `${matchedSquad?.name || "Squad"} Contribution`
                const subtitle = isTopUp
                  ? `${item.paymentMode || ""}${item.paymentMode ? " • " : ""}${formatDisplayDate(item.date)}`
                  : formatDisplayDate(item.date)

                // Differentiate styles: Cyan for Personal Top-up, Green for Squad Contribution
                const iconBg = isTopUp ? "rgba(6,182,212,0.1)" : "rgba(16,185,129,0.1)"
                const iconColor = isTopUp ? "#06b6d4" : "#10b981"
                const amountClass = isTopUp ? "text-cyan-600 dark:text-cyan-400" : "text-green-600 dark:text-green-400"

                return (
                  <GlassCard key={item.id} style={{ padding: "14px 16px" }}>
                    <div className="flex items-center justify-between gap-3">
                      <div style={{
                        width: "38px", height: "38px", borderRadius: "10px",
                        background: iconBg, display: "flex",
                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        {isTopUp ? (
                          <Wallet size={18} style={{ color: iconColor }} />
                        ) : (
                          <Users size={18} style={{ color: iconColor }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-900 dark:text-white">{title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                        <p className={`text-base font-bold ${amountClass}`}>
                          +{formatCurrency(item.amount)}
                        </p>
                        {isTopUp && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditItem(item)
                              setEditAmount(String(item.amount))
                              setEditError("")
                              setEditTopUpOpen(true)
                            }}
                            style={{ fontSize: "11px", fontWeight: 700, color: "var(--brand)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                )
              })}

              {paymentHistory.length === 0 && (
                <GlassCard style={{ padding: "32px 24px", textAlign: "center" }}>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No payments yet.</p>
                </GlassCard>
              )}
            </div>
          </div>
        )}
        {/* Sport Preferences tab */}
        {activeTab === "Sport Preferences" && (
          <div className="space-y-4">
            <SportPreferencesEditor
              prefs={sportPrefs}
              onChange={(newPrefs) => { setSportPrefs(newPrefs); setPrefsDirty(true) }}
            />
            <button type="button" onClick={handleSavePrefs}
              className="w-full py-4 rounded-2xl font-bold text-[15px] transition-colors"
              style={{ background: "#22c55e", color: "#000" }}>
              Save
            </button>
            {prefsDirty && (
              <button type="button" onClick={handleRevertPrefs}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all"
                style={{ border: "1px solid rgba(239,68,68,0.4)", color: "#f87171", background: "rgba(239,68,68,0.06)" }}>
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

      {/* Edit Top-up Modal */}
      {editTopUpOpen && editItem && createPortal(
        <div
          className="fixed inset-0 z-99999 flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}
          onClick={() => { setEditTopUpOpen(false); setEditItem(null); }}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0f172a] p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white">
                Edit Top-up Amount
              </h2>
              <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-1 font-normal">
                {player.name} · Current amount: <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(editItem.amount)}</span>
              </p>
            </div>

            {/* Input Box Container (Adjusted styles for absolute dark-theme visibility) */}
            <div className="flex items-center gap-2 rounded-xl px-3.5 h-[52px] bg-black/4 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <span className="text-slate-500 font-semibold">₹</span>
              <input
                type="number"
                value={editAmount}
                onChange={(e) => { setEditAmount(e.target.value); setEditError("") }}
                placeholder="Enter new amount"
                style={{ flex: 1, background: "transparent", outline: "none", fontSize: "16px", border: "none" }}
                className="text-slate-900 dark:text-white"
              />
            </div>

            {editError && <p className="text-sm text-red-500 font-medium">{editError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setEditTopUpOpen(false); setEditItem(null); }}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const parsed = Number(editAmount)
                  if (isNaN(parsed) || parsed < 0 || editAmount.trim() === "") {
                    setEditError("Enter a valid amount")
                    return
                  }
                  const diff = parsed - editItem.amount
                  updatePlayer(id, {
                    balance: player.balance + diff,
                    history: player.history.map(h => h.id === editItem.id ? { ...h, amount: parsed } : h)
                  })
                  setEditTopUpOpen(false)
                  setEditItem(null)
                }}
                className="px-4 py-2.5 rounded-2xl bg-green-600 text-white font-semibold text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title="Delete Player" className="max-w-sm">
        <div className="space-y-4">
          <p className="text-slate-700 dark:text-gray-300">
            Are you sure you want to delete <strong>{player.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleteConfirmOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-200/50 dark:bg-white/10 text-slate-700 dark:text-gray-300 font-medium text-sm hover:bg-slate-300/50 dark:hover:bg-white/15 transition-all">
              Cancel
            </button>
            <button onClick={handleDeletePlayer}
              className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-all">
              Delete Player
            </button>
          </div>
        </div>
      </Modal>
    </MobileLayout>
  )
}