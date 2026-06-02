export function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function getWeekRange(reference = new Date()) {
  const date = new Date(reference)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day

  const start = new Date(date)
  start.setDate(date.getDate() + diff)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

export function getMonthRange(reference = new Date()) {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1)
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

export function getYearRange(reference = new Date()) {
  const start = new Date(reference.getFullYear(), 0, 1)
  const end = new Date(reference.getFullYear(), 11, 31, 23, 59, 59, 999)
  return { start, end }
}

export function isDateInRange(dateInput, start, end) {
  const date = startOfDay(new Date(dateInput))

  return date >= startOfDay(start) && date <= endOfDay(end)
}

export function filterBookingsByPeriod(bookings, period, customRange = null) {
  if (period === "All") {
    return bookings
  }

  if (period === "Custom" && customRange?.start && customRange?.end) {
    return bookings.filter((booking) =>
      isDateInRange(booking.date, customRange.start, customRange.end)
    )
  }

  const now = new Date()

  if (period === "This Week") {
    const { start, end } = getWeekRange(now)
    return bookings.filter((booking) => isDateInRange(booking.date, start, end))
  }

  if (period === "This Month") {
    const { start, end } = getMonthRange(now)
    return bookings.filter((booking) => isDateInRange(booking.date, start, end))
  }

  if (period === "This Year") {
    const { start, end } = getYearRange(now)
    return bookings.filter((booking) => isDateInRange(booking.date, start, end))
  }

  return bookings
}
