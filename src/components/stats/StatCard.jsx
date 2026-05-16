import GlassCard from "../common/GlassCard"

export default function StatCard({
  title,
  value,
  color = "text-green-500"
}) {

  return (
    <GlassCard>

      <div className="space-y-2">

        <p className="
          text-sm
          text-gray-500 dark:text-gray-400
        ">
          {title}
        </p>

        <h2 className={`
          text-3xl font-bold
          ${color}
        `}>
          {value}
        </h2>

      </div>

    </GlassCard>
  )
}