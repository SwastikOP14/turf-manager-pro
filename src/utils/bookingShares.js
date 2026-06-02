import { createId } from "./id"

export function applySharesToPlayers(players, booking, previousBooking = null) {
  let nextPlayers = [...players]

  const revert = (targetBooking) => {
    if (!targetBooking?.playerIds?.length) {
      return
    }

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
  }

  if (previousBooking) {
    revert(previousBooking)
  }

  if (!booking?.playerIds?.length) {
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
