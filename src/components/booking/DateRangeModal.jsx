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
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Custom Date Range
        </h2>

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
