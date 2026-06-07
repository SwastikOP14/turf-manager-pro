import { useState } from "react"
import { Trash2, ChevronDown, ChevronUp, Plus } from "lucide-react"
import { useTheme } from "../../context/useTheme"
import {
  SUPPORTED_SPORTS, getSportMeta, defaultPref, buildSummary,
  CRICKET_BATTING_POSITIONS, CRICKET_BOWLING_TYPES,
  FOOTBALL_POSITIONS, BADMINTON_POSITIONS, TENNIS_POSITIONS,
  BASKETBALL_POSITIONS, VOLLEYBALL_POSITIONS, HOCKEY_POSITIONS, TABLE_TENNIS_POSITIONS,
} from "../../constants/sportPreferences"

const MAX_SPORTS = 3

// ── Hand toggle (L / R) ──────────────────────────────────────────────────────

function HandToggle({ value, onChange, darkMode }) {
  return (
    <div className="flex gap-2">
      {["L", "R"].map((hand) => (
        <button
          key={hand}
          type="button"
          onClick={() => onChange(hand)}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{
            background: value === hand
              ? "#22c55e"
              : darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
            color: value === hand
              ? "#000"
              : darkMode ? "#94a3b8" : "#64748b",
            border: value === hand
              ? "none"
              : darkMode ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
          }}
        >
          {hand}
        </button>
      ))}
    </div>
  )
}

// ── Toggle switch ────────────────────────────────────────────────────────────

function ToggleSwitch({ value, onChange, label, darkMode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(!value)}
          className="relative w-12 h-6 rounded-full transition-colors"
          style={{ background: value ? "#22c55e" : darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)" }}
        >
          <div
            className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
            style={{ left: value ? "calc(100% - 1.25rem)" : "0.25rem" }}
          />
        </button>
        <span className="text-xs font-semibold w-6" style={{ color: value ? "#22c55e" : "#94a3b8" }}>
          {value ? "Yes" : "No"}
        </span>
      </div>
    </div>
  )
}

// ── Native select ────────────────────────────────────────────────────────────

function NativeSelect({ value, onChange, options, placeholder, darkMode }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-3 px-4 pr-10 rounded-xl text-sm font-medium appearance-none outline-none"
        style={{
          background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
          border: darkMode ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.12)",
          color: value
            ? darkMode ? "#fff" : "#0f172a"
            : darkMode ? "#64748b" : "#94a3b8",
        }}
      >
        <option value="" style={{ background: darkMode ? "#1e293b" : "#fff", color: darkMode ? "#fff" : "#0f172a" }}>
          {placeholder || "Select…"}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} style={{ background: darkMode ? "#1e293b" : "#fff", color: darkMode ? "#fff" : "#0f172a" }}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
    </div>
  )
}

// ── Field label ──────────────────────────────────────────────────────────────

function FieldLabel({ children }) {
  return (
    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
      {children}
    </p>
  )
}

// ── Per-sport field blocks ───────────────────────────────────────────────────

function CricketFields({ pref, update, darkMode }) {
  return (
    <div className="space-y-4">
      <div><FieldLabel>Batting Hand</FieldLabel><HandToggle value={pref.battingHand} onChange={(v) => update("battingHand", v)} darkMode={darkMode} /></div>
      <div><FieldLabel>Batting Position</FieldLabel><NativeSelect value={pref.battingPosition} onChange={(v) => update("battingPosition", v)} options={CRICKET_BATTING_POSITIONS} placeholder="Select position" darkMode={darkMode} /></div>
      <div><FieldLabel>Bowling Hand</FieldLabel><HandToggle value={pref.bowlingHand} onChange={(v) => update("bowlingHand", v)} darkMode={darkMode} /></div>
      <div><FieldLabel>Bowling Type</FieldLabel><NativeSelect value={pref.bowlingType} onChange={(v) => update("bowlingType", v)} options={CRICKET_BOWLING_TYPES} placeholder="Select type" darkMode={darkMode} /></div>
      <ToggleSwitch value={pref.wicketKeeper} onChange={(v) => update("wicketKeeper", v)} label="Wicket Keeper" darkMode={darkMode} />
    </div>
  )
}

