import { normalizePhone } from "./phone"

export function normalizeName(name = "") {
  return name.trim().replace(/\s+/g, " ").toLowerCase()
}

export function isDuplicateName(players, name, excludeId = null) {
  const target = normalizeName(name)

  return players.some(
    (player) =>
      player.id !== excludeId &&
      normalizeName(player.name) === target
  )
}

export function isDuplicatePhone(players, phone, excludeId = null) {
  const target = normalizePhone(phone)

  if (!target) {
    return false
  }

  return players.some(
    (player) =>
      player.id !== excludeId &&
      normalizePhone(player.phone) === target
  )
}

export function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
}

export function getBalanceTone(balance) {
  if (balance < 0) {
    return "negative"
  }

  if (balance < 300) {
    return "low"
  }

  return "positive"
}

export function searchPlayers(players, query = "") {
  const q = query.trim().toLowerCase()

  if (!q) {
    return [...players]
  }

  const scored = players
    .map((player) => {
      const name = player.name.toLowerCase()
      const phone = player.phone

      let score = 0

      if (name.startsWith(q)) {
        score += 3
      } else if (name.includes(q)) {
        score += 2
      }

      if (phone.includes(q.replace(/\D/g, ""))) {
        score += 1
      }

      return { player, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.map((item) => item.player)
}
