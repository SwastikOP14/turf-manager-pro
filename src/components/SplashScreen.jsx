export default function SplashScreen({ onDone }) {
  return (
    <div className="
      fixed inset-0 z-[200]
      bg-[#020817]
      flex flex-col items-center justify-center px-8
      animate-fade-in-up
    ">
      <img
        src="/app-logo.png"
        alt="Turf Manager Pro"
        className="w-full max-w-[280px] object-contain mb-10"
      />

      <button
        onClick={onDone}
        className="
          px-10 py-3 rounded-2xl
          bg-green-500 text-black font-semibold
          shadow-[var(--shadow-glow)]
          transition active:scale-[0.98]
        "
      >
        Enter App
      </button>
    </div>
  )
}
