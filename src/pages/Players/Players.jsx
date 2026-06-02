import { useMemo, useState } from "react"
import { Search, ChevronDown } from "lucide-react"

import MobileLayout from "../../components/layout/MobileLayout"
import PlayerCard from "../../components/player/PlayerCard"
import { useApp } from "../../context/useApp"
import { searchPlayers } from "../../utils/players"

const SORT_OPTIONS = [
  "Sort A-Z",
  "Sort Z-A",
  "Negative Balance",
  "Positive Balance"
]

export default function Players() {
  const { players } = useApp()

  const [search, setSearch] = useState("")
  const [sortOpen, setSortOpen] = useState(false)
  const [sortType, setSortType] = useState("Sort A-Z")

  const filteredPlayers = useMemo(() => {
    let list = searchPlayers(players, search)

    if (sortType === "Sort A-Z") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    }

    if (sortType === "Sort Z-A") {
      list = [...list].sort((a, b) => b.name.localeCompare(a.name))
    }

    if (sortType === "Positive Balance") {
      list = [...list].sort((a, b) => b.balance - a.balance)
    }

    if (sortType === "Negative Balance") {
      list = [...list].sort((a, b) => a.balance - b.balance)
    }

    return list
  }, [players, search, sortType])

  return (
    <MobileLayout>
      <div className="p-5 space-y-5 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Players
        </h1>

        <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-stretch">
          <div className="
            px-4 rounded-2xl h-12
            bg-green-500 text-black
            font-semibold flex items-center justify-center
            whitespace-nowrap text-sm
          ">
            {filteredPlayers.length} Players
          </div>

          <div className="
            h-12 px-3 rounded-2xl
            bg-[var(--color-card)]
            border border-[var(--color-card-border)]
            flex items-center gap-2
            shadow-[var(--shadow-card)]
          ">
            <Search size={18} className="text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players..."
              className="
                bg-transparent outline-none w-full
                text-slate-900 dark:text-white text-sm
              "
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="
                h-12 px-4 rounded-2xl
                bg-[var(--color-card)]
                border border-[var(--color-card-border)]
                flex items-center gap-2
                text-slate-900 dark:text-white text-sm font-medium
                shadow-[var(--shadow-card)]
              "
            >
              Sort
              <ChevronDown size={16} />
            </button>

            {sortOpen && (
              <div className="
                absolute right-0 top-14 w-48 z-50
                rounded-2xl overflow-hidden
                bg-white dark:bg-[#111827]
                border border-black/10 dark:border-white/10
                shadow-[var(--shadow-glow)]
              ">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortType(option)
                      setSortOpen(false)
                    }}
                    className={`
                      w-full px-4 py-3 text-left text-sm font-medium
                      ${sortType === option
                        ? "bg-green-500 text-black"
                        : "text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
                      }
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {filteredPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
            />
          ))}
        </div>
      </div>
    </MobileLayout>
  )
}
