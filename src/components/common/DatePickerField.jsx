import DatePicker from "react-datepicker"
import { Calendar } from "lucide-react"

export default function DatePickerField({
  label,
  selected,
  onChange,
  selectsRange = false,
  startDate,
  endDate,
  placeholder = "DD-MM-YYYY",
  readOnly = true
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-slate-900 dark:text-white">
          {label}
        </label>
      )}

      <div className="relative">
        <DatePicker
          selected={selected}
          onChange={onChange}
          selectsRange={selectsRange}
          startDate={startDate}
          endDate={endDate}
          dateFormat="dd-MM-yyyy"
          placeholderText={placeholder}
          readOnly={readOnly}
          onKeyDown={(event) => event.preventDefault()}
          popperPlacement="top-start"
          portalId="root-portal"
          popperClassName="react-datepicker-popper-custom"
          className="
            premium-input
            h-11
            pr-10
            caret-transparent
          "
        />

        <Calendar
          size={18}
          className="
            pointer-events-none
            absolute right-3 top-1/2 -translate-y-1/2
            text-slate-500 dark:text-slate-300
          "
        />
      </div>
    </div>
  )
}