function FootballFields({ pref, update, darkMode }) {
  return (
    <div className="space-y-4">
      <div><FieldLabel>Preferred Foot</FieldLabel><HandToggle value={pref.preferredFoot} onChange={(v) => update("preferredFoot", v)} darkMode={darkMode} /></div>
      <div><FieldLabel>Position</FieldLabel><NativeSelect value={pref.position} onChange={(v) => update("position", v)} options={FOOTBALL_POSITIONS} placeholder="Select position" darkMode={darkMode} /></div>
      <ToggleSwitch value={pref.goalKeeper} onChange={(v) => update("goalKeeper", v)} label="Goal Keeper" darkMode={darkMode} />
    </div>
  )
}

function BadmintonFields({ pref, update, darkMode }) {
  return (
    <div className="space-y-4">
      <div><FieldLabel>Playing Hand</FieldLabel><HandToggle value={pref.playingHand} onChange={(v) => update("playingHand", v)} darkMode={darkMode} /></div>
      <div><FieldLabel>Position</FieldLabel><NativeSelect value={pref.position} onChange={(v) => update("position", v)} options={BADMINTON_POSITIONS} placeholder="Select position" darkMode={darkMode} /></div>
    </div>
  )
}

function TennisFields({ pref, update, darkMode }) {
  return (
    <div className="space-y-4">
      <div><FieldLabel>Playing Hand</FieldLabel><HandToggle value={pref.playingHand} onChange={(v) => update("playingHand", v)} darkMode={darkMode} /></div>
      <div><FieldLabel>Position</FieldLabel><NativeSelect value={pref.position} onChange={(v) => update("position", v)} options={TENNIS_POSITIONS} placeholder="Select position" darkMode={darkMode} /></div>
    </div>
  )
}

function BasketballFields({ pref, update, darkMode }) {
  return (
    <div className="space-y-4">
      <div><FieldLabel>Position</FieldLabel><NativeSelect value={pref.position} onChange={(v) => update("position", v)} options={BASKETBALL_POSITIONS} placeholder="Select position" darkMode={darkMode} /></div>
    </div>
  )
}

function VolleyballFields({ pref, update, darkMode }) {
  return (
    <div className="space-y-4">
      <div><FieldLabel>Position</FieldLabel><NativeSelect value={pref.position} onChange={(v) => update("position", v)} options={VOLLEYBALL_POSITIONS} placeholder="Select position" darkMode={darkMode} /></div>
    </div>
  )
}

function HockeyFields({ pref, update, darkMode }) {
  return (
    <div className="space-y-4">
      <div><FieldLabel>Playing Hand</FieldLabel><HandToggle value={pref.playingHand} onChange={(v) => update("playingHand", v)} darkMode={darkMode} /></div>
      <div><FieldLabel>Position</FieldLabel><NativeSelect value={pref.position} onChange={(v) => update("position", v)} options={HOCKEY_POSITIONS} placeholder="Select position" darkMode={darkMode} /></div>
    </div>
  )
}

function TableTennisFields({ pref, update, darkMode }) {
  return (
    <div className="space-y-4">
      <div><FieldLabel>Playing Hand</FieldLabel><HandToggle value={pref.playingHand} onChange={(v) => update("playingHand", v)} darkMode={darkMode} /></div>
      <div><FieldLabel>Position</FieldLabel><NativeSelect value={pref.position} onChange={(v) => update("position", v)} options={TABLE_TENNIS_POSITIONS} placeholder="Select position" darkMode={darkMode} /></div>
    </div>
  )
}

function SportFields({ pref, update, darkMode }) {
  const props = { pref, update, darkMode }
  switch (pref.sportId) {
    case "cricket":     return <CricketFields {...props} />
    case "football":    return <FootballFields {...props} />
    case "badminton":   return <BadmintonFields {...props} />
    case "tennis":      return <TennisFields {...props} />
    case "basketball":  return <BasketballFields {...props} />
    case "volleyball":  return <VolleyballFields {...props} />
    case "hockey":      return <HockeyFields {...props} />
    case "tabletennis": return <TableTennisFields {...props} />
    default:            return null
  }
}

