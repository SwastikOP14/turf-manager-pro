import { useNavigate } from "react-router-dom"
import { useRef } from "react"
import { Plus, Check } from "lucide-react"
import { formatCurrency } from "../../utils/format"
import { formatPhoneDisplay } from "../../utils/phone"
import PlayerAvatar from "../common/PlayerAvatar"
import { useHaptics } from "../../context/HapticsContext"

export default function PlayerCard({
  player, onContribute, squadId,
  selectMode = false, selected = false, onSelect, onLongPress,
}) {
  const navigate = useNavigate()
  const haptics = useHaptics()
  const pressTimer = useRef(null)
  const startCoords = useRef({ x: 0, y: 0 })
  const moved = useRef(false)

  const isNeg    = player.balance < 0
  const isLow    = !isNeg && player.balance < 300

  const balanceColor = isNeg ? "var(--status-pending)"
    : isLow ? "var(--status-partial)"
    : "var(--status-paid)"

  const prefix = isNeg ? "↓" : "↑"

  const startPress = (e) => {
    if (selectMode) return
    const point = e.touches ? e.touches[0] : e
    startCoords.current = { x: point.clientX, y: point.clientY }
    moved.current = false
    pressTimer.current = setTimeout(() => {
      if (!moved.current) {
        haptics.trigger(8)
        onLongPress?.(player.id)
      }
    }, 500)
  }

  const movePress = (e) => {
    const point = e.touches ? e.touches[0] : e
    const dx = Math.abs(point.clientX - startCoords.current.x)
    const dy = Math.abs(point.clientY - startCoords.current.y)
    if (dx > 8 || dy > 8) {
      moved.current = true
      clearTimeout(pressTimer.current)
    }
  }

  const endPress = () => clearTimeout(pressTimer.current)

  const handleClick = () => {
    clearTimeout(pressTimer.current)
    if (selectMode) {
      haptics.trigger(8)
      onSelect?.(player.id)
      return
    }
    if (onContribute && squadId) {
      navigate(`/squad/${squadId}/player/${player.id}`)
      return
    }
    if (onContribute) return
    navigate(`/player/${player.id}`)
  }

  return (
    <div
      onClick={handleClick}
      onMouseDown={startPress} onMouseMove={movePress} onMouseUp={endPress} onMouseLeave={endPress}
      onTouchStart={startPress} onTouchMove={movePress} onTouchEnd={endPress} onTouchCancel={endPress}
      className="premium-card interactive overflow-hidden"
      style={{
        borderLeft: `3px solid ${selected ? "var(--brand)" : balanceColor}`,
        background: selected ? "rgba(0,212,160,0.08)" : undefined,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        cursor: onContribute && !selectMode ? "default" : "pointer",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
        {/* Avatar */}
        <PlayerAvatar player={player} size={46} />

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

      {/* Right side — balance + optional contribute button */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <p style={{
          fontSize: "17px",
          fontWeight: 800,
          color: balanceColor,
          fontFeatureSettings: '"tnum" 1',
          letterSpacing: "-0.02em",
          margin: 0,
        }}>
          {prefix} {formatCurrency(Math.abs(player.balance))}
        </p>

        {selectMode ? (
          <div
            style={{
              width: "24px", height: "24px", borderRadius: "50%",
              border: selected ? "none" : "2px solid var(--bg-border)",
              background: selected ? "var(--brand)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {selected && <Check size={13} strokeWidth={3} color="#000" />}
          </div>
        ) : onContribute && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onContribute(player)
            }}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "none",
              background: "linear-gradient(135deg, #00D4A0, #00B4D8)",
              color: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
            title="Add to squad balance"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  )
}