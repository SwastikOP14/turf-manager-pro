export default function Modal({
  open,
  onClose,
  children
}) {

  if (!open) return null

  return (
    <div className="
      fixed inset-0
      z-100

      flex items-center justify-center

      bg-black/70
      backdrop-blur-sm
    ">

      {/* Overlay */}
      <div
        onClick={onClose}
        className="
          absolute inset-0
        "
      />

      {/* Modal Content */}
      <div className="
        relative

        w-[90%]
        max-w-md

        rounded-3xl

        bg-[#111827]

        border border-white/10

        p-5

        shadow-2xl
      ">

        {children}

      </div>

    </div>
  )
}