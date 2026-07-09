export default function InputField({
  label, placeholder, type = "text",
  value, onChange, centered = false,
  readOnly = false, prefix, rightElement
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {prefix ? (
          <div
            className="premium-input flex items-center gap-2 px-4"
            style={{ height: "48px", padding: "0 1rem" }}
          >
            <span style={{ color: "var(--text-muted)", fontWeight: 500, flexShrink: 0 }}>
              {prefix}
            </span>
            <input
              type={type}
              value={value}
              readOnly={readOnly}
              onChange={onChange}
              placeholder={placeholder}
              className="flex-1 min-w-0 bg-transparent outline-none"
              style={{
                color: "var(--text-primary)",
                background: "transparent",
                textAlign: centered ? "center" : "left"
              }}
            />
            {rightElement && <span style={{ flexShrink: 0 }}>{rightElement}</span>}
          </div>
        ) : (
          <>
            <input
              type={type}
              value={value}
              readOnly={readOnly}
              onChange={onChange}
              placeholder={placeholder}
              className={`premium-input ${rightElement ? "pr-12" : ""}`}
              style={{ textAlign: centered ? "center" : "left" }}
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
