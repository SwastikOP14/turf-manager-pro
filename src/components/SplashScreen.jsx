export default function SplashScreen({ onDone }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        // Must be above the app header (z-index: 100000)
        zIndex: 200000,
        background: "#020817",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <img
        src="/app-logo.png"
        alt="Turf Manager Pro"
        style={{ width: "100%", maxWidth: "17.5rem", objectFit: "contain", marginBottom: "1.5rem" }}
      />

      <p style={{ color: "#4ade80", fontWeight: 700, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "2.5rem" }}>
        Turf Manager Pro
      </p>

      <button
        onClick={onDone}
        style={{
          paddingLeft: "2.5rem",
          paddingRight: "2.5rem",
          paddingTop: "0.875rem",
          paddingBottom: "0.875rem",
          borderRadius: "1rem",
          background: "#22c55e",
          color: "#000000",
          fontWeight: 700,
          fontSize: "1rem",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 0 24px rgba(34,197,94,0.4)",
          transition: "transform 0.15s ease",
        }}
        onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
        onTouchEnd={(e)   => (e.currentTarget.style.transform = "scale(1)")}
      >
        Enter App
      </button>
    </div>
  )
}
