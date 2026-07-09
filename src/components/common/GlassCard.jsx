export default function GlassCard({ children, className = "", onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`
        premium-card p-4 animate-fade-in-up
        ${onClick ? "cursor-pointer interactive active:scale-[0.985] transition-transform" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
