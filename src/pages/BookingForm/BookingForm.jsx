import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Pencil, Plus, Trash2 } from "lucide-react"

import MobileLayout from "../../components/layout/MobileLayout"
import GlassCard from "../../components/common/GlassCard"
import SectionTitle from "../../components/common/SectionTitle"
import InputField from "../../components/common/InputField"
import DropdownField from "../../components/common/DropdownField"
import DatePickerField from "../../components/common/DatePickerField"
import TimePickerField from "../../components/common/TimePickerField"
import SegmentedControl from "../../components/common/SegmentedControl"
import PrimaryButton from "../../components/common/PrimaryButton"
import Modal from "../../components/common/Modal"
import AddTurfModal from "../../components/turf/AddTurfModal"
import { useApp } from "../../context/useApp"
import {
  toDateKey,
  timeTo24,
  timeFrom24,
  formatCurrency
} from "../../utils/format"
import { formatPhoneDisplay } from "../../utils/phone"
import { searchPlayers } from "../../utils/players"

export default function BookingForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const {
    bookings,
    players,
    turfs,
    sports,
    addBooking,
    updateBooking,
    addTurf,
    getPlayerById
  } = useApp()

  const existing = bookings.find((booking) => booking.id === id)
  const start = timeFrom24(existing?.startTime)
  const end = timeFrom24(existing?.endTime)

  const [sportId, setSportId] = useState(existing?.sportId || "")
  const [turfId, setTurfId] = useState(existing?.turfId || "")
  const [date, setDate] = useState(
    existing?.date ? new Date(existing.date) : null
  )
  const [amount, setAmount] = useState(
    existing ? String(existing.amount) : ""
  )
  const [status, setStatus] = useState(existing?.status || "Paid")
  const [paidAmount, setPaidAmount] = useState(
    existing ? String(existing.paidAmount || 0) : ""
  )
  const [paidByPlayerId, setPaidByPlayerId] = useState(
    existing?.paidByPlayerId || ""
  )
  const [playerIds, setPlayerIds] = useState(existing?.playerIds || [])
  const [turfModalOpen, setTurfModalOpen] = useState(false)
  const [playerSearchOpen, setPlayerSearchOpen] = useState(false)
  const [playerQuery, setPlayerQuery] = useState("")
  const [error, setError] = useState("")

  const [startHour, setStartHour] = useState(start.hour)
  const [startMinute, setStartMinute] = useState(start.minute)
  const [startPeriod, setStartPeriod] = useState(start.period)
  const [endHour, setEndHour] = useState(end.hour)
  const [endMinute, setEndMinute] = useState(end.minute)
  const [endPeriod, setEndPeriod] = useState(end.period)

  const remaining = Math.max(
    0,
    Number(amount || 0) - Number(paidAmount || 0)
  )

  const perPersonShare = useMemo(() => {
    if (!amount || !playerIds.length) {
      return 0
    }

    return Number(amount) / playerIds.length
  }, [amount, playerIds])

  const searchedPlayers = useMemo(
    () => searchPlayers(players, playerQuery),
    [players, playerQuery]
  )

  const sportOptions = sports.map((sport) => ({
    value: sport.id,
    label: sport.name
  }))

  const turfOptions = [
    ...turfs.map((turf) => ({
      value: turf.id,
      label: turf.name
    })),
    { value: "__add_new__", label: "+ Add New Turf/Ground" }
  ]

  const playerOptions = players.map((player) => ({
    value: player.id,
    label: `${player.name} (${formatPhoneDisplay(player.phone)})`
  }))

  const handleTurfChange = (event) => {
    const value = event.target.value

    if (value === "__add_new__") {
      setTurfModalOpen(true)
      return
    }

    setTurfId(value)
  }

  const handleAddPlayer = (playerId) => {
    if (playerIds.includes(playerId)) {
      return
    }

    setPlayerIds((prev) => [...prev, playerId])
    setPlayerSearchOpen(false)
    setPlayerQuery("")
  }

  const handleRemovePlayer = (playerId) => {
    setPlayerIds((prev) => prev.filter((item) => item !== playerId))
  }

  const handleSave = () => {
    if (!sportId || !turfId || !date || !amount) {
      setError("Please complete booking details and payment summary")
      return
    }

    if (!startHour || !startMinute || !endHour || !endMinute) {
      setError("Please select start and end time")
      return
    }

    if (!paidByPlayerId) {
      setError("Please select who paid the turf owner")
      return
    }

    if (!playerIds.length) {
      setError("Add at least one player in Total Players")
      return
    }

    const payload = {
      sportId,
      turfId,
      date: toDateKey(date),
      startTime: timeTo24(startHour, startMinute, startPeriod),
      endTime: timeTo24(endHour, endMinute, endPeriod),
      amount: Number(amount),
      status,
      paidAmount:
        status === "Partial"
          ? Number(paidAmount)
          : status === "Paid"
            ? Number(amount)
            : 0,
      paidByPlayerId,
      playerIds
    }

    if (isEdit) {
      updateBooking(id, payload)
    } else {
      addBooking(payload)
    }

    navigate("/")
  }

  return (
    <MobileLayout hideFab>
      <div className="p-5 space-y-5 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {isEdit ? "Edit Booking" : "Add Booking"}
        </h1>

        <GlassCard className="space-y-4">
          <SectionTitle title="Booking Details" />

          <DropdownField
            label="Sport / Game"
            value={sportId}
            onChange={(e) => setSportId(e.target.value)}
            options={sportOptions}
            placeholder="Select sport"
          />

          <DropdownField
            label="Turf / Ground"
            value={turfId}
            onChange={handleTurfChange}
            options={turfOptions}
            placeholder="Select turf"
          />

          <DatePickerField
            label="Date"
            selected={date}
            onChange={setDate}
          />

          <TimePickerField
            label="Start Time"
            hour={startHour}
            minute={startMinute}
            period={startPeriod}
            onHourChange={setStartHour}
            onMinuteChange={setStartMinute}
            onPeriodChange={setStartPeriod}
          />

          <TimePickerField
            label="End Time"
            hour={endHour}
            minute={endMinute}
            period={endPeriod}
            onHourChange={setEndHour}
            onMinuteChange={setEndMinute}
            onPeriodChange={setEndPeriod}
          />
        </GlassCard>

        <GlassCard className="space-y-4">
          <SectionTitle title="Payment Summary" />

          <InputField
            label="Total Amount"
            prefix="₹"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            rightElement={<Pencil size={16} className="text-green-500" />}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-white">
              Payment Status
            </label>
            <SegmentedControl
              options={["Paid", "Partial", "Pending"]}
              value={status}
              onChange={setStatus}
            />
          </div>

          {status === "Partial" && (
            <>
              <InputField
                label="Amount Paid Till Now"
                prefix="₹"
                value={paidAmount}
                onChange={(e) =>
                  setPaidAmount(e.target.value.replace(/\D/g, ""))
                }
              />

              <div className="
                rounded-2xl p-3
                bg-green-500/10 border border-green-500/20
                flex justify-between text-sm font-semibold
              ">
                <span className="text-green-500">
                  Paid {formatCurrency(paidAmount)}
                </span>
                <span className="text-orange-400">
                  Remaining {formatCurrency(remaining)}
                </span>
              </div>
            </>
          )}
        </GlassCard>

        <GlassCard className="space-y-4">
          <SectionTitle title="Paid By" />

          <DropdownField
            label="Player who paid turf owner"
            value={paidByPlayerId}
            onChange={(e) => setPaidByPlayerId(e.target.value)}
            options={playerOptions}
            placeholder="Select player"
          />

          {paidByPlayerId && (
            <p className="text-sm text-slate-500 dark:text-gray-400">
              {getPlayerById(paidByPlayerId)?.name} paid the turf owner.
              This does not change split logic.
            </p>
          )}
        </GlassCard>

        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionTitle title={`Total Players (${playerIds.length})`} />
            <span className="text-green-500 font-semibold text-sm">
              {formatCurrency(perPersonShare)}/person
            </span>
          </div>

          <div className="space-y-2">
            {playerIds.map((playerId) => {
              const player = getPlayerById(playerId)

              if (!player) {
                return null
              }

              return (
                <div
                  key={playerId}
                  className="
                    flex items-center justify-between
                    rounded-2xl p-3
                    bg-slate-100 dark:bg-white/5
                    border border-black/5 dark:border-white/10
                  "
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {player.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      Share {formatCurrency(perPersonShare)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemovePlayer(playerId)}
                    className="text-red-400 p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            })}
          </div>

          <button
            onClick={() => setPlayerSearchOpen(true)}
            className="
              w-full py-3 rounded-2xl
              border border-green-500/30 text-green-500
              font-semibold flex items-center justify-center gap-2
            "
          >
            <Plus size={16} />
            Add / Search Players
          </button>
        </GlassCard>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <PrimaryButton
          text={isEdit ? "Update Booking" : "Create Booking"}
          onClick={handleSave}
        />
      </div>

      <AddTurfModal
        open={turfModalOpen}
        onClose={() => setTurfModalOpen(false)}
        onSave={(form) => {
          const turf = addTurf(form)
          setTurfId(turf.id)
        }}
      />

      <Modal
        open={playerSearchOpen}
        onClose={() => setPlayerSearchOpen(false)}
      >
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Add / Search Players
          </h2>

          <InputField
            label="Search"
            placeholder="Search by name or mobile"
            value={playerQuery}
            onChange={(e) => setPlayerQuery(e.target.value)}
          />

          <div className="max-h-64 overflow-y-auto space-y-2">
            {searchedPlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => handleAddPlayer(player.id)}
                disabled={playerIds.includes(player.id)}
                className="
                  w-full text-left p-3 rounded-2xl
                  bg-slate-100 dark:bg-white/5
                  border border-black/5 dark:border-white/10
                  disabled:opacity-50
                "
              >
                <p className="font-medium text-slate-900 dark:text-white">
                  {player.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatPhoneDisplay(player.phone)}
                </p>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </MobileLayout>
  )
}
