import { getInitialData } from "./initialData"

const STORAGE_KEY = "turf-manager-pro-data"

// Ensure every player has all required fields (migration for older stored data)
function migratePlayers(players = []) {
  return players.map((p) => ({
    sportPreferences: [],   // added in v1.1 — default for old records
    ...p,
  }))
}

export function loadAppData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return getInitialData()
    }

    const parsed = JSON.parse(raw)

    return {
      ...getInitialData(),
      ...parsed,
      players: migratePlayers(parsed.players || []),
      // Preserve the high-water booking counter so IDs never repeat
      bookingCounter: typeof parsed.bookingCounter === "number" ? parsed.bookingCounter : 0,
      settings: {
        ...getInitialData().settings,
        ...parsed.settings
      }
    }
  } catch {
    return getInitialData()
  }
}

export function saveAppData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
