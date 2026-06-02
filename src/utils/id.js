export function createId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function createBookingId(existingBookings) {
  const nums = existingBookings
    .map((b) => parseInt(String(b.id).replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n))

  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `BK${String(next).padStart(4, "0")}`
}
