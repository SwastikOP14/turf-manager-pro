// Sport preference definitions — emoji, fields, options for each supported sport.
// Order of SUPPORTED_SPORTS defines the picker display order.

export const SUPPORTED_SPORTS = [
  { id: "cricket",      name: "Cricket",      emoji: "🏏" },
  { id: "football",     name: "Football",     emoji: "⚽" },
  { id: "badminton",    name: "Badminton",    emoji: "🏸" },
  { id: "tennis",       name: "Tennis",       emoji: "🎾" },
  { id: "basketball",   name: "Basketball",   emoji: "🏀" },
  { id: "volleyball",   name: "Volleyball",   emoji: "🏐" },
  { id: "hockey",       name: "Hockey",       emoji: "🏑" },
  { id: "tabletennis",  name: "Table Tennis", emoji: "🏓" },
]

export function getSportMeta(id) {
  return SUPPORTED_SPORTS.find((s) => s.id === id) || { id, name: id, emoji: "🏅" }
}

// ── Default pref objects per sport ─────────────────────────────────────────

export function defaultPref(sportId) {
  switch (sportId) {
    case "cricket":
      return { sportId, battingHand: "R", battingPosition: "", bowlingHand: "R", bowlingType: "", wicketKeeper: false }
    case "football":
      return { sportId, preferredFoot: "R", position: "", goalKeeper: false }
    case "badminton":
      return { sportId, playingHand: "R", position: "" }
    case "tennis":
      return { sportId, playingHand: "R", position: "" }
    case "basketball":
      return { sportId, position: "" }
    case "volleyball":
      return { sportId, position: "" }
    case "hockey":
      return { sportId, playingHand: "R", position: "" }
    case "tabletennis":
      return { sportId, playingHand: "R", position: "" }
    default:
      return { sportId }
  }
}

// ── Dropdown options per sport ──────────────────────────────────────────────

export const CRICKET_BATTING_POSITIONS = [
  "Opening Batsman", "Top Order Batsman", "Middle Order Batsman", "Lower Order Batsman"
]
export const CRICKET_BOWLING_TYPES = [
  "Right Arm Fast", "Left Arm Fast", "Right Arm Medium", "Left Arm Medium",
  "Right Arm Leg Spin", "Left Arm Chinaman", "Right Arm Off Spin", "Left Arm Orthodox"
]
export const FOOTBALL_POSITIONS = [
  "Striker", "Winger", "Midfielder", "Defender", "Goalkeeper"
]
export const BADMINTON_POSITIONS = [
  "Singles Player", "Doubles Player", "Mixed Doubles Player"
]
export const TENNIS_POSITIONS = [
  "Singles Player", "Doubles Player", "Mixed Doubles Player"
]
export const BASKETBALL_POSITIONS = [
  "Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"
]
export const VOLLEYBALL_POSITIONS = [
  "Setter", "Libero", "Outside Hitter", "Middle Blocker", "Opposite Hitter"
]
export const HOCKEY_POSITIONS = [
  "Forward", "Midfielder", "Defender", "Goalkeeper"
]
export const TABLE_TENNIS_POSITIONS = [
  "Singles Player", "Doubles Player", "Mixed Doubles Player"
]

// ── Build a readable summary line for a pref object ─────────────────────────

export function buildSummary(pref) {
  if (!pref) return ""
  const parts = []

  switch (pref.sportId) {
    case "cricket":
      if (pref.battingHand)    parts.push(`${pref.battingHand === "R" ? "Right" : "Left"} Hand`)
      if (pref.battingPosition) parts.push(pref.battingPosition)
      if (pref.bowlingType)    parts.push(pref.bowlingType)
      if (pref.wicketKeeper)   parts.push("WK")
      break
    case "football":
      if (pref.preferredFoot)  parts.push(`${pref.preferredFoot === "R" ? "Right" : "Left"} Foot`)
      if (pref.position)       parts.push(pref.position)
      if (pref.goalKeeper)     parts.push("GK")
      break
    case "badminton":
    case "tennis":
    case "hockey":
    case "tabletennis":
      if (pref.playingHand)    parts.push(`${pref.playingHand === "R" ? "Right" : "Left"} Hand`)
      if (pref.position)       parts.push(pref.position)
      break
    case "basketball":
    case "volleyball":
      if (pref.position)       parts.push(pref.position)
      break
    default:
      break
  }

  return parts.join(" • ") || "Not configured"
}
