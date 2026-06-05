const SPORT_EMOJIS = {
  cricket:      "🏏",
  football:     "⚽",
  soccer:       "⚽",
  basketball:   "🏀",
  volleyball:   "🏐",
  badminton:    "🏸",
  tennis:       "🎾",
  hockey:       "🏑",
  rugby:        "🏉",
  baseball:     "⚾",
  softball:     "🥎",
  golf:         "⛳",
  swimming:     "🏊",
  cycling:      "🚴",
  boxing:       "🥊",
  wrestling:    "🤼",
  tabletennis:  "🏓",
  pingpong:     "🏓",
  archery:      "🏹",
  skiing:       "⛷️",
  snowboarding: "🏂",
  surfing:      "🏄",
  gymnastics:   "🤸",
  weightlifting:"🏋️",
  running:      "🏃",
  athletics:    "🏃",
  default:      "🏅"
}

function resolveEmoji(sport, sportId, sportName) {
  // Build a set of keys to try, in priority order
  const candidates = [
    sport?.icon,        // "cricket", "football" etc stored in DB
    sport?.id,          // sport id
    sportId,            // prop sportId
    sport?.name,        // sport name
    sportName           // prop sportName
  ]

  for (const raw of candidates) {
    if (!raw) continue
    const key = raw.toString().toLowerCase().replace(/[\s_-]+/g, "")
    // exact match first
    if (SPORT_EMOJIS[key]) return SPORT_EMOJIS[key]
    // then partial match
    const partial = Object.keys(SPORT_EMOJIS).find((k) => key.includes(k) || k.includes(key))
    if (partial) return SPORT_EMOJIS[partial]
  }

  return SPORT_EMOJIS.default
}

export default function SportIcon({
  sportId,
  sportName,
  sport,
  size = 24,
  className = ""
}) {
  const emoji = resolveEmoji(sport, sportId, sportName)

  return (
    <span
      style={{ fontSize: size }}
      className={className}
      role="img"
      aria-label={sport?.name || sportName || sportId || "sport"}
    >
      {emoji}
    </span>
  )
}
