export function createId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * createBookingId
 * ───────────────
 * Always increments from the stored high-water mark — never re-uses
 * an ID even after deletions.
 *
 * @param {object[]} existingBookings  – current bookings array
 * @param {number}   counter           – the persisted high-water counter
 * @returns {{ id: string, nextCounter: number }}
 */
export function createBookingId(existingBookings, counter) {
  // High-water from stored counter OR from existing IDs (migration fallback)
  const fromBookings = existingBookings
    .map((b) => parseInt(String(b.id).replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n))

  const highWater = Math.max(
    typeof counter === "number" ? counter : 0,
    fromBookings.length ? Math.max(...fromBookings) : 0
  )

  const next = highWater + 1
  return {
    id:          `BK${String(next).padStart(4, "0")}`,
    nextCounter: next,
  }
}
