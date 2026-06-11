import { useRef, useState } from "react"
import { ChevronDown, Trash2, X, Download, Upload, Check, Sun, Monitor, Moon } from "lucide-react"

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
  const { darkMode, theme, setThemeMode } = useTheme()
  const {
    settings, updateSettings,
    turfs, sports,
    bookings, players,
    addTurf, addSport, deleteTurf, deleteSport,
    addBooking,
  } = useApp()

  // ── UI state ───────────────────────────────────────────────────────────────
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

        {/* ── Profile / Business Card ──────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "4px 0" }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "14px", overflow: "hidden", flexShrink: 0,
            background: "linear-gradient(135deg, var(--brand), #00B4D8)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img src="/app-logo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
              Turf Manager
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0", fontWeight: 500 }}>
              Professional Turf Booking App · v1.0.0
            </p>
          </div>
        </div>

        {/* ── APPEARANCE ───────────────────────────────────────── */}
        <div>
          <p className="section-label">Appearance</p>
          <GlassCard className="space-y-4">

            {/* Three-way theme selector */}
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "10px" }}>Theme</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                {[
                  { id: "light",  label: "Light",  Icon: Sun },
                  { id: "system", label: "System", Icon: Monitor },
                  { id: "dark",   label: "Dark",   Icon: Moon },
                ].map(({ id, label, Icon }) => {
                  const active = theme === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setThemeMode(id)}
                      style={{
                        padding: "10px 8px",
                        borderRadius: "12px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        border: active ? `2px solid var(--brand)` : "2px solid var(--bg-border)",
                        background: active ? "var(--brand-subtle)" : "var(--bg-elevated)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        position: "relative",
                      }}
                    >
                      <Icon size={18} style={{ color: active ? "var(--brand)" : "var(--text-muted)" }} />
                      <span style={{ fontSize: "11px", fontWeight: 600, color: active ? "var(--brand)" : "var(--text-muted)" }}>
                        {label}
                      </span>
                      {active && (
                        <div style={{
                          position: "absolute", top: "4px", right: "4px",
                          width: "14px", height: "14px", borderRadius: "50%",
                          background: "var(--brand)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Check size={9} color="#000" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ height: "1px", background: "var(--bg-border)", margin: "0 -4px" }} />

            <DropdownField
              label="Language"
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value })}
              options={["English", "Hindi"]}
            />
          </GlassCard>
        </div>

        {/* ── NOTIFICATIONS ────────────────────────────────────── */}
        <div>
          <p className="section-label">Notifications</p>
          <GlassCard>
            {[
              { key: "negativeBalance", label: "Negative Balance Alerts", sub: "Alert when a player goes into dues" },
              { key: "booking",         label: "Booking Reminders",        sub: "Get notified before sessions" },
              { key: "payment",         label: "Payment Reminders",        sub: "Remind players about dues" },
            ].map(({ key, label, sub }, i, arr) => (
              <div key={key}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{label}</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0" }}>{sub}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSettings({ notifications: { [key]: !settings.notifications[key] } })}
                    style={{
                      width: "46px", height: "26px", borderRadius: "13px", flexShrink: 0,
                      background: settings.notifications[key] ? "var(--brand)" : "var(--bg-elevated)",
                      border: "1px solid var(--bg-border)",
                      position: "relative", cursor: "pointer",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <div style={{
                      position: "absolute", top: "3px",
                      width: "20px", height: "20px", borderRadius: "50%", background: "#fff",
                      transition: "left 0.2s ease",
                      left: settings.notifications[key] ? "23px" : "3px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    }} />
                  </button>
                </div>
                {i < arr.length - 1 && <div style={{ height: "1px", background: "var(--bg-border)" }} />}
              </div>
            ))}
          </GlassCard>
        </div>

        {/* ── TURF MANAGEMENT ──────────────────────────────────── */}
        <div>
          <p className="section-label">Turf Management</p>
          <GlassCard className="space-y-3">
            {/* Horizontal chips */}
            {turfs.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {turfs.map((turf) => (
                  <div key={turf.id} style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "6px 12px", borderRadius: "99px",
                    background: "var(--bg-elevated)", border: "1px solid var(--bg-border)",
                    fontSize: "12px", fontWeight: 600, color: "var(--text-primary)",
                  }}>
                    {turf.name}
                    <button type="button" onClick={() => handleDeleteTurf(turf)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--status-pending)", display: "flex", padding: 0, lineHeight: 1 }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => setAddTurfModalOpen(true)} className="btn-outline w-full">
              + Add Turf / Ground
            </button>
          </GlassCard>
        </div>

        {/* ── SPORT MANAGEMENT ─────────────────────────────────── */}
        <div>
          <p className="section-label">Sport Management</p>
          <GlassCard className="space-y-3">
            {sports.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {sports.map((sport) => (
                  <div key={sport.id} style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "6px 12px", borderRadius: "99px",
                    background: "var(--brand-subtle)", border: "1px solid var(--brand)",
                    fontSize: "12px", fontWeight: 600, color: "var(--brand)",
                  }}>
                    <span>{sport.icon || "🏅"}</span>
                    {sport.name}
                    <button type="button" onClick={() => handleDeleteSport(sport)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--status-pending)", display: "flex", padding: 0, lineHeight: 1 }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => setAddSportModalOpen(true)} className="btn-outline w-full">
              + Add Sport / Game
            </button>
          </GlassCard>
        </div>

        {/* ── DATA MANAGEMENT ──────────────────────────────────── */}
        <div>
          <p className="section-label">Data Management</p>
          <GlassCard className="space-y-3">
            <button type="button" onClick={handleExportClick}
              className="btn-outline w-full" style={{ gap: "8px" }}>
              <Download size={16} />
              Export Bookings (.xlsx)
            </button>
            <button type="button" onClick={handleImportClick}
              disabled={importStatus === "loading"}
              style={{
                width: "100%", height: "48px", borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                border: "1.5px solid var(--secondary)", color: "var(--secondary)",
                background: "transparent", fontWeight: 600, fontSize: "14px",
                fontFamily: "inherit", cursor: "pointer", opacity: importStatus === "loading" ? 0.5 : 1,
              }}
            >
              <Upload size={16} />
              {importStatus === "loading" ? "Reading file…" : "Import Bookings (.xlsx / .csv)"}
            </button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
            {importStatus === "error" && (
              <p style={{ fontSize: "12px", color: "var(--status-pending)" }}>{importMsg}</p>
            )}
          </GlassCard>
        </div>

        {/* ── APP INFO ─────────────────────────────────────────── */}
        <div>
          <p className="section-label">App Info</p>
          <GlassCard>
            <SettingItem title="Version" subtitle="Turf Manager Pro v1.0.0" />
            <div style={{ height: "1px", background: "var(--bg-border)", margin: "0 -4px" }} />
            <div style={{ paddingTop: "12px" }}>
              <button
                type="button"
                className="btn-danger w-full"
                style={{ marginTop: "4px" }}
              >
                Logout
              </button>
            </div>
          </GlassCard>
        </div>

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