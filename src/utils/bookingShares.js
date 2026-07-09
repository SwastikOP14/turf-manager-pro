import { createId } from "./id"

// Only Individual bookings touch player balances directly.
// Team/Squad bookings are handled separately via applySquadShares (squad contributions).
export function applySharesToPlayers(players, booking, previousBooking = null) {
  let nextPlayers = [...players]

  const revert = (targetBooking) => {
    if (!targetBooking) return
    if (targetBooking.bookingType !== "Individual") return
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
  }

  if (previousBooking) revert(previousBooking)
  if (!booking) return nextPlayers
  if (booking.bookingType !== "Individual") return nextPlayers
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
      // No longer storing amount statically - will be derived live
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

// ── NEW: Squad contribution deduction/restoration for Team bookings ──────
// Deducts/restores a lump sum from each squad's pooled contributions.
// Does NOT touch individual player balances.
export function applySquadShares(squads, booking, previousBooking = null) {
  let nextSquads = [...squads]

  const revertSquad = (targetBooking) => {
    if (!targetBooking || targetBooking.bookingType !== "Team") return
    if (!targetBooking.teams?.length) return

    const numSquads = targetBooking.teams.length
    const costPerSquad =
      targetBooking.squadSplitCost ??
      (numSquads > 0 ? targetBooking.amount / numSquads : 0)

    nextSquads = nextSquads.map((sq) => {
      const team = targetBooking.teams.find((t) => t.squadId === sq.id)
      if (!team) return sq

      // Remove the debit contribution entry tied to this booking
      return {
        ...sq,
        contributions: (sq.contributions || []).filter(
          (c) => c.bookingId !== targetBooking.id
        )
      }
    })
  }

  if (previousBooking) revertSquad(previousBooking)
  if (!booking || booking.bookingType !== "Team") return nextSquads
  if (!booking.teams?.length) return nextSquads

  const numSquads = booking.teams.length
  const costPerSquad = numSquads > 0 ? booking.amount / numSquads : 0

  nextSquads = nextSquads.map((sq) => {
    const team = booking.teams.find((t) => t.squadId === sq.id)
    if (!team) return sq

    const debitEntry = {
      id: createId("c"),
      playerId: null,
      bookingId: booking.id,
      amount: -costPerSquad,
      date: booking.date,
      notes: `Booking ${booking.id} (${team.name || "Squad"})`
    }

    return {
      ...sq,
      contributions: [...(sq.contributions || []), debitEntry]
    }
  })

  return nextSquads
}

// ── NEW: Add booking history entries to squad players ──────────────────────
// For Team bookings, add history entries to all active players in each squad
// so their individual payment history shows they participated in the booking
export function applySquadPlayerHistory(players, booking, previousBooking = null) {
  let nextPlayers = [...players]

  const revert = (targetBooking) => {
    if (!targetBooking || targetBooking.bookingType !== "Team") return
    if (!targetBooking.teams?.length) return

    // Remove history entries for all players in all teams
    nextPlayers = nextPlayers.map((player) => {
      const isInTeam = targetBooking.teams.some(team =>
        team.playerIds?.includes(player.id)
      )
      if (!isInTeam) return player

      return {
        ...player,
        history: player.history.filter(
          (item) => item.bookingId !== targetBooking.id
        )
      }
    })
  }

  if (previousBooking) revert(previousBooking)
  if (!booking || booking.bookingType !== "Team") return nextPlayers
  if (!booking.teams?.length) return nextPlayers

  // Add history entries for all active players in each squad
  nextPlayers = nextPlayers.map((player) => {
    // Find if this player is in any team
    const playerTeam = booking.teams.find(team =>
      team.playerIds?.includes(player.id)
    )
    
    if (!playerTeam) return player

    // Check if player is excluded (not playing)
    const isExcluded = playerTeam.excludedPlayerIds?.includes(player.id)
    if (isExcluded) return player

    // Create history entry for this player
    const historyItem = {
      id: createId("h"),
      bookingId: booking.id,
      sportId: booking.sportId,
      turfId: booking.turfId,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      // No amount stored - will be derived live from booking
      type: "debit",
      notes: `Booking ${booking.id} (${playerTeam.name || "Squad"})`
    }

    return {
      ...player,
      history: [historyItem, ...player.history]
    }
  })

  return nextPlayers
}