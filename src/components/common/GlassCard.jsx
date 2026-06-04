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
        ${onClick ? "cursor-pointer active:scale-[0.99]" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