// ── Single sport accordion card ──────────────────────────────────────────────

function SportCard({ pref, onUpdate, onRemove, darkMode }) {
  const [expanded, setExpanded] = useState(true)
  const meta    = getSportMeta(pref.sportId)
  const summary = buildSummary(pref)

  const update = (field, value) => onUpdate({ ...pref, [field]: value })

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: darkMode ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(34,197,94,0.30)",
        background: darkMode ? "rgba(15,23,42,0.7)" : "rgba(240,253,244,0.8)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">{meta.emoji}</span>
          <span className="font-bold text-slate-900 dark:text-white text-[15px]">{meta.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-500/15 text-red-500 hover:bg-red-500/25 transition-colors"
          >
            <Trash2 size={14} />
          </button>
          {expanded
            ? <ChevronUp size={18} className="text-green-600 dark:text-green-400" />
            : <ChevronDown size={18} className="text-slate-400" />
          }
        </div>
      </div>

      {/* Collapsed summary */}
      {!expanded && summary && (
        <div className="px-4 pb-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Expanded fields */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-black/5 dark:border-white/5">
          <SportFields pref={pref} update={update} darkMode={darkMode} />
        </div>
      )}
    </div>
  )
}

// ── Sport picker modal ───────────────────────────────────────────────────────

function SportPicker({ existingIds, onPick, onClose, darkMode }) {
  const available = SUPPORTED_SPORTS.filter((s) => !existingIds.includes(s.id))

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-5"
      style={{ zIndex: 99999, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs rounded-2xl overflow-hidden"
        style={{
          background: darkMode ? "#111827" : "#ffffff",
          border: darkMode ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)" }}
        >
          <p className="font-bold text-slate-900 dark:text-white text-[16px]">Add Sport</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select a sport to add</p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {available.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { onPick(s.id); onClose() }}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-[15px] font-medium text-slate-900 dark:text-white">{s.name}</span>
            </button>
          ))}
          {available.length === 0 && (
            <p className="px-5 py-6 text-sm text-center text-slate-400">All sports added</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────────────────

export default function SportPreferencesEditor({ prefs = [], onChange }) {
  const { darkMode } = useTheme()
  const [pickerOpen, setPickerOpen] = useState(false)

  const addSport    = (id) => { if (prefs.length >= MAX_SPORTS || prefs.find((p) => p.sportId === id)) return; onChange([...prefs, defaultPref(id)]) }
  const removeSport = (id) => onChange(prefs.filter((p) => p.sportId !== id))
  const updateSport = (id, updated) => onChange(prefs.map((p) => (p.sportId === id ? updated : p)))

  return (
    <div className="space-y-3">
      {prefs.map((pref) => (
        <SportCard
          key={pref.sportId}
          pref={pref}
          darkMode={darkMode}
          onUpdate={(u) => updateSport(pref.sportId, u)}
          onRemove={() => removeSport(pref.sportId)}
        />
      ))}

      {/* Add sport */}
      {prefs.length < MAX_SPORTS && (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-all text-green-700 dark:text-green-400"
          style={{
            border: "1.5px dashed rgba(34,197,94,0.4)",
            background: darkMode ? "rgba(34,197,94,0.05)" : "rgba(34,197,94,0.06)",
          }}
        >
          <Plus size={16} />
          Add Sport ({prefs.length}/{MAX_SPORTS})
        </button>
      )}

      {/* Info hint */}
      <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-green-500/5 border border-green-500/15">
        <span className="mt-0.5 shrink-0">ℹ️</span>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          You can add up to 3 sport preferences. These will be shown on your player profile.
        </p>
      </div>

      {pickerOpen && (
        <SportPicker
          existingIds={prefs.map((p) => p.sportId)}
          onPick={addSport}
          onClose={() => setPickerOpen(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  )
}
