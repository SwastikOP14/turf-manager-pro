import { useApp } from "../../context/useApp"
import { formatCurrency } from "../../utils/format"
import { getInitials } from "../../utils/initials"
import GlassCard from "../common/GlassCard"

export default function SquadCard({ squad, onClick }) {
  const { } = useApp()

  // Squad balance = sum of contributions made to this squad
  const squadBalance = (squad.contributions || []).reduce(
    (total, c) => total + (c.amount || 0), 0
  )

  const memberCount = squad.memberPlayerIds.length

  return (
    <div
      onClick={onClick}
      className="cursor-pointer transition-all duration-150 active:scale-[0.98]"
    >
      <GlassCard
        className="hover:shadow-lg"
        style={{ padding: "16px" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          {/* Icon + Squad Name */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              overflow: "hidden",
              background: squad.imageUrl ? "transparent" : "linear-gradient(135deg, var(--brand), #00B4D8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              {squad.imageUrl ? (
                <img src={squad.imageUrl} alt={squad.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#000" }}>
                  {getInitials(squad.name)}
                </span>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                {squad.name}
              </h3>
              <p style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                margin: "2px 0 0",
                fontWeight: 500
              }}>
                {memberCount} {memberCount === 1 ? "player" : "players"}
              </p>
            </div>
          </div>

          {/* Squad Balance */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              margin: 0,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Squad Balance
            </p>
            <p style={{
              fontSize: "18px",
              fontWeight: 700,
              color: squadBalance >= 0 ? "#10b981" : "#ef4444",
              margin: "2px 0 0",
              fontFeatureSettings: '"tnum" 1'
            }}>
              {squadBalance >= 0 ? "↑" : "↓"} {formatCurrency(Math.abs(squadBalance))}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}