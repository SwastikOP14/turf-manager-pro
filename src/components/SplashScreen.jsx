export default function SplashScreen({ onDone }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200000,
        background: "#0A0F1E",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 2rem",
        gap: 0,
      }}
    >
      {/* Glow ring behind logo */}
      <div
        className="animate-pulse-glow"
        style={{
          position: "relative",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-24px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,212,160,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <img
          src="/app-logo.png"
          alt="Turf Manager Pro"
          style={{
            width: "120px",
            height: "120px",
            objectFit: "contain",
            borderRadius: "28px",
            position: "relative",
            zIndex: 1,
            boxShadow: "0 8px 40px rgba(0,212,160,0.25)",
          }}
        />
      </div>

      {/* App name */}
      <p style={{
        fontSize: "28px",
        fontWeight: 800,
        color: "#F1F5F9",
        letterSpacing: "-0.03em",
        lineHeight: 1.1,
        margin: 0,
        marginBottom: "6px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        Turf Manager{" "}
        <span style={{ color: "#00D4A0" }}>Pro</span>
      </p>

      {/* Tagline */}
      <p style={{
        fontSize: "14px",
        color: "#64748B",
        letterSpacing: "0.04em",
        margin: 0,
        marginBottom: "3rem",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        Your turf. Your rules.
      </p>

      {/* CTA Button */}
      <button
        onClick={onDone}
        style={{
          width: "100%",
          maxWidth: "18rem",
          height: "52px",
          borderRadius: "14px",
          background: "linear-gradient(135deg, #00D4A0 0%, #00B4D8 100%)",
          color: "#000",
          fontWeight: 700,
          fontSize: "16px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 24px rgba(0,212,160,0.45)",
          transition: "transform 0.1s ease",
          letterSpacing: "-0.01em",
        }}
        onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
        onTouchEnd={(e)   => (e.currentTarget.style.transform = "scale(1)")}
      >
        Get Started
      </button>
    </div>
  )
}
