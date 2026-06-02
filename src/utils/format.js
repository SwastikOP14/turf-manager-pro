export function formatCurrency(amount = 0) {
  const value = Number(amount) || 0

  return `₹${value.toLocaleString("en-IN")}`
}

export function formatDisplayDate(dateInput) {
  if (!dateInput) {
    return ""
  }

  const date = new Date(dateInput)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })
}

export function toDateKey(dateInput) {
  if (!dateInput) {
    return ""
  }

  const date = new Date(dateInput)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")

  return `${y}-${m}-${d}`
}

export function formatTime12(time24 = "") {
  if (!time24) {
    return ""
  }

  const [hStr, mStr] = time24.split(":")
  let hours = parseInt(hStr, 10)
  const minutes = mStr || "00"
  const period = hours >= 12 ? "PM" : "AM"

  hours = hours % 12
  if (hours === 0) {
    hours = 12
  }

  return `${String(hours).padStart(2, "0")}:${minutes} ${period}`
}

export function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) {
    return ""
  }

  return `${formatTime12(startTime)} - ${formatTime12(endTime)}`
}

export function timeTo24(hour, minute, period) {
  if (!hour || !minute) {
    return ""
  }

  let h = parseInt(hour, 10)

  if (period === "PM" && h !== 12) {
    h += 12
  }

  if (period === "AM" && h === 12) {
    h = 0
  }

  return `${String(h).padStart(2, "0")}:${minute}`
}

export function timeFrom24(time24 = "") {
  if (!time24) {
    return { hour: "", minute: "", period: "AM" }
  }

  const [hStr, mStr] = time24.split(":")
  let h = parseInt(hStr, 10)
  const period = h >= 12 ? "PM" : "AM"

  h = h % 12
  if (h === 0) {
    h = 12
  }

  return {
    hour: String(h).padStart(2, "0"),
    minute: mStr,
    period
  }
}
