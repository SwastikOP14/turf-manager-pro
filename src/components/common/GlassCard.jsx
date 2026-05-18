export default function GlassCard({
  children,
  className = ""
}) {

  return (

    <div
      className={`
        relative

        rounded-3xl
        p-4

        overflow-visible

        bg-white/70
        dark:bg-[#111827]/80

        border
        border-black/5
        dark:border-white/10

        shadow-lg

        ${className}
      `}
      style={{
        isolation: "isolate"
      }}
    >

      {children}

    </div>

  )
}