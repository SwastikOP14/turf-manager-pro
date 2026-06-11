export default function StatCard({ title, value, gradient, icon: Icon }) {
  const bg = gradient || "linear-gradient(135deg, var(--brand), #00B4D8)"
  return (
    <div
      style={{
        borderRadius: "16px",
        background: bg,
        padding: "18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        minHeight: "96px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle circle decoration */}
      <div style={{
        position: "absolute",
        top: "-20px",
        right: "-20px",
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
        pointerEvents: "none",
      }} />

      {Icon && (
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "10px",
          background: "rgba(255,255,255,0.20)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Icon size={17} color="#fff" />
        </div>
      )}

      <p style={{ fontSize: "22px", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em", fontFeatureSettings: '"tnum" 1' }}>
        {value}
      </p>
      <p style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.75)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {title}
      </p>
    </div>
  )
}
