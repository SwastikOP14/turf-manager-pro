import { getInitialData } from "./initialData"

const STORAGE_KEY = "turf-manager-pro-data"

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
