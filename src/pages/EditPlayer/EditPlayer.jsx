import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Pencil } from "lucide-react"

import MobileLayout from "../../components/layout/MobileLayout"
import GlassCard from "../../components/common/GlassCard"
import InputField from "../../components/common/InputField"
import PrimaryButton from "../../components/common/PrimaryButton"
import AddBalanceModal from "../../components/player/AddBalanceModal"
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
    const result = updatePlayer(id, {
      name,
      phone,
      address
    })

    if (!result.ok) {
      setError(result.error)
      return
    }

    setEditing(false)
    setError("")
  }

  return (
    <MobileLayout hideFab>
      <div className="p-5 space-y-5 animate-fade-in-up">
        <GlassCard className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="
                w-16 h-16 rounded-full
                bg-green-500 text-black
                flex items-center justify-center
                text-xl font-bold
              ">
                {getInitials(player.name)}
              </div>

              <div>
                {!editing ? (
                  <>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {player.name}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-gray-400">
                      {formatPhoneDisplay(player.phone)}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                      {player.address || "No address added"}
                    </p>
                  </>
                ) : (
                  <div className="space-y-2 w-full">
                    <InputField
                      label="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <InputField
                      label="Mobile"
                      value={phone}
                      onChange={(e) =>
                        setPhone(formatPhoneInput(e.target.value))
                      }
                    />
                    <InputField
                      label="Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                if (editing) {
                  handleSaveProfile()
                  return
                }

                setEditing(true)
              }}
              className="
                w-10 h-10 rounded-xl
                bg-green-500/15 text-green-500
                flex items-center justify-center
              "
            >
              <Pencil size={16} />
            </button>
          </div>
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

        <PrimaryButton
          text="Add Balance"
          onClick={() => setBalanceModalOpen(true)}
        />

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
