import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Check, X } from "lucide-react"

import MobileLayout from "../../components/layout/MobileLayout"
import GlassCard from "../../components/common/GlassCard"
import InputField from "../../components/common/InputField"
import PrimaryButton from "../../components/common/PrimaryButton"
import AddBalanceModal from "../../components/player/AddBalanceModal"
import PhotoUpload from "../../components/common/PhotoUpload"
import SportIcon from "../../components/common/SportIcon"
import { useApp } from "../../context/useApp"
import {
  formatCurrency,
  formatDisplayDate,
  formatTime12
} from "../../utils/format"
import { formatPhoneDisplay, formatPhoneInput } from "../../utils/phone"
import { getInitials } from "../../utils/players"

export default function EditPlayer() {
  const { id } = useParams()

  const {
    getPlayerById,
    bookings,
    getTurfById,
    getSportById,
    updatePlayer,
    addBalance
  } = useApp()

  const player = getPlayerById(id)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(player?.name || "")
  const [phone, setPhone] = useState(
    player ? formatPhoneDisplay(player.phone) : "+91 "
  )
  const [address, setAddress] = useState(player?.address || "")
  const [photo, setPhoto] = useState(player?.photo || null)
  const [balanceModalOpen, setBalanceModalOpen] = useState(false)
  const [error, setError] = useState("")

  const playerBookings = useMemo(
    () =>
      bookings.filter((booking) =>
        booking.playerIds?.includes(id)
      ),
    [bookings, id]
  )

  if (!player) {
    return (
      <MobileLayout hideFab>
        <div className="p-5 text-center text-slate-500">
          Player not found.
        </div>
      </MobileLayout>
    )
  }

  const handleSaveProfile = () => {
    // Validate all required fields
    if (!name.trim()) {
      setError("Please fill player name")
      return
    }
    
    if (!phone || phone === "+91 ") {
      setError("Please fill mobile number") 
      return
    }
    
    if (!address.trim()) {
      setError("Please fill address")
      return
    }

    const result = updatePlayer(id, {
      name,
      phone,
      address,
      photo
    })

    if (!result.ok) {
      setError(result.error)
      return
    }

    setEditing(false)
    setError("")
  }

  const handleCancelEdit = () => {
    // Reset to original values
    setName(player?.name || "")
    setPhone(player ? formatPhoneDisplay(player.phone) : "+91 ")
    setAddress(player?.address || "")
    setPhoto(player?.photo || null)
    setEditing(false)
    setError("")
  }

  return (
    <MobileLayout hideFab>
      <div className="p-5 space-y-5 animate-fade-in-up">
        <GlassCard className="space-y-4">
          {!editing ? (
            /* View Mode Layout */
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="
                  w-16 h-16 rounded-full overflow-hidden
                  bg-green-500 text-black
                  flex items-center justify-center
                  text-xl font-bold shrink-0
                ">
                  {player.photo ? (
                    <img
                      src={player.photo}
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(player.name)
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {player.name}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                    {formatPhoneDisplay(player.phone)}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                    {player.address || "No address added"}
                  </p>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setEditing(true)}
                className="
                  w-10 h-10 rounded-xl
                  bg-green-500/15 text-green-500
                  flex items-center justify-center
                  hover:bg-green-500/25 transition-all duration-300
                "
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                </svg>
              </button>
            </div>
          ) : (
            /* Edit Mode Layout - Centered like Add Player */
            <div className="space-y-5 transition-all duration-1000 ease-in-out animate-in slide-in-from-top-4 fade-in">
              {/* Centered Photo Section */}
              <div className="flex flex-col items-center gap-2 py-3 transition-all duration-1000 ease-in-out">
                <div className="transition-all duration-1000 ease-in-out transform">
                  <PhotoUpload
                    name={name}
                    photo={photo}
                    onPhotoChange={setPhoto}
                    size="large"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4 transition-all duration-1000 delay-300 ease-in-out animate-in slide-in-from-bottom-4 fade-in">
                <div className="transition-all duration-700 delay-200 ease-in-out transform">
                  <InputField
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="transition-all duration-700 delay-300 ease-in-out transform">
                  <InputField
                    label="Mobile"
                    value={phone}
                    onChange={(e) =>
                      setPhone(formatPhoneInput(e.target.value))
                    }
                  />
                </div>
                <div className="transition-all duration-700 delay-400 ease-in-out transform">
                  <InputField
                    label="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* Action Buttons - Centered Row */}
              <div className="flex items-center justify-center gap-4 pt-2 transition-all duration-1000 delay-500 ease-in-out animate-in slide-in-from-bottom-2 fade-in">
                <button
                  onClick={handleSaveProfile}
                  className="
                    px-6 py-3 rounded-xl
                    bg-green-500/15 text-green-500 border border-green-500/30
                    font-semibold text-sm
                    hover:bg-green-500/25 hover:scale-105 transition-all duration-300
                    transform animate-in zoom-in-50
                  "
                >
                  Save
                </button>
                
                <button
                  onClick={handleCancelEdit}
                  className="
                    px-6 py-3 rounded-xl
                    bg-red-500/15 text-red-500 border border-red-500/30
                    font-semibold text-sm
                    hover:bg-red-500/25 hover:scale-105 transition-all duration-300
                    transform animate-in zoom-in-50
                  "
                >
                  Revert
                </button>
              </div>
            </div>
          )}
        </GlassCard>

        <div className="grid grid-cols-2 gap-4">
          <GlassCard>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Total Bookings
            </p>
            <p className="text-2xl font-bold text-green-500 mt-1">
              {playerBookings.length}
            </p>
          </GlassCard>

          <GlassCard>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Total Balance
            </p>
            <p className={`text-2xl font-bold mt-1 ${
              player.balance < 0
                ? "text-red-500"
                : player.balance < 300
                  ? "text-orange-400"
                  : "text-green-500"
            }`}>
              {formatCurrency(player.balance)}
            </p>
          </GlassCard>
        </div>

        <button
          onClick={() => setBalanceModalOpen(true)}
          className="w-full py-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-500 font-semibold hover:bg-green-500/20 transition-colors"
        >
          Add Balance
        </button>

        <GlassCard className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Booking History
          </h2>

          {player.history.map((item) => {
            const turf = getTurfById(item.turfId)
            const sport = getSportById(item.sportId)

            const tone =
              item.type === "credit"
                ? "text-green-500"
                : item.type === "debit"
                  ? "text-red-500"
                  : "text-orange-400"

            return (
              <div
                key={item.id}
                className="
                  rounded-2xl p-3
                  bg-slate-100 dark:bg-white/5
                  border border-black/5 dark:border-white/10
                "
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-2">
                    <SportIcon
                      sportId={sport?.id}
                      sportName={sport?.name}
                      size={18}
                    />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {item.bookingId || "Balance"} • {sport?.name || "Top-up"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {turf?.name || "—"} • {formatDisplayDate(item.date)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatTime12(item.startTime)}
                      </p>
                    </div>
                  </div>

                  <p className={`font-semibold ${tone}`}>
                    {item.type === "credit" ? "+" : "-"}
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              </div>
            )
          })}

          {!player.history.length && (
            <p className="text-sm text-slate-500">No transactions yet.</p>
          )}
        </GlassCard>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}
      </div>

      <AddBalanceModal
        open={balanceModalOpen}
        onClose={() => setBalanceModalOpen(false)}
        playerName={player.name}
        onSubmit={(payload) => addBalance(id, payload)}
      />
    </MobileLayout>
  )
}
