export default function InputField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  centered = false,
  readOnly = false,
  prefix,
  rightElement
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-slate-900 dark:text-white">
          {label}
        </label>
      )}

      <div className="relative">
        {prefix && (
          <span className="
            absolute left-4 top-1/2 -translate-y-1/2
            text-slate-500 dark:text-slate-300
            font-medium
          ">
            {prefix}
          </span>
        )}

        <input
          type={type}
          value={value}
          readOnly={readOnly}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            textAlign: centered ? "center" : "left"
          }}
          className={`
            premium-input
            ${prefix ? "pl-10" : ""}
            ${rightElement ? "pr-12" : ""}
          `}
        />

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  )
}
