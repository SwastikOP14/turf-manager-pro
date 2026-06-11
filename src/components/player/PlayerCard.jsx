import { useNavigate } from "react-router-dom"
import { formatCurrency } from "../../utils/format"
import { formatPhoneDisplay } from "../../utils/phone"
import { getInitials } from "../../utils/players"

// Generate a stable gradient from a string
function avatarGradient(name = "") {
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  return `linear-gradient(135deg, hsl(${hue},60%,50%), hsl(${(hue+40)%360},70%,40%))`
}

export default function PlayerCard({ player }) {
  const navigate  = useNavigate()
  const isNeg     = player.balance < 0
  const isLow     = !isNeg && player.balance < 300

  const balanceColor = isNeg ? "var(--status-pending)"
    : isLow ? "var(--status-partial)"
    : "var(--status-paid)"

  const prefix = isNeg ? "↓" : "↑"

  return (
    <div
      onClick={() => navigate(`/player/${player.id}`)}
      className="premium-card interactive cursor-pointer overflow-hidden"
      style={{
        borderLeft: `3px solid ${balanceColor}`,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
        {/* Avatar */}
        <div
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            flexShrink: 0,
            overflow: "hidden",
            background: player.photo ? "transparent" : avatarGradient(player.name),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: "16px",
            letterSpacing: "-0.01em",
          }}
        >
          {player.photo
            ? <img src={player.photo} alt={player.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : getInitials(player.name)
          }
        </div>

        <div style={{ minWidth: 0 }}>
          <p style={{
            fontWeight: 700,
            fontSize: "15px",
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {player.name}
          </p>
          <p style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            margin: "2px 0 0",
          }}>
            {formatPhoneDisplay(player.phone)}
          </p>
        </div>
      </div>

      {/* Balance */}
      <p style={{
        fontSize: "17px",
        fontWeight: 800,
        color: balanceColor,
        flexShrink: 0,
        fontFeatureSettings: '"tnum" 1',
        letterSpacing: "-0.02em",
      }}>
        {prefix} {formatCurrency(Math.abs(player.balance))}
      </p>
    </div>
  )
}
