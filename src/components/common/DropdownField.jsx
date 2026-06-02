import { ChevronDown } from "lucide-react"

export default function DropdownField({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select",
  className = ""
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-900 dark:text-white">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="
            premium-input
            h-11
            pr-10
            appearance-none
          "
        >
          <option value="">{placeholder}</option>

          {options.map((option) => {
            const optionValue =
              typeof option === "string" ? option : option.value
            const optionLabel =
              typeof option === "string" ? option : option.label

            return (
              <option
                key={optionValue}
                value={optionValue}
              >
                {optionLabel}
              </option>
            )
          })}
        </select>

        <ChevronDown
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
