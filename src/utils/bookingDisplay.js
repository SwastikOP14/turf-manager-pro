export function getBookingPlayerCount(booking) {
  if (!booking) return 0

  if (booking.bookingType === "Team" || booking.teams?.length) {
    return (
      booking.teams?.reduce(
        (sum, team) => sum + (team.playerIds?.length || 0),
        0
      ) || 0
    )
  }

  return booking.playerIds?.length || 0
}

export function resolveSport(booking, sports, getSportById) {
  if (!booking) {
    return { id: "", name: "Sport", sport: null }
  }

  const byId = booking.sportId ? getSportById(booking.sportId) : null
  if (byId) {
    return { id: byId.id, name: byId.name, sport: byId }
  }

  if (booking.sportName) {
    const byName = sports.find(
      (s) => s.name?.toLowerCase() === String(booking.sportName).toLowerCase()
    )
    return {
      id: booking.sportId || byName?.id || "",
      name: booking.sportName,
      sport: byName || null
    }
  }

  const legacyName = booking.sport
  if (legacyName) {
    const byName = sports.find(
      (s) => s.name?.toLowerCase() === String(legacyName).toLowerCase()
    )
    if (byName) {
      return { id: byName.id, name: byName.name, sport: byName }
    }
    return { id: booking.sportId || "", name: legacyName, sport: null }
  }

  return { id: "", name: "Sport", sport: null }
}

export function resolveTurf(booking, turfs, getTurfById) {
  if (!booking) {
    return { id: "", name: "Unknown Turf", turf: null }
  }

  const byId = booking.turfId ? getTurfById(booking.turfId) : null
  if (byId) {
    return { id: byId.id, name: byId.name, turf: byId }
  }

  if (booking.turfName) {
    const byName = turfs.find(
      (t) => t.name?.toLowerCase() === String(booking.turfName).toLowerCase()
    )
    return {
      id: booking.turfId || byName?.id || "",
      name: booking.turfName,
      turf: byName || null
    }
  }

  const legacyName = booking.turf
  if (legacyName) {
    const byName = turfs.find(
      (t) => t.name?.toLowerCase() === String(legacyName).toLowerCase()
    )
    if (byName) {
      return { id: byName.id, name: byName.name, turf: byName }
    }
    return { id: booking.turfId || "", name: legacyName, turf: null }
  }

  return { id: "", name: "Unknown Turf", turf: null }
}
