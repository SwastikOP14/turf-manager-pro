import { forwardRef } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Calendar } from "lucide-react"

const DateInputButton = forwardRef(function DateInputButton(
  { value, onClick, placeholder },
  ref
) {
  return (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      className="
        premium-input
        h-11
        w-full
        flex items-center justify-between
        gap-2
        px-4
        text-left
        cursor-pointer
      "
    >
      <span
        className={
          value
            ? "text-slate-900 dark:text-white"
            : "text-slate-400 dark:text-slate-500"
        }
      >
        {value || placeholder}
      </span>

      <Calendar
        size={18}
        className="shrink-0 text-slate-500 dark:text-slate-300"
      />
    </button>
  )
})

export default function DatePickerField({
  label,
  selected,
  onChange,
  selectsRange = false,
  startDate,
  endDate,
  placeholder = "DD-MM-YYYY"
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-slate-900 dark:text-white">
          {label}
        </label>
      )}

      <DatePicker
        selected={selected}
        onChange={onChange}
        selectsRange={selectsRange}
        startDate={startDate}
        endDate={endDate}
        shouldCloseOnSelect={!selectsRange}
        dateFormat="dd-MM-yyyy"
        placeholderText={placeholder}
        onKeyDown={(event) => event.preventDefault()}
        popperPlacement="bottom-start"
        popperClassName="react-datepicker-popper-custom"
        calendarClassName="tmp-datepicker-calendar"
        wrapperClassName="w-full block"
        customInput={
          <DateInputButton placeholder={placeholder} />
        }
      />
    </div>
  )
}
