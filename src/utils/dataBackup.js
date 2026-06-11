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

/**
 * Build an XLSX workbook (ArrayBuffer) from current app data.
 * Returns { arrayBuffer, base64 } so callers can use whichever they need.
 */
function buildWorkbook(bookings = [], turfs = [], sports = [], players = []) {
  const turfMap   = Object.fromEntries(turfs.map(t => [t.id, t]))
  const sportMap  = Object.fromEntries(sports.map(s => [s.id, s]))
  const playerMap = Object.fromEntries(players.map(p => [p.id, p]))

  const header = [
    "Serial No", "Booking ID", "Date", "Sport",
    "Turf Name", "Location",
    "Players", "No. of Players",
    "Paid By", "Total Amount", "Paid Amount", "Status"
  ]

  const rows = bookings.map((b, i) => {
    const turf    = turfMap[b.turfId]
    const sport   = sportMap[b.sportId]
    const payer   = playerMap[b.paidByPlayerId]
    const names   = (b.playerIds || [])
      .map(id => playerMap[id]?.name || id)
      .join(", ")

    return [
      i + 1,
      b.id || "",
      b.date || "",
      sport?.name || "",
      turf?.name || "",
      turf?.location || "",
      names,
      b.playerIds?.length ?? 0,
      payer?.name || "",
      b.amount ?? 0,
      b.paidAmount ?? 0,
      b.status || ""
    ]
  })

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows])

  // Column widths
  ws["!cols"] = [
    { wch: 10 }, { wch: 14 }, { wch: 13 }, { wch: 14 },
    { wch: 22 }, { wch: 22 },
    { wch: 36 }, { wch: 14 },
    { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 12 }
  ]

  // Bold header row
  const range = XLSX.utils.decode_range(ws["!ref"])
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })]
    if (cell) {
      cell.s = {
        font: { bold: true },
        fill: { patternType: "solid", fgColor: { rgb: "FF8AA9D5" } },
        alignment: { horizontal: "center" }
      }
    }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Bookings")

  const arrayBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  const base64      = XLSX.write(wb, { bookType: "xlsx", type: "base64" })

  return { arrayBuffer, base64 }
}

// ─── EXPORT ─────────────────────────────────────────────────────────────────

/**
 * exportToXlsx
 * ────────────
 * On Android/iOS: writes the file to the cache dir then opens the native
 * share sheet. The user chooses where to save (Downloads, Drive, etc.).
 *
 * On web: triggers a standard <a download> click.
 *
 * @param {object} appData  – { bookings, turfs, sports, players }
 * @param {string} filename – without extension, e.g. "turf-bookings-jun2026"
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function exportToXlsx(appData, filename = "turf-bookings") {
  const { bookings = [], turfs = [], sports = [], players = [] } = appData
  const fname = `${filename.trim() || "turf-bookings"}.xlsx`

  const { arrayBuffer, base64 } = buildWorkbook(bookings, turfs, sports, players)

  if (isNative()) {
    // 1. Write to cache (temporary, readable by share plugin)
    await Filesystem.writeFile({
      path: fname,
      data: base64,
      directory: Directory.Cache,
      recursive: true,
    })

    // 2. Get the URI so Share can read it
    const { uri } = await Filesystem.getUri({
      path: fname,
      directory: Directory.Cache,
    })

    // 3. Open native share sheet — user decides where it goes
    await Share.share({
      title: "Export Bookings",
      text:  "Turf Manager Pro — Booking Data",
      url:   uri,
      dialogTitle: "Save or share your export",
    })

    return { success: true, message: `${fname} ready to save` }
  } else {
    // Web fallback — <a> download
    const blob = new Blob([new Uint8Array(arrayBuffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href     = url
    link.download = fname
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url) }, 500)
    return { success: true, message: `Downloaded ${fname}` }
  }
}

// ─── IMPORT ─────────────────────────────────────────────────────────────────

/**
 * parseImportFile
 * ───────────────
 * Accepts a File object (.xlsx or .csv), parses it with SheetJS,
 * and returns an array of plain row objects.
 *
 * Expected columns (case-insensitive match):
 *   Booking ID, Date, Sport, Turf Name, Location, Players,
 *   No. of Players, Paid By, Total Amount, Paid Amount, Status
 *
 * Unknown columns are ignored. Missing columns return empty strings.
 *
 * @param {File} file
 * @returns {Promise<object[]>} array of row objects
 */
export function parseImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const wb   = XLSX.read(data, { type: "array", cellDates: true })

        const sheetName = wb.SheetNames[0]
        if (!sheetName) throw new Error("No sheet found in file")

        const ws   = wb.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" })

        if (rows.length === 0) throw new Error("File contains no data rows")

        // Normalise keys to lowercase-no-spaces for flexible matching
        const norm = (k) => String(k).toLowerCase().replace(/[\s._-]+/g, "")
        const get  = (row, ...keys) => {
          for (const k of Object.keys(row)) {
            if (keys.some(q => norm(k).includes(norm(q)))) return row[k]
          }
          return ""
        }

        const parsed = rows.map((row, i) => ({
          rowIndex:    i + 2,                               // 1-based, skipping header
          bookingId:   String(get(row, "bookingid", "booking id", "id") || "").trim(),
          date:        formatDate(get(row, "date")),
          sport:       String(get(row, "sport") || "").trim(),
          turfName:    String(get(row, "turf", "ground") || "").trim(),
          location:    String(get(row, "location") || "").trim(),
          playerNames: String(get(row, "players", "playerlist") || "").trim(),
          numPlayers:  Number(get(row, "noofplayers", "nos", "numplayers", "count") || 0),
          paidBy:      String(get(row, "paidby") || "").trim(),
          amount:      Number(get(row, "totalamount", "amount") || 0),
          paidAmount:  Number(get(row, "paidamount") || 0),
          status:      String(get(row, "status") || "Pending").trim(),
        }))

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
