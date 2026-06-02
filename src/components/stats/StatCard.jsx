import GlassCard from "../common/GlassCard"

export default function StatCard({
  title,
  value,
  color = "text-green-500"
}) {
  return (
    <GlassCard>
      <p className="text-xs text-slate-500 dark:text-gray-400">
        {title}
      </p>
      <p className={`text-2xl font-bold mt-2 ${color}`}>
        {value}
      </p>
    </GlassCard>
  )
}
