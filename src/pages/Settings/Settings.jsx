import { useRef, useState } from "react"
import { Moon, Sun, ChevronDown, Trash2, X, Download, Upload, Check } from "lucide-react"

import MobileLayout from "../../components/layout/MobileLayout"
import GlassCard from "../../components/common/GlassCard"
import SettingItem from "../../components/common/SettingItem"
import DropdownField from "../../components/common/DropdownField"
import AddTurfModal from "../../components/turf/AddTurfModal"
import AddSportModal from "../../components/sport/AddSportModal"
import { useTheme } from "../../context/useTheme"
import { useApp } from "../../context/useApp"
import { exportToXlsx, parseImportFile } from "../../utils/dataBackup"

// Small helper for import preview rows
function Cell({ label, value, accent }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`font-medium text-sm truncate ${accent ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-white"}`}>
        {value || "—"}
      </p>
    </div>
  )
}

export default function Settings() {
  const { darkMode, toggleTheme } = useTheme()
  const {
    settings, updateSettings,
    turfs, sports,
    bookings, players,
    addTurf, addSport, deleteTurf, deleteSport,
    addBooking,
  } = useApp()

  // ── UI state ───────────────────────────────────────────────────────────────
  const [turfDropdownOpen, setTurfDropdownOpen] = useState(false)
  const [sportDropdownOpen, setSportDropdownOpen] = useState(false)
  const [addTurfModalOpen, setAddTurfModalOpen] = useState(false)
  const [addSportModalOpen, setAddSportModalOpen] = useState(false)

  // ── Export state ───────────────────────────────────────────────────────────
  const [exportModalOpen,  setExportModalOpen]  = useState(false)
  const [exportFilename,   setExportFilename]   = useState("turf-bookings")
  const [exportStatus,     setExportStatus]     = useState("idle") // idle | loading | done | error
  const [exportMsg,        setExportMsg]        = useState("")

  // ── Import state ───────────────────────────────────────────────────────────
  const fileInputRef = useRef(null)
  const [importRows,    setImportRows]    = useState([])
  const [importPreview, setImportPreview] = useState(false)
  const [importStatus,  setImportStatus]  = useState("idle") // idle | loading | done | error
  const [importMsg,     setImportMsg]     = useState("")
  // ── Export handlers ────────────────────────────────────────────────────────

  const handleExportClick = () => {
    setExportStatus("idle")
    setExportMsg("")
    setExportModalOpen(true)
  }

  const handleConfirmExport = async () => {
    if (!exportFilename.trim()) { setExportMsg("Please enter a filename"); return }
    setExportStatus("loading")
    setExportMsg("")
    try {
      const res = await exportToXlsx(
        { bookings, turfs, sports, players },
        exportFilename.trim()
      )
      setExportStatus("done")
      setExportMsg(res.message)
    } catch (err) {
      setExportStatus("error")
      setExportMsg(err.message || "Export failed")
    }
  }

  // ── Import handlers ────────────────────────────────────────────────────────

  const handleImportClick = () => {
    setImportStatus("idle")
    setImportMsg("")
    fileInputRef.current.value = ""
    fileInputRef.current.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportStatus("loading")
    setImportMsg("")
    try {
      const rows = await parseImportFile(file)
      setImportRows(rows)
      setImportStatus("idle")
      setImportPreview(true)
    } catch (err) {
      setImportStatus("error")
      setImportMsg(err.message || "Failed to read file")
    }
  }

  // ── Delete handlers ────────────────────────────────────────────────────────

  const handleDeleteTurf = (turf) => {
    if (window.confirm(`Delete "${turf.name}"? This cannot be undone.`)) deleteTurf(turf.id)
  }
  const handleDeleteSport = (sport) => {
    if (window.confirm(`Delete "${sport.name}"? This cannot be undone.`)) deleteSport(sport.id)
  }

  return (
    <MobileLayout>
      <div className="pt-2 px-5 pb-5 space-y-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
            Manage your app preferences
          </p>
        </div>

        <GlassCard className="flex items-center gap-4">
          <img
            src="/app-logo.png"
            alt="Turf Manager Pro"
            className="h-20 w-auto max-w-55 object-contain"
          />
          <p className="text-sm text-slate-500 dark:text-gray-400">
            Professional Turf Booking App
          </p>
        </GlassCard>

        <GlassCard className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            App Preferences
          </h2>

          <DropdownField
            label="Language"
            value={settings.language}
            onChange={(e) =>
              updateSettings({ language: e.target.value })
            }
            options={["English", "Hindi"]}
          />

          <SettingItem
            title="Theme"
            subtitle={darkMode ? "Dark mode enabled" : "Light mode enabled"}
            rightElement={
              <button
                onClick={toggleTheme}
                className="
                  w-11 h-11 rounded-2xl
                  bg-slate-100 dark:bg-white/5
                  border border-black/10 dark:border-white/10
                  flex items-center justify-center
                "
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            }
          />
        </GlassCard>

        <GlassCard className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Notifications
          </h2>

          {[
            ["negativeBalance", "Negative balance reminders"],
            ["booking", "Booking reminders"],
            ["payment", "Payment reminders"]
          ].map(([key, label]) => (
            <SettingItem
              key={key}
              title={label}
              rightElement={
                <button
                  onClick={() =>
                    updateSettings({
                      notifications: {
                        [key]: !settings.notifications[key]
                      }
                    })
                  }
                  className={`
                    w-14 h-8 rounded-full relative transition
                    ${settings.notifications[key]
                      ? "bg-green-500"
                      : "bg-slate-400"
                    }
                  `}
                >
                  <div className={`
                    absolute top-1 w-6 h-6 rounded-full bg-white transition
                    ${settings.notifications[key] ? "right-1" : "left-1"}
                  `} />
                </button>
              }
            />
          ))}
        </GlassCard>

        {/* Turf Management */}
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Turf Management ({turfs.length})
            </h2>
            <button
              onClick={() => setTurfDropdownOpen(!turfDropdownOpen)}
              className="
                flex items-center gap-2 px-3 py-2 rounded-xl
                bg-slate-100 dark:bg-white/5
                border border-black/10 dark:border-white/10
                text-slate-600 dark:text-slate-400
                hover:bg-slate-200 dark:hover:bg-white/10
                transition-colors text-sm
              "
            >
              View All
              <ChevronDown 
                size={14} 
                className={`transition-transform ${turfDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {turfDropdownOpen && (
            <div className="space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5">
              {turfs.length > 0 ? (
                turfs.map((turf) => (
                  <div 
                    key={turf.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/10 border border-black/5 dark:border-white/10"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                        {turf.name}
                      </p>
                      {turf.location && (
                        <p className="text-xs text-slate-500 dark:text-gray-400">
                          {turf.location}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTurf(turf)}
                      className="
                        p-2 rounded-lg
                        text-slate-400 hover:text-red-500 hover:bg-red-500/10
                        transition-colors
                      "
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 dark:text-slate-500 py-4 text-sm">
                  No turfs added yet
                </p>
              )}
            </div>
          )}

          <button
            onClick={() => setAddTurfModalOpen(true)}
            className="w-full py-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 font-semibold hover:bg-green-500/20 transition-colors"
          >
            Add Turf/Ground
          </button>
        </GlassCard>

        {/* Sport Management */}
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Sport Management ({sports.length})
            </h2>
            <button
              onClick={() => setSportDropdownOpen(!sportDropdownOpen)}
              className="
                flex items-center gap-2 px-3 py-2 rounded-xl
                bg-slate-100 dark:bg-white/5
                border border-black/10 dark:border-white/10
                text-slate-600 dark:text-slate-400
                hover:bg-slate-200 dark:hover:bg-white/10
                transition-colors text-sm
              "
            >
              View All
              <ChevronDown 
                size={14} 
                className={`transition-transform ${sportDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {sportDropdownOpen && (
            <div className="space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5">
              {sports.length > 0 ? (
                sports.map((sport) => (
                  <div 
                    key={sport.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/10 border border-black/5 dark:border-white/10"
                  >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{sport.icon || "🏅"}</span>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">
                      {sport.name}
                    </p>
                  </div>
                    <button
                      onClick={() => handleDeleteSport(sport)}
                      className="
                        p-2 rounded-lg
                        text-slate-400 hover:text-red-500 hover:bg-red-500/10
                        transition-colors
                      "
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 dark:text-slate-500 py-4 text-sm">
                  No sports added yet
                </p>
              )}
            </div>
          )}

          <button
            onClick={() => setAddSportModalOpen(true)}
            className="w-full py-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 font-semibold hover:bg-green-500/20 transition-colors"
          >
            Add Sport/Game
          </button>
        </GlassCard>

        {/* ── Data Management ───────────────────────────────────────────── */}
        <GlassCard className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Data Management
          </h2>

          {/* Export */}
          <button
            type="button"
            onClick={handleExportClick}
            className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 font-semibold hover:bg-green-500/20 transition-colors"
          >
            <Download size={16} />
            Export Bookings (.xlsx)
          </button>

          {/* Import */}
          <button
            type="button"
            onClick={handleImportClick}
            disabled={importStatus === "loading"}
            className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-400 font-semibold hover:bg-blue-500/20 transition-colors disabled:opacity-50"
          >
            <Upload size={16} />
            {importStatus === "loading" ? "Reading file…" : "Import Bookings (.xlsx / .csv)"}
          </button>

          {/* Hidden real file input — no form tag */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Import error */}
          {importStatus === "error" && (
            <p className="text-sm text-red-500 px-1">{importMsg}</p>
          )}
        </GlassCard>

        <GlassCard>
          <SettingItem title="App Version" subtitle="Turf Manager Pro v1.0.0" />
          <button className="w-full py-3 mt-2 rounded-2xl text-red-400 border border-red-500/30 font-semibold">
            Logout
          </button>
        </GlassCard>
      </div>

      {/* Modals */}
      <AddTurfModal
        open={addTurfModalOpen}
        onClose={() => setAddTurfModalOpen(false)}
        onSave={(form) => {
          addTurf(form)
        }}
      />

      <AddSportModal
        open={addSportModalOpen}
        onClose={() => setAddSportModalOpen(false)}
        onSave={(form) => {
          addSport(form)
        }}
      />

      {/* Import Preview Modal */}
      {importPreview && (
        <div
          className="fixed inset-0 z-99999 flex items-end"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
        >
          <div className="w-full bg-white dark:bg-[#0f172a] rounded-t-3xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-black/5 dark:border-white/8 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Import Preview
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {importRows.length} row{importRows.length !== 1 ? "s" : ""} found — review before importing
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setImportPreview(false); setImportRows([]) }}
                className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Row list */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
              {importRows.map((row, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/8"
                >
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    {row.bookingId && <Cell label="ID"     value={row.bookingId} />}
                    {row.date      && <Cell label="Date"   value={row.date} />}
                    {row.sport     && <Cell label="Sport"  value={row.sport} />}
                    {row.turfName  && <Cell label="Turf"   value={row.turfName} />}
                    {row.paidBy    && <Cell label="Paid By" value={row.paidBy} />}
                    <Cell label="Amount"  value={`₹${row.amount}`} />
                    <Cell label="Status"  value={row.status} accent />
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="px-5 pb-6 pt-3 flex gap-3 shrink-0 border-t border-black/5 dark:border-white/8">
              <button
                type="button"
                onClick={() => { setImportPreview(false); setImportRows([]) }}
                className="flex-1 py-3.5 rounded-2xl border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  // Match turf/sport names → IDs, payer name → playerId
                  const normalise = (s) => String(s || "").trim().toLowerCase()

                  // Build a set of "date|startTime" keys from existing bookings
                  // to detect duplicates — skip if BOTH date AND time match
                  const existingKeys = new Set(
                    bookings.map((b) => `${b.date}|${b.startTime || ""}`)
                  )

                  let imported = 0
                  let skipped  = 0

                  importRows.forEach((row) => {
                    // Duplicate check — date + startTime both match → skip
                    const rowKey = `${row.date}|${row.startTime || ""}`
                    if (existingKeys.has(rowKey) && row.date) {
                      skipped++
                      return
                    }

                    // Find turf by name (fuzzy)
                    const turf = turfs.find(t =>
                      normalise(t.name) === normalise(row.turfName) ||
                      normalise(t.name).includes(normalise(row.turfName)) ||
                      normalise(row.turfName).includes(normalise(t.name))
                    )
                    // Find sport by name (fuzzy)
                    const sport = sports.find(s =>
                      normalise(s.name) === normalise(row.sport) ||
                      normalise(s.id) === normalise(row.sport)
                    )
                    // Find payer by name (fuzzy)
                    const payer = players.find(p =>
                      normalise(p.name) === normalise(row.paidBy) ||
                      normalise(p.name).includes(normalise(row.paidBy))
                    )

                    const statusMap = { paid: "Paid", partial: "Partial", pending: "Pending" }
                    const status = statusMap[normalise(row.status)] || "Pending"

                    addBooking({
                      turfId:         turf?.id  || "",
                      sportId:        sport?.id || "",
                      date:           row.date  || "",
                      startTime:      row.startTime || "",
                      endTime:        row.endTime   || "",
                      amount:         Number(row.amount)     || 0,
                      paidAmount:     Number(row.paidAmount) || 0,
                      status,
                      paidByPlayerId: payer?.id || "",
                      bookingType:    "Individual",
                      playerIds:      payer?.id ? [payer.id] : [],
                    })
                    // Add key so subsequent rows in same batch don't duplicate either
                    existingKeys.add(rowKey)
                    imported++
                  })

                  const msg = skipped > 0
                    ? `${imported} imported, ${skipped} skipped (duplicate date & time)`
                    : `${imported} booking${imported !== 1 ? "s" : ""} imported successfully`

                  setImportStatus("done")
                  setImportMsg(msg)
                  setImportPreview(false)
                  setImportRows([])
                }}
                className="flex-1 py-3.5 rounded-2xl bg-green-500 text-black font-bold flex items-center justify-center gap-2"
              >
                <Check size={16} />
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import done/error toast */}
      {importStatus === "done" && importMsg && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-99999x-5 py-3 rounded-2xl bg-green-500 text-black text-sm font-semibold shadow-xl max-w-xs text-center"
          onClick={() => { setImportStatus("idle"); setImportMsg("") }}>
          ✓ {importMsg}
        </div>
      )}

      {/* Export Modal */}
      {exportModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
        >
          <div className="w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-2xl p-5 space-y-4 border border-black/8 dark:border-white/8 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Export Bookings</h2>
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                File name
              </label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                <input
                  type="text"
                  value={exportFilename}
                  onChange={(e) => setExportFilename(e.target.value)}
                  placeholder="turf-bookings"
                  className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400"
                />
                <span className="text-sm text-slate-400 shrink-0">.xlsx</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 ml-1">
                On Android you'll get a share sheet to save anywhere (Downloads, Drive, etc.)
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p>📊 <strong className="text-slate-700 dark:text-slate-300">{bookings.length}</strong> bookings will be exported</p>
              <p>👤 Includes player names, turf, amount & status</p>
            </div>

            {exportMsg && (
              <p className={`text-sm px-1 ${exportStatus === "error" ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
                {exportStatus === "done" ? "✓ " : "✗ "}{exportMsg}
              </p>
            )}

            {exportStatus === "done" ? (
              <button
                type="button"
                onClick={() => { setExportModalOpen(false); setExportStatus("idle"); setExportMsg("") }}
                className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-semibold"
              >
                Close
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmExport}
                disabled={exportStatus === "loading"}
                className="w-full py-3.5 rounded-2xl bg-green-500 text-black font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Download size={16} />
                {exportStatus === "loading" ? "Exporting…" : "Export Now"}
              </button>
            )}
          </div>
        </div>
      )}
    </MobileLayout>
  )
}