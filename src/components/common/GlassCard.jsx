export default function GlassCard({
  children,
  className = ""
}) {

  return (

    <div
      className={`
        rounded-3xl
        p-4

        bg-[#0F172A]/90

        border
        border-white/10

        shadow-lg

        relative

        ${className}
      `}
    >

      {children}

    </div>

  )
}