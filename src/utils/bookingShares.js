import { createId } from "./id"

// ─── Helper: compute per-player costs using SQUAD-EQUAL split ───────────────
// Formula: costPerSquad = amount / numSquads
//          costPerPlayer = costPerSquad / playersInSquad
// This ensures each squad pays equal share, then splits within squad equally.
function computeSquadSplitCosts(amount, teams) {
  const numSquads = teams.length
  if (numSquads === 0) return {}

  const costPerSquad = amount / numSquads
  const result = {} // { [playerId]: cost }

  teams.forEach((team) => {
    const playerIds = team.playerIds || []
    if (playerIds.length === 0) return
    const costPerPlayer = costPerSquad / playerIds.length
    playerIds.forEach((pid) => {
      result[pid] = costPerPlayer
    })
  })

  return result
}

// ─── Main function ───────────────────────────────────────────────────────────
export function applySharesToPlayers(players, booking, previousBooking = null) {
  let nextPlayers = [...players]

  // ── REVERT previous booking's deductions ──────────────────────────────────
  const revert = (targetBooking) => {
    if (!targetBooking) return

    // Individual booking reversal
    if (
      targetBooking.bookingType === "Individual" ||
      (!targetBooking.bookingType && targetBooking.playerIds?.length)
    ) {
      if (!targetBooking.playerIds?.length) return

      const share = targetBooking.amount / targetBooking.playerIds.length

      nextPlayers = nextPlayers.map((player) => {
        if (!targetBooking.playerIds.includes(player.id)) return player
        return {
          ...player,
          balance: player.balance + share,
          history: player.history.filter(
            (item) => item.bookingId !== targetBooking.id
          )
        }
      })
      return
    }

    // Team/Squad booking reversal — use stored playerSplitCost if available
    if (targetBooking.bookingType === "Team" || targetBooking.teams?.length) {
      if (!targetBooking.teams?.length) return

      // Prefer stored playerSplitCost for precision
      const storedCosts = targetBooking.playerSplitCost || null
      const fallbackCosts = storedCosts
        ? null
        : computeSquadSplitCosts(targetBooking.amount, targetBooking.teams)

      nextPlayers = nextPlayers.map((player) => {
        const cost = storedCosts
          ? storedCosts[player.id]
          : fallbackCosts[player.id]

        if (!cost || cost === 0) return player

        return {
          ...player,
          balance: player.balance + cost,
          history: player.history.filter(
            (item) => item.bookingId !== targetBooking.id
          )
        }
      })
    }
  }

  // Run reversal if we have a previous booking (edit or delete)
  if (previousBooking) {
    revert(previousBooking)
  }

  // If booking is null, this was a delete — just return after reversal
  if (!booking) {
    return nextPlayers
  }

  // ── APPLY new booking's deductions ────────────────────────────────────────

  // Individual booking
  if (
    booking.bookingType === "Individual" ||
    (!booking.bookingType && booking.playerIds?.length)
  ) {
    if (!booking.playerIds?.length) return nextPlayers

    const share = booking.amount / booking.playerIds.length

    return nextPlayers.map((player) => {
      if (!booking.playerIds.includes(player.id)) return player

      const historyItem = {
        id: createId("h"),
        bookingId: booking.id,
        sportId: booking.sportId,
        turfId: booking.turfId,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        amount: share,
        type: "debit",
        notes: `Booking ${booking.id}`
      }

      return {
        ...player,
        balance: player.balance - share,
        history: [historyItem, ...player.history]
      }
    })
  }

  // Team/Squad booking — use squad-equal split formula
  if (booking.bookingType === "Team" || booking.teams?.length) {
    if (!booking.teams?.length) return nextPlayers

    // Use stored playerSplitCost from AppProvider if available,
    // otherwise compute fresh
    const costs =
      booking.playerSplitCost ||
      computeSquadSplitCosts(booking.amount, booking.teams)

    // Build a map of playerId → teamName for history notes
    const playerTeamName = {}
    booking.teams.forEach((team) => {
      ;(team.playerIds || []).forEach((pid) => {
        playerTeamName[pid] = team.name || "Squad"
      })
    })

    return nextPlayers.map((player) => {
      const cost = costs[player.id]
      if (!cost || cost === 0) return player

      const historyItem = {
        id: createId("h"),
        bookingId: booking.id,
        sportId: booking.sportId,
        turfId: booking.turfId,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        amount: cost,
        type: "debit",
        notes: `Booking ${booking.id} (${playerTeamName[player.id] || "Squad"})`
      }

      return {
        ...player,
        balance: player.balance - cost,
        history: [historyItem, ...player.history]
      }
    })
  }

  return nextPlayers
}