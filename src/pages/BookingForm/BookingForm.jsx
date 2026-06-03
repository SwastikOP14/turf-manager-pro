import { useMemo, useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Pencil, Check, Search, Trash2 } from "lucide-react"
import { createPortal } from "react-dom"

import MobileLayout from "../../components/layout/MobileLayout"
import GlassCard from "../../components/common/GlassCard"
import SectionTitle from "../../components/common/SectionTitle"
import InputField from "../../components/common/InputField"
import DropdownField from "../../components/common/DropdownField"
import DatePickerField from "../../components/common/DatePickerField"
import TimePickerField from "../../components/common/TimePickerField"
import SegmentedControl from "../../components/common/SegmentedControl"
import PrimaryButton from "../../components/common/PrimaryButton"
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

function ModalBlurWrapper({ onClose, children }) {
  useEffect(() => {
    document.body.classList.add("modal-open")
    return () => document.body.classList.remove("modal-open")
  }, [])

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.25rem", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }}>
      <div className="absolute inset-0" onClick={onClose} />
      <div style={{ position: "relative", width: "100%", maxWidth: "22rem", maxHeight: "85vh", overflowY: "auto", borderRadius: "1.5rem", padding: "1.25rem", boxShadow: "0 25px 50px rgba(0,0,0,0.4)" }}
        className="bg-white dark:bg-[#111827] border border-black/10 dark:border-white/10">
        {children}
      </div>
    </div>,
    document.body
  )
}

