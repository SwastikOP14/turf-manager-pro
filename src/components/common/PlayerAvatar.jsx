const AVATAR_COLORS = [
  { bg: "#DBEAFE", text: "#2563EB" },
  { bg: "#D1FAE5", text: "#059669" },
  { bg: "#EDE9FE", text: "#7C3AED" },
  { bg: "#FEF3C7", text: "#D97706" },
  { bg: "#FCE7F3", text: "#DB2777" },
  { bg: "#FFE4E6", text: "#E11D48" },
  { bg: "#E0F2FE", text: "#0284C7" },
]

function getAvatarColor(seed) {
  const hash = String(seed).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export default function PlayerAvatar({ player, size = 40 }) {
  if (player?.photo) {
    return (
      <img
        src={player.photo}
        alt={player.name}
        style={{ 
          width: size, 
          height: size, 
          borderRadius: "50%", 
          objectFit: "cover", 
          flexShrink: 0 
        }}
      />
    )
  }

  const color = getAvatarColor(player?.id || player?.name || "?")
  const initials = player?.name
    ? player.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  return (
    <div style={{
      width: size, 
      height: size, 
      borderRadius: "50%",
      background: color.bg, 
      color: color.text,
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      fontWeight: 700, 
      fontSize: size * 0.36, 
      flexShrink: 0,
      letterSpacing: "-0.02em"
    }}>
      {initials}
    </div>
  )
}