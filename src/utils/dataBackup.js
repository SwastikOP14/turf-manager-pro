/**
 * dataBackup.js
 * ─────────────
 * Export: builds an .xlsx from app state and triggers a native share sheet
 *         (Android → user picks Downloads / Drive / WhatsApp etc.)
 *         or a browser <a> download on web.
 *
 * Import: reads an .xlsx or .csv file selected by the user and returns
 *         parsed booking rows so the caller can decide what to do.
 *
 * Squad bookings use per-squad columns so import can correctly attribute
 * players to their squads:
 *   Squad 1 Name | Squad 1 Players | Squad 2 Name | Squad 2 Players | ...
 *
 * Uses SheetJS (xlsx ^0.18) + @capacitor/filesystem + @capacitor/share.
 * No <form> elements used anywhere.
 */

import * as XLSX from "xlsx"
import { Capacitor } from "@capacitor/core"
import { Filesystem, Directory } from "@capacitor/filesystem"
import { Share } from "@capacitor/share"

// ─── helpers ────────────────────────────────────────────────────────────────

function isNative() {
  const p = Capacitor.getPlatform?.() ?? "web"
  return p === "android" || p === "ios"
}

// Find the max number of squads across all team bookings
// so we know how many Squad N Name / Squad N Players columns to create
function getMaxSquads(bookings) {
  let max = 0
  for (const b of bookings) {
    if (b.bookingType === "Team" && b.teams?.length) {
      max = Math.max(max, b.teams.length)
    }
  }
  return max
}

/**
 * Build an XLSX workbook from current app data.
 * Squad bookings get per-squad columns: Squad 1 Name, Squad 1 Players, Squad 2 Name, Squad 2 Players...
 */
function buildWorkbook(bookings = [], turfs = [], sports = [], players = [], squads = []) {
  const turfMap = Object.fromEntries(turfs.map(t => [t.id, t]))
  const sportMap = Object.fromEntries(sports.map(s => [s.id, s]))
  const playerMap = Object.fromEntries(players.map(p => [p.id, p]))
  const squadMap = Object.fromEntries(squads.map(s => [s.id, s]))

  const maxSquads = getMaxSquads(bookings)

  // Build dynamic squad columns: Squad 1 Name, Squad 1 Players, Squad 2 Name, Squad 2 Players...
  const squadHeaders = []
  for (let i = 1; i <= maxSquads; i++) {
    squadHeaders.push(`Squad ${i} Name`, `Squad ${i} Players`)
  }

  const header = [
    "Serial No", "Booking ID", "Date", "Start Time", "End Time", "Sport",
    "Turf Name", "Location", "Booking Type",
    // Squad columns come here (dynamic)
    ...squadHeaders,
    // Individual players column (used when bookingType = Individual)
    "Individual Players", "No. of Players",
    "Paid By", "Total Amount", "Paid Amount", "Status"
  ]

  const rows = bookings.map((b, i) => {
    const turf = turfMap[b.turfId]
    const sport = sportMap[b.sportId]
    const payer = playerMap[b.paidByPlayerId]

    // Build squad columns
    const squadCols = []
    for (let s = 0; s < maxSquads; s++) {
      const team = b.teams?.[s]
      if (b.bookingType === "Team" && team) {
        const squadData = squadMap[team.squadId]
        const squadName = squadData?.name || team.name || ""
        const playerIds = team.playerIds || []
        const playerNames = playerIds.map(id => playerMap[id]?.name || id).join(", ")
        squadCols.push(squadName, playerNames)
      } else {
        squadCols.push("", "")
      }
    }

    // Individual players
    let playerNames = ""
    let playerCount = 0
    if (b.bookingType === "Team" && b.teams?.length) {
      // For team bookings, count all players across squads
      const allIds = b.teams.flatMap(t => t.playerIds || [])
      playerCount = allIds.length
      playerNames = "" // individual column left blank for team bookings
    } else {
      const ids = b.playerIds || []
      playerNames = ids.map(id => playerMap[id]?.name || id).join(", ")
      playerCount = ids.length || b.nosOfPlayers || 0
    }

    return [
      i + 1,
      b.id || "",
      b.date || "",
      b.startTime || "",
      b.endTime || "",
      sport?.name || b.sportName || "",
      turf?.name || b.turfName || "",
      turf?.location || "",
      b.bookingType === "Team" ? "Squad" : "Individual",
      ...squadCols,
      playerNames,
      playerCount,
      payer?.name || b.paidBy || "",
      b.amount ?? 0,
      b.paidAmount ?? 0,
      b.status || ""
    ]
  })

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows])

  // Column widths
  const baseCols = [
    { wch: 10 }, { wch: 14 }, { wch: 13 }, { wch: 11 }, { wch: 11 }, { wch: 14 },
    { wch: 22 }, { wch: 22 }, { wch: 14 },
  ]
  const squadColWidths = Array(maxSquads * 2).fill(null).map((_, i) =>
    i % 2 === 0 ? { wch: 18 } : { wch: 36 }
  )
  const endCols = [
    { wch: 36 }, { wch: 14 },
    { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 12 }
  ]
  ws["!cols"] = [...baseCols, ...squadColWidths, ...endCols]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Bookings")

  const arrayBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  const base64 = XLSX.write(wb, { bookType: "xlsx", type: "base64" })

  return { arrayBuffer, base64 }
}

