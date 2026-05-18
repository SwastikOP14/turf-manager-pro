export default function GlassCard({
  children,
  className = ""
}) {

  return (

    <div
      className={`
        relative
        z-0

        rounded-3xl
        p-4

        overflow-visible

        bg-white/70
        dark:bg-white/5

        backdrop-blur-xl

        border
        border-black/5
        dark:border-white/10

        shadow-lg

        ${className}
      `}
    >

      {children}

    </div>

  )
}