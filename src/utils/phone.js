export function normalizePhone(phone = "") {
  const digits = String(phone).replace(/\D/g, "")

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2)
  }

  if (digits.length === 10) {
    return digits
  }

  return null
}

export function isValidIndianPhone(phone = "") {
  const normalized = normalizePhone(phone)
  return Boolean(normalized && /^[6-9]\d{9}$/.test(normalized))
}

export function formatPhoneDisplay(phone = "") {
  const normalized = normalizePhone(phone)

  if (!normalized) {
    return phone
  }

  return `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`
}

export function formatPhoneInput(value = "") {
  const digits = String(value).replace(/\D/g, "").slice(0, 10)

  if (!digits) {
    return "+91 "
  }

  if (digits.length <= 5) {
    return `+91 ${digits}`
  }

  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
}
