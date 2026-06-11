export default function SettingItem({ title, subtitle, rightElement, icon: Icon, iconBg }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {Icon && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: iconBg || "var(--brand-subtle)" }}
          >
            <Icon size={17} style={{ color: "var(--brand)" }} />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-500 text-sm" style={{ color: "var(--text-primary)" }}>{title}</p>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
          )}
        </div>
      </div>
      {rightElement}
    </div>
  )
}
