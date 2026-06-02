import { useState } from "react"

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

  const handleSubmit = () => {
    onSubmit({
      amount: Number(amount),
      date: toDateKey(date),
      time: timeTo24(hour, minute, period),
      paymentMode,
      notes
    })

    setAmount("")
    setNotes("")
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
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

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="
              flex-1 py-3 rounded-2xl
              border border-black/10 dark:border-white/10
              text-slate-900 dark:text-white
            "
          >
            Cancel
          </button>

          <PrimaryButton
            text="Add Balance"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </Modal>
  )
}
