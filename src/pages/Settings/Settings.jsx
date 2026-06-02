import { useState } from "react"
import { Moon, Sun } from "lucide-react"

import MobileLayout from "../../components/layout/MobileLayout"
import GlassCard from "../../components/common/GlassCard"
import SettingItem from "../../components/common/SettingItem"
import PrimaryButton from "../../components/common/PrimaryButton"
import DropdownField from "../../components/common/DropdownField"
import { useTheme } from "../../context/useTheme"
import { useApp } from "../../context/useApp"

export default function Settings() {
  const { darkMode, toggleTheme } = useTheme()
  const { settings, updateSettings, turfs, sports, addTurf, addSport } = useApp()

  const [turfName, setTurfName] = useState("")
  const [sportName, setSportName] = useState("")

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

        <GlassCard className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Data Management
          </h2>
          <PrimaryButton text="Backup to Google Drive" onClick={() => {}} />
          <PrimaryButton text="Import Excel" onClick={() => {}} />
          <PrimaryButton text="Export Excel" onClick={() => {}} />
        </GlassCard>

        <GlassCard className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Turf Management ({turfs.length})
          </h2>
          <input
            className="premium-input"
            placeholder="New turf name"
            value={turfName}
            onChange={(e) => setTurfName(e.target.value)}
          />
          <PrimaryButton
            text="Add Turf"
            onClick={() => {
              if (!turfName.trim()) return
              addTurf({ name: turfName })
              setTurfName("")
            }}
          />
        </GlassCard>

        <GlassCard className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Sport Management ({sports.length})
          </h2>
          <input
            className="premium-input"
            placeholder="New sport name"
            value={sportName}
            onChange={(e) => setSportName(e.target.value)}
          />
          <PrimaryButton
            text="Add Sport"
            onClick={() => {
              if (!sportName.trim()) return
              addSport({ name: sportName, icon: "cricket" })
              setSportName("")
            }}
          />
        </GlassCard>

        <GlassCard>
          <SettingItem title="App Version" subtitle="Turf Manager Pro v1.0.0" />
          <button className="w-full py-3 mt-2 rounded-2xl text-red-400 border border-red-500/30 font-semibold">
            Logout
          </button>
        </GlassCard>
      </div>
    </MobileLayout>
  )
}