export default function BookingForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const {
    bookings, players, turfs, sports,
    addBooking, updateBooking, deleteBooking, addTurf, getPlayerById
  } = useApp()

  const existing = bookings.find((b) => b.id === id)
  const start = timeFrom24(existing?.startTime)
  const end = timeFrom24(existing?.endTime)

  const [sportId, setSportId] = useState(existing?.sportId || "")
  const [turfId, setTurfId] = useState(existing?.turfId || "")
  const [date, setDate] = useState(existing?.date ? new Date(existing.date) : null)
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "")
  const [status, setStatus] = useState(existing?.status || "Paid")
  const [paidAmount, setPaidAmount] = useState(existing ? String(existing.paidAmount || 0) : "")
  const [paidByPlayerId, setPaidByPlayerId] = useState(existing?.paidByPlayerId || "")
  const [playerIds, setPlayerIds] = useState(existing?.playerIds || [])
  const [turfModalOpen, setTurfModalOpen] = useState(false)
  const [paidByModalOpen, setPaidByModalOpen] = useState(false)
  const [playersModalOpen, setPlayersModalOpen] = useState(false)
  const [playerQuery, setPlayerQuery] = useState("")
  const [paidByQuery, setPaidByQuery] = useState("")
  const [error, setError] = useState("")

  const [startHour, setStartHour] = useState(start.hour)
  const [startMinute, setStartMinute] = useState(start.minute)
  const [startPeriod, setStartPeriod] = useState(start.period)
  const [endHour, setEndHour] = useState(end.hour)
  const [endMinute, setEndMinute] = useState(end.minute)
  const [endPeriod, setEndPeriod] = useState(end.period)

  const remaining = Math.max(0, Number(amount || 0) - Number(paidAmount || 0))

  const perPersonShare = useMemo(() => {
    if (!amount || !playerIds.length) return 0
    return Number(amount) / playerIds.length
  }, [amount, playerIds])

  const filteredPlayers = useMemo(
    () => searchPlayers(players, playerQuery),
    [players, playerQuery]
  )

  const filteredPaidBy = useMemo(
    () => searchPlayers(players, paidByQuery),
    [players, paidByQuery]
  )

  const sportOptions = sports.map((s) => ({ value: s.id, label: s.name }))

  const turfOptions = [
    ...turfs.map((t) => ({ value: t.id, label: t.name })),
    { value: "__add_new__", label: "+ Add New Turf/Ground" }
  ]

  const handleTurfChange = (e) => {
    if (e.target.value === "__add_new__") { setTurfModalOpen(true); return }
    setTurfId(e.target.value)
  }

  const togglePlayer = (pid) => {
    setPlayerIds((prev) =>
      prev.includes(pid) ? prev.filter((p) => p !== pid) : [...prev, pid]
    )
  }

  const handleSave = () => {
    // Validate all mandatory fields
    if (!sportId) { 
      setError("Please select sport/game")
      return 
    }
    if (!turfId) { 
      setError("Please select turf/ground") 
      return 
    }
    if (!date) { 
      setError("Please select a booking date") 
      return 
    }
    if (!amount) { 
      setError("Please enter total amount") 
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
      setError("Please add at least one player in Total Players") 
      return 
    }
    if (status === "Partial" && (!paidAmount || paidAmount === "0")) {
      setError("Please enter paid amount for partial payment")
      return
    }

    const payload = {
      sportId, turfId,
      date: toDateKey(date),
      startTime: timeTo24(startHour, startMinute, startPeriod),
      endTime: timeTo24(endHour, endMinute, endPeriod),
      amount: Number(amount),
      status,
      paidAmount:
        status === "Partial" ? Number(paidAmount)
        : status === "Paid" ? Number(amount)
        : 0,
      paidByPlayerId,
      playerIds
    }

    if (isEdit) updateBooking(id, payload)
    else addBooking(payload)
    navigate("/")
  }

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) return
    deleteBooking(id)
    navigate("/")
  }

  return (
    <MobileLayout hideFab>
      <div className="p-5 space-y-5 animate-fade-in-up">
        {/* Header with Title and Delete Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {isEdit ? "Edit Booking" : "Add Booking"}
          </h1>

          {isEdit && (
            <button
              onClick={handleDelete}
              className="
                w-10 h-10 rounded-xl
                bg-red-500/15 text-red-500
                flex items-center justify-center
                hover:bg-red-500/25 transition-all duration-200
              "
              title="Delete booking"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {/* ── Booking Details ──────────────────────────────── */}
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
            onChange={(v) => { setDate(v); setError("") }}
          />

          <TimePickerField
            label="Time"
            startHour={startHour} startMinute={startMinute} startPeriod={startPeriod}
            onStartHourChange={setStartHour} onStartMinuteChange={setStartMinute} onStartPeriodChange={setStartPeriod}
            endHour={endHour} endMinute={endMinute} endPeriod={endPeriod}
            onEndHourChange={setEndHour} onEndMinuteChange={setEndMinute} onEndPeriodChange={setEndPeriod}
          />
        </GlassCard>

        {/* ── Payment Summary ──────────────────────────────── */}
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
            <label className="text-sm font-medium text-slate-900 dark:text-white">Payment Status</label>
            <SegmentedControl options={["Paid", "Partial", "Pending"]} value={status} onChange={setStatus} />
          </div>

          {status === "Partial" && (
            <>
              <InputField
                label="Amount Paid Till Now"
                prefix="₹"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value.replace(/\D/g, ""))}
              />
              <div className="rounded-2xl p-3 bg-green-500/10 border border-green-500/20 flex justify-between text-sm font-semibold">
                <span className="text-green-500">Paid {formatCurrency(paidAmount)}</span>
                <span className="text-orange-400">Remaining {formatCurrency(remaining)}</span>
              </div>
            </>
          )}
        </GlassCard>

        {/* ── Paid By ──────────────────────────────────────── */}
        <GlassCard className="space-y-3">
          <SectionTitle title="Paid By" />
          <p className="text-xs text-slate-500 dark:text-gray-400 -mt-1">
            Who paid the turf owner?
          </p>

          <button
            type="button"
            onClick={() => setPaidByModalOpen(true)}
            className="premium-input w-full flex items-center justify-between gap-2 px-4 py-3 cursor-pointer text-left"
          >
            {paidByPlayerId ? (
              <div>
                <span className="text-slate-900 dark:text-white font-medium text-sm">
                  {getPlayerById(paidByPlayerId)?.name}
                </span>
                <span className={`ml-2 text-xs font-semibold ${(getPlayerById(paidByPlayerId)?.balance ?? 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {formatCurrency(getPlayerById(paidByPlayerId)?.balance ?? 0)}
                </span>
              </div>
            ) : (
              <span className="text-slate-400 dark:text-slate-500">Select player</span>
            )}
            <span className="text-base shrink-0">👤</span>
          </button>

          {paidByPlayerId && (
            <p className="text-xs text-slate-500 dark:text-gray-400">
              {getPlayerById(paidByPlayerId)?.name} paid the turf owner. This does not change split logic.
            </p>
          )}
        </GlassCard>

        {/* ── Total Players ─────────────────────────────────── */}
        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between">
            <SectionTitle title={`Total Players (${playerIds.length})`} />
            {playerIds.length > 0 && (
              <span className="text-green-500 font-semibold text-sm">
                {formatCurrency(perPersonShare)}/person
              </span>
            )}
          </div>

          {/* Selected player chips */}
          {playerIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {playerIds.map((pid) => {
                const p = getPlayerById(pid)
                if (!p) return null
                return (
                  <div
                    key={pid}
                    className="flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 rounded-full px-3 py-1.5"
                  >
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">{p.name}</span>
                      <span className={`text-xs font-semibold ${p.balance >= 0 ? "text-green-600 dark:text-green-500" : "text-red-500 dark:text-red-400"}`}>
                        {formatCurrency(p.balance)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPlayerIds((prev) => prev.filter((id) => id !== pid))}
                      className="text-green-600 dark:text-green-400 hover:text-red-400 transition-colors cursor-pointer text-base leading-none ml-1"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          <button
            type="button"
            onClick={() => setPlayersModalOpen(true)}
            className="w-full py-3 rounded-2xl border border-green-500/30 text-green-500 font-semibold flex items-center justify-center gap-2 hover:bg-green-500/10 transition-colors cursor-pointer"
          >
            + {playerIds.length > 0 ? "Edit Players" : "Add / Search Players"}
          </button>
        </GlassCard>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <div className="space-y-3">
          <PrimaryButton
            text={isEdit ? "Update Booking" : "Create Booking"}
            onClick={handleSave}
          />
        </div>
      </div>

      <AddTurfModal
        open={turfModalOpen}
        onClose={() => setTurfModalOpen(false)}
        onSave={(form) => {
          const turf = addTurf(form)
          setTurfId(turf.id)
        }}
      />

      {/* ── Paid By Modal (single select) ───────────────── */}
      {paidByModalOpen && (
        <ModalBlurWrapper onClose={() => setPaidByModalOpen(false)}>
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">👤 Paid By</h2>
          </div>

          <div className="relative mb-3">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={paidByQuery}
              onChange={(e) => setPaidByQuery(e.target.value)}
              placeholder="Search player..."
              className="premium-input py-3 text-sm"
              style={{ paddingLeft: "2.25rem" }}
            />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-hide">
            {filteredPaidBy.map((player) => {
              const selected = paidByPlayerId === player.id
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => { setPaidByPlayerId(player.id); setPaidByModalOpen(false) }}
                  className={`w-full flex items-center justify-between rounded-2xl p-3 border transition-all cursor-pointer text-left
                    ${selected ? "bg-green-500/15 border-green-500/50" : "bg-slate-100 dark:bg-white/5 border-black/5 dark:border-white/10 hover:border-green-500/30"}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${selected ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-white"}`}>
                      {player.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-slate-500 dark:text-gray-400">{formatPhoneDisplay(player.phone)}</p>
                      <span className="text-xs">•</span>
                      <p className={`text-xs font-semibold ${player.balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                        {formatCurrency(player.balance)}
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                    ${selected ? "bg-green-500 border-green-500" : "border-slate-300 dark:border-white/30"}`}>
                    {selected && <Check size={11} className="text-white" />}
                  </div>
                </button>
              )
            })}
            {filteredPaidBy.length === 0 && (
              <p className="text-sm text-center text-slate-400 py-4">No players found</p>
            )}
          </div>
        </ModalBlurWrapper>
      )}

      {/* ── Total Players Modal (multi select) ──────────── */}
      {playersModalOpen && (
        <ModalBlurWrapper onClose={() => setPlayersModalOpen(false)}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">👥 Select Players</h2>
            <span className="text-sm text-slate-500 dark:text-gray-400">{playerIds.length} selected</span>
          </div>

          <div className="relative my-3">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={playerQuery}
              onChange={(e) => setPlayerQuery(e.target.value)}
              placeholder="Search by name or mobile..."
              className="premium-input py-3 text-sm"
              style={{ paddingLeft: "2.25rem" }}
            />
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide mb-4">
            {filteredPlayers.map((player) => {
              const checked = playerIds.includes(player.id)
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => togglePlayer(player.id)}
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
            {filteredPlayers.length === 0 && (
              <p className="text-sm text-center text-slate-400 py-4">No players found</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => { setPlayersModalOpen(false); setPlayerQuery("") }}
            className="w-full py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm cursor-pointer transition-colors"
          >
            ✓ Done — {playerIds.length} player{playerIds.length !== 1 ? "s" : ""} selected
            {playerIds.length > 0 && ` · ${formatCurrency(perPersonShare)}/person`}
          </button>
        </ModalBlurWrapper>
      )}
    </MobileLayout>
  )
}