// ─── EXPORT ─────────────────────────────────────────────────────────────────

export async function exportToXlsx(appData, filename = "turf-bookings") {
  const { bookings = [], turfs = [], sports = [], players = [], squads = [] } = appData
  const fname = `${filename.trim() || "turf-bookings"}.xlsx`
  const { arrayBuffer, base64 } = buildWorkbook(bookings, turfs, sports, players, squads)

  if (isNative()) {
    await Filesystem.writeFile({
      path: fname,
      data: base64,
      directory: Directory.Cache,
      recursive: true,
    })

    const { uri } = await Filesystem.getUri({
      path: fname,
      directory: Directory.Cache,
    })

    await Share.share({
      title: "Export Bookings",
      text: "Turf Manager Pro — Booking Data",
      url: uri,
      dialogTitle: "Save or share your export",
    })

    return { success: true, message: `${fname} ready to save` }
  } else {
    const blob = new Blob([new Uint8Array(arrayBuffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fname
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url) }, 500)
    return { success: true, message: `Downloaded ${fname}` }
  }
}

// ─── IMPORT ─────────────────────────────────────────────────────────────────

export function parseImportFile(file, turfs = [], sports = [], squads = []) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const wb = XLSX.read(data, { type: "array", cellDates: true })

        const sheetName = wb.SheetNames[0]
        if (!sheetName) throw new Error("No sheet found in file")

        const ws = wb.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" })

        if (rows.length === 0) throw new Error("File contains no data rows")

        // Normalise key for flexible matching
        const norm = (k) => String(k).toLowerCase().replace(/[\s._-]+/g, "")

        const get = (row, ...keys) => {
          for (const k of Object.keys(row)) {
            if (keys.some(q => norm(k).includes(norm(q)))) return row[k]
          }
          return ""
        }

        // Case-insensitive matchers
        const findTurfByName = (name) => {
          if (!name) return null
          const n = name.toLowerCase().trim()
          return turfs.find(t => t.name.toLowerCase().trim() === n)
        }

        const findSportByName = (name) => {
          if (!name) return null
          const n = name.toLowerCase().trim()
          return sports.find(s => s.name.toLowerCase().trim() === n)
        }

        const findSquadByName = (name) => {
          if (!name) return null
          const n = name.toLowerCase().trim()
          return squads.find(sq => sq.name.toLowerCase().trim() === n)
        }

        // Detect how many "Squad N Name" / "Squad N Players" column pairs exist
        // by inspecting the keys of the first row
        const sampleKeys = rows[0] ? Object.keys(rows[0]) : []
        const squadIndices = new Set()
        for (const k of sampleKeys) {
          const m = norm(k).match(/^squad(\d+)/)
          if (m) squadIndices.add(Number(m[1]))
        }
        const squadNums = [...squadIndices].sort((a, b) => a - b)

        // Helper: find the actual column key for "Squad N Name" or "Squad N Players"
        const findColKey = (row, pattern) => {
          for (const k of Object.keys(row)) {
            if (norm(k).includes(norm(pattern))) return k
          }
          return null
        }

        const parsed = rows.map((row, i) => {
          const turfName = String(get(row, "turf", "ground", "turfname") || "").trim()
          const sportName = String(get(row, "sport") || "").trim()
          const bookingTypeRaw = String(get(row, "bookingtype", "type") || "").trim().toLowerCase()
          const isSquadBooking = bookingTypeRaw === "squad" || bookingTypeRaw === "team"

          const matchedTurf = findTurfByName(turfName)
          const matchedSport = findSportByName(sportName)

          const amount = Number(get(row, "totalamount", "amount") || 0)

          // ── Parse per-squad columns ──────────────────────────────────────
          const teams = []
          let totalSquadPlayers = 0

          if (isSquadBooking && squadNums.length > 0) {
            for (const n of squadNums) {
              const nameKey = findColKey(row, `squad${n}name`) ||
                findColKey(row, `squad ${n} name`)
              const playersKey = findColKey(row, `squad${n}players`) ||
                findColKey(row, `squad ${n} players`)

              const sName = nameKey ? String(row[nameKey] || "").trim() : ""
              const sPlayers = playersKey ? String(row[playersKey] || "").trim() : ""

              if (!sName) continue // empty squad slot

              const matchedSquad = findSquadByName(sName)

              // Player IDs: match by name from players list embedded in squads
              // We use the squad's own memberPlayerIds if matched,
              // otherwise store names as fallback (playerList)
              const playerIds = matchedSquad?.memberPlayerIds || []

              teams.push({
                id: `team_${Date.now()}_${i}_${n}`,
                name: matchedSquad?.name || sName,
                playerIds,
                squadId: matchedSquad?.id || "",
                // store raw names for display if squad not matched
                playerListRaw: sPlayers,
                squadMatched: Boolean(matchedSquad),
              })

              totalSquadPlayers += playerIds.length || sPlayers.split(",").filter(Boolean).length
            }
          }

          // ── Individual players (non-squad bookings) ──────────────────────
          const individualPlayers = (() => {
            for (const k of Object.keys(row)) {
              if (norm(k) === "individualplayers") return String(row[k] || "").trim()
            }
            return String(get(row, "players", "playerlist") || "").trim()
          })()
          console.log("DEBUG playerList:", individualPlayers, Object.keys(row).map(k => norm(k)))          
          const numPlayersRaw = Number(get(row, "noofplayers", "nos", "numplayers", "count") || 0)
          const numPlayers = isSquadBooking ? totalSquadPlayers : (numPlayersRaw || 0)
          const perPersonCost = numPlayers > 0 ? amount / numPlayers : 0

          // Primary squad name (first squad, for display)
          const primarySquadName = teams[0]?.name || ""
          const anySquadMatched = teams.some(t => t.squadMatched)

          return {
            rowIndex: i + 2,
            bookingId: String(get(row, "bookingid", "booking id", "id") || "").trim(),
            date: formatDate(get(row, "date")),
            startTime: String(get(row, "starttime", "start time", "start") || "").trim(),
            endTime: String(get(row, "endtime", "end time", "end") || "").trim(),
            sport: sportName,
            sportId: matchedSport?.id || "",
            turfName: turfName || "Unknown Turf",
            turfId: matchedTurf?.id || "",
            location: String(get(row, "location") || "").trim(),
            bookingType: isSquadBooking ? "Team" : "Individual",
            // Squad data
            teams,
            squadName: primarySquadName,
            squadMatched: anySquadMatched,
            squadId: teams[0]?.squadId || "",
            // Individual data
            playerNames: individualPlayers,
            nosOfPlayers: numPlayers,
            perPersonCost,
            // Payment
            paidBy: String(get(row, "paidby") || "").trim(),
            amount,
            paidAmount: Number(get(row, "paidamount") || 0),
            status: String(get(row, "status") || "Pending").trim(),
          }
        })

        resolve(parsed)
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}

function formatDate(raw) {
  if (!raw) return ""
  if (raw instanceof Date) {
    return raw.toISOString().slice(0, 10)
  }
  return String(raw).trim()
}