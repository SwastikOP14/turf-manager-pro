import {
  Trophy,
  Circle,
  Dumbbell,
  Volleyball,
  Feather,
  CircleDot,
  Target,
  Activity
} from "lucide-react"

const ICONS = {
  cricket: Trophy,
  football: Circle,
  basketball: Dumbbell,
  volleyball: Volleyball,
  badminton: Feather,
  tennis: CircleDot,
  hockey: Target,
  default: Activity
}

export default function SportIcon({
  sportId,
  sportName,
  size = 22,
  className = ""
}) {
  const key = (sportId || sportName || "cricket")
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "")

  const matchedKey =
    Object.keys(ICONS).find((name) => key.includes(name)) || "default"

  const Icon = ICONS[matchedKey]

  return (
    <Icon
      size={size}
      className={className}
    />
  )
}
