const SPORT_EMOJIS = {
  cricket: "🏏",
  football: "⚽",
  basketball: "🏀",
  volleyball: "🏐",
  badminton: "🏸",
  tennis: "🎾",
  hockey: "🏑",
  rugby: "🏉",
  baseball: "⚾",
  softball: "🥎",
  golf: "⛳",
  swimming: "🏊",
  cycling: "🚴",
  boxing: "🥊",
  wrestling: "🤼",
  tabletennis: "🏓",
  pingpong: "🏓",
  archery: "🏹",
  skiing: "⛷️",
  snowboarding: "🏂",
  surfing: "🏄",
  gymnastics: "🤸",
  weightlifting: "🏋️",
  running: "🏃",
  athletics: "🏃",
  default: "🏅"
}

export default function SportIcon({
  sportId,
  sportName,
  size = 22,
  className = ""
}) {
  const key = (sportId || sportName || "")
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "")

  const matchedKey =
    Object.keys(SPORT_EMOJIS).find((name) => key.includes(name)) || "default"

  const emoji = SPORT_EMOJIS[matchedKey]

  return (
    <span
      style={{ fontSize: size }}
      className={className}
      role="img"
      aria-label={sportName || sportId || "sport"}
    >
      {emoji}
    </span>
  )
}
