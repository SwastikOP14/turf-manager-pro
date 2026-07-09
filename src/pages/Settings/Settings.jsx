import { useRef, useState } from "react"
import { Moon, Sun, Monitor, ChevronDown, Trash2 } from "lucide-react"
import MobileLayout from "../../components/layout/MobileLayout"
import GlassCard from "../../components/common/GlassCard"
import SettingItem from "../../components/common/SettingItem"
import PrimaryButton from "../../components/common/PrimaryButton"
import DropdownField from "../../components/common/DropdownField"
import AddTurfModal from "../../components/turf/AddTurfModal"
import AddSportModal from "../../components/sport/AddSportModal"
import ConfirmDialog from "../../components/common/ConfirmDialog"
import { useTheme } from "../../context/useTheme"
import { useApp } from "../../context/useApp"
import { useHaptics } from "../../context/HapticsContext"
import { exportToXlsx, parseImportFile } from "../../utils/dataBackup"

export default function Settings() {
  const { theme, darkMode, setThemeMode } = useTheme()
  const haptics = useHaptics()
  const {
    settings, updateSettings, turfs, sports, bookings, players, squads,
    addTurf, addSport, deleteTurf, deleteSport,
    addBooking,
    importAppData
  } = useApp()

  const [turfDropdownOpen, setTurfDropdownOpen] = useState(false)
  const [sportDropdownOpen, setSportDropdownOpen] = useState(false)
  const [addTurfModalOpen, setAddTurfModalOpen] = useState(false)
  const [addSportModalOpen, setAddSportModalOpen] = useState(false)
  const [importMessage, setImportMessage] = useState("")
  const [backupMessage, setBackupMessage] = useState("")
  const [importPreviewOpen, setImportPreviewOpen] = useState(false)
  const [previewBookings, setPreviewBookings] = useState([])
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportFilename, setExportFilename] = useState("turf-bookings")
  const fileInputRef = useRef(null)

  // Delete confirmation dialogs
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null) // { type: 'turf' | 'sport', item: object }

  const handleExportXlsx = () => {
    setExportModalOpen(true)
  }

  const handleConfirmExport = async () => {
    if (!exportFilename.trim()) {
      setImportMessage("Please enter a filename")
      return
    }

    try {
      setImportMessage("Exporting...")
      const filename = exportFilename.trim()

      const result = await exportToXlsx(
        { bookings, turfs, sports, players, squads },
        filename
      )

      setBackupMessage(result.message)
      setImportMessage("")
      setExportModalOpen(false)
    } catch (error) {
      setImportMessage(`Export failed: ${error.message}`)
    }
  }

  const handleBackupToGoogleDrive = () => {
    handleExportXlsx()
    window.open("https://drive.google.com/drive/my-drive", "_blank")
  }

  const cycleTheme = () => {
    const order = ["light", "system", "dark"]
    const idx = order.indexOf(theme)
    haptics.trigger(10)
    setThemeMode(order[(idx + 1) % order.length])
  }

  const handleImportClick = () => {
    setImportMessage("")
    fileInputRef.current?.click()
  }

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      setImportMessage("")
      const parsedBookings = await parseImportFile(file, turfs, sports, squads)

      // Transform parsed data to match app's booking format
      const bookings = parsedBookings.map((b) => {
        // Normalize status to match app's status values
        let normalizedStatus = b.status.toLowerCase()
        if (normalizedStatus === "unpaid") {
          normalizedStatus = "pending"
        }
        // Capitalize first letter for display
        normalizedStatus = normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)

        return {
          id: b.bookingId || `booking-${Date.now()}-${Math.random()}`,
          date: b.date,
          location: b.location,
          amount: b.amount,
          totalAmount: b.amount,
          paidAmount: b.paidAmount,
          status: normalizedStatus,
          paidBy: b.paidBy,
          playerList: b.playerNames || "",
          nosOfPlayers: b.nosOfPlayers || 0,
          perPersonCost: b.perPersonCost || 0,
          squadName: b.squadName || "",
          squadMatched: b.squadMatched || false,
          squadId: b.squadId || "",
          teams: b.teams || [],
          playerIds: (() => {
            if (b.bookingType !== "Individual" || !b.playerNames) return []
            const names = b.playerNames.split(",").map(n => n.trim().toLowerCase())
            return players.filter(p => names.includes(p.name.toLowerCase())).map(p => p.id)
          })(), turfId: b.turfId || "",
          sportId: b.sportId || "",
          turfName: b.turfName || "Unknown Turf",
          sportName: b.sport || "Sport",
          startTime: b.startTime || "00:00",
          endTime: b.endTime || "01:00",
          bookingType: b.bookingType || "Individual",
          paidByPlayerId: ""
        }
      })

      setPreviewBookings(bookings)
      setImportPreviewOpen(true)
    } catch (error) {
      setImportMessage(`Import failed: ${error.message}`)
    } finally {
      event.target.value = ""
    }
  }

  const handleConfirmImport = () => {
    if (previewBookings.length === 0) {
      setImportMessage("No bookings to import")
      return
    }

    const newBookings = previewBookings.map((b) => ({
      id: b.id,
      date: b.date,
      location: b.location,
      amount: b.amount,
      totalAmount: b.totalAmount,
      paidAmount: b.paidAmount,
      status: b.status,
      paidBy: b.paidBy,
      playerList: b.playerList,
      nosOfPlayers: b.nosOfPlayers,
      perPersonCost: b.perPersonCost,
      squadName: b.squadName,
      squadId: b.squadId || "",
      teams: b.teams || [],
      playerIds: b.playerIds || [],
      playerList: b.playerList || "",
      nosOfPlayers: b.nosOfPlayers || 0,
      turfId: b.turfId || "",
      sportId: b.sportId || "",
      startTime: b.startTime || "00:00",
      endTime: b.endTime || "01:00",
      bookingType: b.bookingType || "Individual",
      paidByPlayerId: b.paidByPlayerId || ""
    }))

    // Skip bookings that already exist (same date + same start/end time)
    const duplicates = []
    const toImport = []

    newBookings.forEach((booking) => {
      const isDuplicate = bookings.some(
        (existing) =>
          existing.date === booking.date &&
          existing.startTime === booking.startTime &&
          existing.endTime === booking.endTime
      )
      if (isDuplicate) {
        duplicates.push(booking)
      } else {
        toImport.push(booking)
      }
    })

    toImport.forEach(booking => addBooking(booking))

    if (toImport.length === 0) {
      setImportMessage(`All ${duplicates.length} booking(s) already exist — nothing imported.`)
    } else if (duplicates.length > 0) {
      setImportMessage(`Imported ${toImport.length} booking(s). Skipped ${duplicates.length} duplicate(s).`)
    } else {
      setImportMessage(`Imported ${toImport.length} booking(s) successfully!`)
    }

    setImportPreviewOpen(false)
    setPreviewBookings([])
  }

  const handleDeleteTurf = (turf) => {
    setDeleteTarget({ type: 'turf', item: turf })
    setDeleteConfirmOpen(true)
  }

  const handleDeleteSport = (sport) => {
    setDeleteTarget({ type: 'sport', item: sport })
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (deleteTarget?.type === 'turf') {
      deleteTurf(deleteTarget.item.id)
    } else if (deleteTarget?.type === 'sport') {
      deleteSport(deleteTarget.item.id)
    }
    setDeleteConfirmOpen(false)
    setDeleteTarget(null)
  }

  return (
    <MobileLayout>
      <div className="pt-3 px-4 pb-24 space-y-3 animate-fade-in-up">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 dark:text-white leading-tight">Settings</h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Manage your preferences</p>
          </div>
        </div>

        <GlassCard className="flex items-center gap-4">
          <img
            src="/app-logo.png"
            alt="Turf Manager Pro"
            className="h-20 w-auto max-w-55 object-contain"
          />
          <p className="text-[14px] text-slate-500 dark:text-slate-400 font-normal">
            Professional Turf Booking App
          </p>
        </GlassCard>

        <GlassCard className="space-y-1">
          <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white mb-3">
            App Preferences
          </h2>

          <DropdownField
            label="Language"
            value={settings.language}
            onChange={(e) =>
              updateSettings({ language: e.target.value })
            }
            options={["English", "Hindi", "Odia", "Bengali", "Kerelam", "Assamee", "Haryanvi"]}
          />

          <SettingItem
            title="Theme"
            subtitle={theme === "system" ? "Following system" : darkMode ? "Dark mode enabled" : "Light mode enabled"}
            rightElement={
              <button
                onClick={cycleTheme}
                className="
        w-11 h-11 rounded-2xl
        bg-slate-100 dark:bg-white/5
        border border-black/10 dark:border-white/10
        flex items-center justify-center
      "
              >
                {theme === "dark" ? <Moon size={18} /> : theme === "light" ? <Sun size={18} /> : <Monitor size={18} />}
              </button>
            }
          />
        </GlassCard>

        <GlassCard className="space-y-1">
          <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white mb-3">
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
                  onClick={() => {
                    haptics.trigger(10)
                    updateSettings({
                      notifications: {
                        [key]: !settings.notifications[key]
                      }
                    })
                  }}
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
            <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white">
              Turf Management ({turfs.length})
            </h2>
            <button
              onClick={() => setTurfDropdownOpen(!turfDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-[14px] font-medium"
            >
              View All
              <ChevronDown
                size={14}
                strokeWidth={1.8}
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
                      onClick={() => { haptics.trigger([10, 50, 10]); handleDeleteTurf(turf) }}
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
            onClick={() => { haptics.trigger(30); setAddTurfModalOpen(true) }}
            className="w-full py-3.5 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 font-semibold hover:bg-green-500/20 transition-colors"
          >
            Add Turf/Ground
          </button>
        </GlassCard>

        {/* Sport Management */}
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white">
              Sport Management ({sports.length})
            </h2>
            <button
              onClick={() => setSportDropdownOpen(!sportDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-[14px] font-medium"
            >
              View All
              <ChevronDown
                size={14}
                strokeWidth={1.8}
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
                      onClick={() => { haptics.trigger([10, 50, 10]); handleDeleteSport(sport) }}
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
            onClick={() => { haptics.trigger(30); setAddSportModalOpen(true) }}
            className="w-full py-3.5 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 font-semibold hover:bg-green-500/20 transition-colors"
          >
            Add Sport/Game
          </button>
        </GlassCard>

        <GlassCard className="space-y-4">
          <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white">
            Data Management
          </h2>

          <button
            type="button"
            onClick={() => { haptics.trigger(30); handleBackupToGoogleDrive() }}
            className="w-full py-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-400 font-semibold hover:bg-blue-500/20 transition-colors"
          >
            Backup to Google Drive
          </button>

          <button
            type="button"
            onClick={() => { haptics.trigger(30); handleImportClick() }}
            className="w-full py-3 rounded-2xl bg-green-500/10 onClick={handleConfirmImport} border border-green-500/30 text-green-700 dark:text-green-400 font-semibold hover:bg-green-500/20 transition-colors"
          >
            Import Bookings (Excel)
          </button>

          <button
            type="button"
            onClick={() => { haptics.trigger(30); handleExportXlsx() }}
            className="w-full py-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-purple-500/20 transition-colors"
          >
            Export Bookings (Excel)
          </button>

          {importMessage && (
            <p className="text-sm text-green-600 dark:text-green-400 p-2 bg-green-500/10 rounded-lg">
              {importMessage}
            </p>
          )}
          {backupMessage && (
            <p className="text-sm text-slate-500 dark:text-gray-400">
              {backupMessage}
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImportFile}
          />
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
      {importPreviewOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white dark:bg-slate-900 rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto" style={{ paddingBottom: "80px" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Import Preview ({previewBookings.length} bookings)
              </h2>
              <button
                onClick={() => {
                  {/* Import Preview Modal */ }
                  {
                    importPreviewOpen && (
                      <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                        <div className="w-full bg-white dark:bg-slate-900 rounded-t-3xl flex flex-col" style={{ maxHeight: "85vh" }}>
                          <div className="flex items-center justify-between p-5 pb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                              Import Preview ({previewBookings.length} bookings)
                            </h2>
                            <button
                              onClick={() => {
                                setImportPreviewOpen(false)
                                setPreviewBookings([])
                              }}
                              className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="px-5 overflow-y-auto flex-1">
                            {previewBookings.length > 0 ? (
                              <div className="space-y-3">
                                {previewBookings.map((booking, idx) => (
                                  <div
                                    key={idx}
                                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                  >
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">Date</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{booking.date}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">Turf</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{booking.turfName}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">Sport</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{booking.sportName}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">Booking Type</p>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                          {booking.bookingType === "Team"
                                            ? `Squad — ${booking.squadName || "Unknown"}${booking.squadMatched ? " ✓" : " (not found)"}`
                                            : "Individual"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">Players ({booking.nosOfPlayers})</p>
                                        <p className="font-medium text-slate-900 dark:text-white text-xs leading-snug">
                                          {booking.playerList || "—"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">Amount</p>
                                        <p className="font-medium text-slate-900 dark:text-white">₹{booking.totalAmount}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">Per Person</p>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                          ₹{booking.perPersonCost?.toFixed(2) ?? "0.00"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">Paid By</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{booking.paidBy}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">Status</p>
                                        <p className={`font-medium capitalize ${booking.status === "paid" ? "text-green-600" :
                                          booking.status === "partial" ? "text-yellow-600" :
                                            booking.status === "pending" ? "text-orange-600" :
                                              "text-red-600"
                                          }`}>
                                          {booking.status}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center text-slate-500 py-8">No bookings to import</p>
                            )}
                          </div>

                          <div className="flex gap-3 p-5 pt-4 border-t border-slate-200 dark:border-slate-700" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)" }}>
                            <button
                              onClick={() => {
                                setImportPreviewOpen(false)
                                setPreviewBookings([])
                              }}
                              className="flex-1 py-3 rounded-2xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleConfirmImport}
                              className="flex-1 py-3 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
                            >
                              Confirm Import
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  } setImportPreviewOpen(false)
                  setPreviewBookings([])
                }}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {previewBookings.length > 0 ? (
              <div className="space-y-3">
                {previewBookings.map((booking, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-gray-400">Date</p>
                        <p className="font-medium text-slate-900 dark:text-white">{booking.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-gray-400">Turf</p>
                        <p className="font-medium text-slate-900 dark:text-white">{booking.turfName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-gray-400">Sport</p>
                        <p className="font-medium text-slate-900 dark:text-white">{booking.sportName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-gray-400">Players</p>
                        <p className="font-medium text-slate-900 dark:text-white">{booking.nosOfPlayers}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-gray-400">Amount</p>
                        <p className="font-medium text-slate-900 dark:text-white">₹{booking.totalAmount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-gray-400">Paid By</p>
                        <p className="font-medium text-slate-900 dark:text-white">{booking.paidBy}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-gray-400">Status</p>
                        <p className={`font-medium capitalize ${booking.status === "paid" ? "text-green-600" :
                          booking.status === "partial" ? "text-yellow-600" :
                            booking.status === "pending" ? "text-orange-600" :
                              "text-red-600"
                          }`}>
                          {booking.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">No bookings to import</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setImportPreviewOpen(false)
                  setPreviewBookings([])
                }}
                className="flex-1 py-3 rounded-2xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { haptics.trigger([10, 30, 10]); handleConfirmImport() }}
                className="flex-1 py-3 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
              >
                Confirm Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Filename Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Export Bookings
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                File Name
              </label>
              <input
                type="text"
                value={exportFilename}
                onChange={(e) => setExportFilename(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., turf-bookings-2024"
              />
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                The file will be saved as: <span className="font-medium">{exportFilename.trim() || "filename"}.xlsx</span>
              </p>
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-400 bg-blue-500/10 rounded-lg p-3">
              <p>� On mobile, the file will be saved to your Documents folder.</p>
              <p className="text-xs mt-1">You can find it in your device's Files app under Documents.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setExportModalOpen(false)
                  setExportFilename("turf-bookings")
                }}
                className="flex-1 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExport}
                className="flex-1 py-3 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-colors"
              >
                Export Now
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title={deleteTarget?.type === 'turf' ? "Delete Turf" : "Delete Sport"}
        message={
          <>Are you sure you want to delete <b>{deleteTarget?.item?.name}</b>? This action cannot be undone.</>
        }
        confirmLabel={`Delete ${deleteTarget?.type === 'turf' ? 'Turf' : 'Sport'}`}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setDeleteTarget(null) }}
      />
    </MobileLayout>
  )
}