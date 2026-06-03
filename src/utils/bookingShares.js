import { createId } from "./id"
import {
  calculateTeamWiseSplit,
  calculatePlayerWiseSplit
} from "./costSplit"

export function applySharesToPlayers(players, booking, previousBooking = null) {
  let nextPlayers = [...players]

  const revert = (targetBooking) => {
    // Handle individual bookings
    if (targetBooking?.playerIds?.length) {
      const share = targetBooking.amount / targetBooking.playerIds.length

      nextPlayers = nextPlayers.map((player) => {
        if (!targetBooking.playerIds.includes(player.id)) {
          return player
        }

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

    // Handle team bookings
    if (targetBooking?.teams?.length) {
      const splitCosts =
        targetBooking.splitMode === "Team"
          ? calculateTeamWiseSplit(targetBooking.amount, targetBooking.teams)
          : calculatePlayerWiseSplit(targetBooking.amount, targetBooking.teams)

      nextPlayers = nextPlayers.map((player) => {
        let playerShare = 0
        const teamWithPlayer = targetBooking.teams.find((team) =>
          team.playerIds.includes(player.id)
        )

        if (teamWithPlayer && splitCosts[teamWithPlayer.id]) {
          playerShare = splitCosts[teamWithPlayer.id].playerCost
        }

        if (playerShare === 0) return player

        return {
          ...player,
          balance: player.balance + playerShare,
          history: player.history.filter(
            (item) => item.bookingId !== targetBooking.id
          )
        }
      })
      return
    }
  }

  if (previousBooking) {
    revert(previousBooking)
  }

  if (!booking) {
    return nextPlayers
  }

  // Handle individual bookings
  if (booking.bookingType === "Individual" || booking.playerIds?.length) {
    if (!booking.playerIds?.length) {
      return nextPlayers
    }

    const share = booking.amount / booking.playerIds.length

    return nextPlayers.map((player) => {
      if (!booking.playerIds.includes(player.id)) {
        return player
      }

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

  // Handle team bookings
  if (booking.bookingType === "Team" || booking.teams?.length) {
    if (!booking.teams?.length) {
      return nextPlayers
    }

    const splitCosts =
      booking.splitMode === "Team"
        ? calculateTeamWiseSplit(booking.amount, booking.teams)
        : calculatePlayerWiseSplit(booking.amount, booking.teams)

    return nextPlayers.map((player) => {
      const teamWithPlayer = booking.teams.find((team) =>
        team.playerIds.includes(player.id)
      )

      if (!teamWithPlayer || !splitCosts[teamWithPlayer.id]) {
        return player
      }

      const playerShare = splitCosts[teamWithPlayer.id].playerCost

      if (playerShare === 0) return player

      const historyItem = {
        id: createId("h"),
        bookingId: booking.id,
        sportId: booking.sportId,
        turfId: booking.turfId,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        amount: playerShare,
        type: "debit",
        notes: `Booking ${booking.id} (${teamWithPlayer.name})`
      }

      return {
        ...player,
        balance: player.balance - playerShare,
        history: [historyItem, ...player.history]
      }
    })
  }

  return nextPlayers
}
