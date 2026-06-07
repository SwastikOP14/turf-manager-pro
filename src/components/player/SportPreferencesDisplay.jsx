import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { getSportMeta, buildSummary } from "../../constants/sportPreferences"

function DetailRow({ label, value }) {
  if (!value && value !== false) return null
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-slate-800 dark:text-white font-medium">{String(value)}</span>
    </div>
  )
}

function SportDetailBlock({ pref }) {
  switch (pref.sportId) {
    case "cricket":
      return (
        <div className="space-y-2 pt-2">
          <DetailRow label="Batting Hand"     value={pref.battingHand === "R" ? "Right Hand" : "Left Hand"} />
          <DetailRow label="Batting Position" value={pref.battingPosition} />
          <DetailRow label="Bowling Hand"     value={pref.bowlingHand === "R" ? "Right Arm" : "Left Arm"} />
          <DetailRow label="Bowling Type"     value={pref.bowlingType} />
          <DetailRow label="Wicket Keeper"    value={pref.wicketKeeper ? "Yes" : "No"} />
        </div>
      )
    case "football":
      return (
        <div className="space-y-2 pt-2">
          <DetailRow label="Preferred Foot" value={pref.preferredFoot === "R" ? "Right Foot" : "Left Foot"} />
          <DetailRow label="Position"       value={pref.position} />
          <DetailRow label="Goal Keeper"    value={pref.goalKeeper ? "Yes" : "No"} />
        </div>
      )
    case "badminton":
    case "tennis":
    case "hockey":
    case "tabletennis":
      return (
        <div className="space-y-2 pt-2">
          <DetailRow label="Playing Hand" value={pref.playingHand === "R" ? "Right Hand" : "Left Hand"} />
          <DetailRow label="Position"     value={pref.position} />
        </div>
      )
    case "basketball":
    case "volleyball":
      return (
        <div className="space-y-2 pt-2">
          <DetailRow label="Position" value={pref.position} />
        </div>
      )
    default:
      return null
  }
}

function SportCard({ pref }) {
  const [expanded, setExpanded] = useState(false)
  const meta    = getSportMeta(pref.sportId)
  const summary = buildSummary(pref)

  return (
    <div className="rounded-2xl overflow-hidden border border-black/8 dark:border-white/8 bg-slate-50 dark:bg-white/3">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.emoji}</span>
          <span className="font-bold text-slate-900 dark:text-white text-[15px]">{meta.name}</span>
        </div>
        {expanded
          ? <ChevronUp size={16} className="text-green-600 dark:text-green-400 shrink-0" />
          : <ChevronDown size={16} className="text-slate-400 shrink-0" />
        }
      </div>

      {/* Collapsed summary */}
      {!expanded && summary && summary !== "Not configured" && (
        <div className="px-4 pb-3 -mt-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-black/5 dark:border-white/5">
          <SportDetailBlock pref={pref} />
        </div>
      )}
    </div>
  )
}

export default function SportPreferencesDisplay({ prefs = [] }) {
  if (!prefs || prefs.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 italic py-2">
        No sport preferences added yet.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {prefs.map((pref) => (
        <SportCard key={pref.sportId} pref={pref} />
      ))}
    </div>
  )
}
