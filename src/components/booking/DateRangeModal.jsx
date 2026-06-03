import { X } from "lucide-react"
import Modal from "../common/Modal"
import DatePickerField from "../common/DatePickerField"
import PrimaryButton from "../common/PrimaryButton"

export default function DateRangeModal({
  open,
  onClose,
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onApply
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Custom Date Range
          </h2>

          <button
            onClick={onClose}
            className="
              w-10 h-10 rounded-xl
              bg-red-500/15 text-red-500
              flex items-center justify-center
              hover:bg-red-500/25 transition-all duration-200
            "
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <DatePickerField
          label="Start Date"
          selected={startDate}
          onChange={onStartChange}
        />

        <DatePickerField
          label="End Date"
          selected={endDate}
          onChange={onEndChange}
        />

        <PrimaryButton
          text="Apply Range"
          onClick={onApply}
        />
      </div>
    </Modal>
  )
}
