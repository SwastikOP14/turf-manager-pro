const SPORT_EMOJIS = {
  cricket: "🏏",
  football: "⚽", 
  soccer: "⚽",
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
  default: "🏅" // Medal emoji for sports without specific icons
}

export default function SportIcon({
  sportId,
  sportName,
  sport, // Full sport object from context
  size = 22,
  className = ""
}) {
  // Priority order: sport.icon (from database) > name matching > default
  
  // 1. If we have a full sport object with an icon, use it
  if (sport?.icon) {
    return (
      <span
        style={{ fontSize: size }}
        className={className}
        role="img"
        aria-label={sport.name || sportName || sportId || "sport"}
      >
        {sport.icon}
      </span>
    )
  }

  // 2. If sport has no icon but we have it, use neutral emoji
  if (sport && !sport.icon) {
    return (
      <span
        style={{ fontSize: size }}
        className={className}
        role="img"
        aria-label={sport.name || "sport"}
      >
        🏅
      </span>
    )
  }

  // 3. Fallback to name-based matching (for backwards compatibility)
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