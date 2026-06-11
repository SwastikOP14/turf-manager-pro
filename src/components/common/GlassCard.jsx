export default function GlassCard({
  children,
  className = "",
  onClick
}) {
  return (
    <div
      onClick={onClick}
      className={`
        premium-card
        p-5
        animate-fade-in-up
        transition-all duration-200 ease-out
        ${onClick ? "cursor-pointer active:scale-[0.98] hover:-translate-y-0.5" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
