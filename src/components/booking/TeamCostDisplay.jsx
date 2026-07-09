import GlassCard from "../common/GlassCard"
import SectionTitle from "../common/SectionTitle"
import { formatCurrency } from "../../utils/format"

export default function TeamCostDisplay({
  teams,
  allPlayers,
  splitCosts,
  splitMode,
  getPlayerById,
  onTogglePlayer,
  embedded = false
}) {
  if (!teams || teams.length === 0) return null

  const content = (
    <>
      {/* Header */}
      <div className={embedded ? "" : "px-4 pt-4 pb-2"}>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400 mb-2">
          Cost Breakdown
        </p>
      </div>

      {/* Slabs */}
      <div className={embedded ? "space-y-2" : "px-4 pb-4 space-y-2"}>
        {teams.map((team) => {
          const costs = splitCosts?.[team.id]
          if (!costs) return null

          return (
            <div
              key={team.id}
              className="flex items-center justify-between p-3 rounded-xl bg-green-500/8 border border-green-500/20"
            >
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-green-500/15 flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-400 shrink-0">
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {team.name} ({costs.playerCount} players)
                  </span>
                </div>
              </div>

              <span className="text-base font-bold text-green-700 dark:text-green-400">
                {formatCurrency(costs.playerCost)}
              </span>
            </div>
          )
        })}
      </div>
    </>
  )

  if (embedded) return content

  return (
    <GlassCard className="p-0 overflow-hidden">
      {content}
    </GlassCard>
  )
}