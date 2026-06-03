import { useState } from "react"
import { X } from "lucide-react"

import Modal from "../common/Modal"
import InputField from "../common/InputField"
import DatePickerField from "../common/DatePickerField"
import TimePickerField from "../common/TimePickerField"
import SegmentedControl from "../common/SegmentedControl"
import PrimaryButton from "../common/PrimaryButton"
import { toDateKey, timeTo24 } from "../../utils/format"

export default function AddBalanceModal({
  open,
  onClose,
  playerName,
  onSubmit
}) {
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date())
  const [hour, setHour] = useState("08")
  const [minute, setMinute] = useState("00")
  const [period, setPeriod] = useState("PM")
  const [paymentMode, setPaymentMode] = useState("UPI")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    // Validate mandatory amount field
    if (!amount || amount === "0") {
      setError("Please fill amount")
      return
    }

    onSubmit({
      amount: Number(amount),
      date: toDateKey(date),
      time: timeTo24(hour, minute, period),
      paymentMode,
      notes
    })

    // Reset form
    setAmount("")
    setNotes("")
    setError("")
    onClose()
  }

  const handleClose = () => {
    // Reset form and errors when closing
    setAmount("")
    setNotes("")
    setError("")
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Add Balance
        </h2>

        <InputField
          label="Player"
          value={playerName}
          readOnly
        />

        <InputField
          label="Amount"
          prefix="₹"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
        />

        <DatePickerField
          label="Date"
          selected={date}
          onChange={setDate}
        />

        <TimePickerField
          label="Time"
          hour={hour}
          minute={minute}
          period={period}
          onHourChange={setHour}
          onMinuteChange={setMinute}
          onPeriodChange={setPeriod}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900 dark:text-white">
            Payment Mode
          </label>
          <SegmentedControl
            options={["UPI", "Cash"]}
            value={paymentMode}
            onChange={setPaymentMode}
          />
        </div>

        <InputField
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <div className="flex gap-3 items-center">
          <button
            onClick={handleClose}
            className="
              w-12 h-12 rounded-2xl
              bg-red-500/10 border border-red-500/30
              text-red-500 hover:bg-red-500/20
              flex items-center justify-center
              transition-colors
            "
            title="Cancel"
          >
            <X size={18} />
          </button>

          <PrimaryButton
            text="Add Balance"
            onClick={handleSubmit}
            className="flex-1"
          />
        </div>
      </div>
    </Modal>
  )
}
