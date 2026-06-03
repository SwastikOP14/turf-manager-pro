import { useState } from "react"
import { ChevronDown } from "lucide-react"
import GlassCard from "../common/GlassCard"
import { formatCurrency } from "../../utils/format"

export default function TeamCostDisplay({
  teams,
  allPlayers,
  splitCosts,
  splitMode,
  getPlayerById
}) {
  // All teams expanded by default so costs are always visible
  const [expandedTeams, setExpandedTeams] = useState(() => new Set(teams.map((t) => t.id)))

  const toggleTeamExpand = (teamId) => {
    setExpandedTeams((prev) => {
      const next = new Set(prev)
      if (next.has(teamId)) next.delete(teamId)
      else next.add(teamId)
      return next
    })
  }

  if (!teams || teams.length === 0) return null

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wide">
        Cost Breakdown — {splitMode === "Team" ? "Team Wise" : "Player Wise"}
      </p>

      {teams.map((team) => {
        const costs = splitCosts?.[team.id]
        if (!costs) return null

        const isExpanded = expandedTeams.has(team.id)
        const playerCost = costs?.playerCost ?? 0

        return (
          <GlassCard key={team.id} className="overflow-hidden p-0">
            {/* Team Header — always visible, collapsible */}
            <div
              className="flex items-center justify-between cursor-pointer px-4 py-3 hover:bg-white/5 dark:hover:bg-black/20 transition-colors"
              onClick={() => toggleTeamExpand(team.id)}
            >
              <div className="flex items-center gap-2 flex-1">
                <div className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                  <ChevronDown size={16} className="text-green-500" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {team.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-gray-400 ml-2">
                    ({costs.playerCount} player{costs.playerCount !== 1 ? "s" : ""})
                  </span>
                </div>
              </div>

              {/* Team Amount — only shown in Team Wise Split */}
              {splitMode === "Team" && costs.teamAmount != null && (
                <div className="text-right shrink-0 pl-3">
                  <p className="text-xs text-slate-500 dark:text-gray-400 leading-none">Team Amount</p>
                  <p className="text-sm font-bold text-green-700 dark:text-green-400 mt-0.5">
                    {formatCurrency(costs.teamAmount)}
                  </p>
                </div>
              )}
            </div>

            {/* Player list — visible when expanded, always shows cost beside name */}
            {isExpanded && (
              <div className="border-t border-black/10 dark:border-white/10 px-4 py-3 space-y-2">
                {team.playerIds && team.playerIds.length > 0 ? (
                  team.playerIds.map((playerId) => {
                    const player = allPlayers.find((p) => p.id === playerId)
                    return (
                      <div
                        key={playerId}
                        className="flex items-center justify-between py-0.5"
                      >
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate pr-4">
                          {player?.name || "Unknown Player"}
                        </p>
                        <p className="text-sm font-bold text-green-700 dark:text-green-400 shrink-0">
                          {formatCurrency(playerCost)}
                        </p>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-slate-500 dark:text-gray-400 italic py-1">
                    No players in this team
                  </p>
                )}
              </div>
            )}
          </GlassCard>
        )
      })}
    </div>
  )
}
