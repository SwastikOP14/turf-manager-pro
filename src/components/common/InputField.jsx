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
        {prefix ? (
          <div className="
            premium-input
            h-11
            flex items-center
            gap-2
            px-4
          ">
            <span className="shrink-0 text-slate-500 dark:text-slate-300 font-medium">
              {prefix}
            </span>

            <input
              type={type}
              value={value}
              readOnly={readOnly}
              onChange={onChange}
              placeholder={placeholder}
              style={{
                textAlign: centered ? "center" : "left"
              }}
              className="
                flex-1 min-w-0
                bg-transparent outline-none
                text-slate-900 dark:text-white
                placeholder:text-slate-400
              "
            />

            {rightElement && (
              <span className="shrink-0">{rightElement}</span>
            )}
          </div>
        ) : (
          <>
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
                ${rightElement ? "pr-12" : ""}
              `}
            />

            {rightElement && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {rightElement}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
