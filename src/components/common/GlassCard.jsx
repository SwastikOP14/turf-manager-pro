export default function GlassCard({ children, className = "" }) {

  return (
    <div className={`
      rounded-3xl
      p-4

      bg-white/70
      dark:bg-white/5

      backdrop-blur-xl

      border
      border-black/5
      dark:border-white/10

      shadow-lg

      ${className}
    `}>

      {children}

    </div>
  )
}