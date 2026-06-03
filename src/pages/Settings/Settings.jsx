import { useState } from "react"
import { Moon, Sun, ChevronDown, Trash2 } from "lucide-react"

import MobileLayout from "../../components/layout/MobileLayout"
import GlassCard from "../../components/common/GlassCard"
import SettingItem from "../../components/common/SettingItem"
import PrimaryButton from "../../components/common/PrimaryButton"
import DropdownField from "../../components/common/DropdownField"
import AddTurfModal from "../../components/turf/AddTurfModal"
import AddSportModal from "../../components/sport/AddSportModal"
import { useTheme } from "../../context/useTheme"
import { useApp } from "../../context/useApp"

export default function Settings() {
  const { darkMode, toggleTheme } = useTheme()
  const { 
    settings, updateSettings, 
    turfs, sports, 
    addTurf, addSport, deleteTurf, deleteSport 
  } = useApp()

  const [turfDropdownOpen, setTurfDropdownOpen] = useState(false)
  const [sportDropdownOpen, setSportDropdownOpen] = useState(false)
  const [addTurfModalOpen, setAddTurfModalOpen] = useState(false)
  const [addSportModalOpen, setAddSportModalOpen] = useState(false)

  const handleDeleteTurf = (turf) => {
    if (window.confirm(`Are you sure you want to delete "${turf.name}"? This action cannot be undone.`)) {
      deleteTurf(turf.id)
    }
  }

  const handleDeleteSport = (sport) => {
    if (window.confirm(`Are you sure you want to delete "${sport.name}"? This action cannot be undone.`)) {
      deleteSport(sport.id)
    }
  }

  return (
    <MobileLayout>
      <div className="p-5 space-y-5 animate-fade-in-up">
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
            className="h-20 w-auto max-w-[220px] object-contain"
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

        <GlassCard className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Data Management
          </h2>
          <button className="w-full py-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 font-semibold hover:bg-green-500/20 transition-colors">
            Backup to Google Drive
          </button>
          <button className="w-full py-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 font-semibold hover:bg-green-500/20 transition-colors">
            Import Excel
          </button>
          <button className="w-full py-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 font-semibold hover:bg-green-500/20 transition-colors">
            Export Excel
          </button>
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
    </MobileLayout>
  )
}