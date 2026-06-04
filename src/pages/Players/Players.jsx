import { useRef, useEffect, useState } from "react"
import { Search, ChevronDown } from "lucide-react"

import MobileLayout from "../../components/layout/MobileLayout"
import PlayerCard from "../../components/player/PlayerCard"
import AddPlayerModal from "../../components/booking/AddPlayerModal"
import { useApp } from "../../context/useApp"

const SORT_OPTIONS = [
  "Sort A-Z",
  "Sort Z-A",
  "Negative Balance",
  "Positive Balance"
]

function filterAndSort(players, query, sortType) {
  const q = query.trim().toLowerCase()

  // 1. Filter by name or phone
  let list = q
    ? players.filter((p) => {
        const name = p.name.toLowerCase()
        const phone = p.phone.replace(/\D/g, "")
        const qDigits = q.replace(/\D/g, "")
        return name.includes(q) || (qDigits && phone.includes(qDigits))
      })
    : [...players]

  // 2. If searching, put starts-with matches first
  if (q) {
    list.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1
      const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1
      return aStarts - bStarts
    })
    return list
  }

  // 3. No search — apply sort preference
  switch (sortType) {
    case "Sort A-Z":
      return list.sort((a, b) => a.name.localeCompare(b.name))
    case "Sort Z-A":
      return list.sort((a, b) => b.name.localeCompare(a.name))
    case "Positive Balance":
      return list.sort((a, b) => b.balance - a.balance)
    case "Negative Balance":
      return list.sort((a, b) => a.balance - b.balance)
    default:
      return list
  }
}

export default function Players() {
  const { players } = useApp()

  const [search, setSearch] = useState("")
  const [sortOpen, setSortOpen] = useState(false)
  const [sortType, setSortType] = useState("Sort A-Z")
  const [showAddModal, setShowAddModal] = useState(false)
  const sortRef = useRef(null)

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!sortOpen) return
    const handleClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [sortOpen])

  const filteredPlayers = filterAndSort(players, search, sortType)

  return (
    <MobileLayout onFabClick={() => setShowAddModal(true)}>
      <div className="p-5 space-y-5 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Players</h1>
          <p className="text-[14px] text-slate-500 dark:text-gray-400 mt-1.5">
            Manage balances, track dues &amp; add players
          </p>
        </div>

        {/* Search bar row */}
        <div className="grid grid-cols-[auto_1fr_auto] gap-2.5 items-center">
          <div className="px-4 h-11 rounded-2xl bg-green-500 text-black font-bold flex items-center justify-center whitespace-nowrap text-[14px]">
            {filteredPlayers.length} Players
          </div>

          <div className="h-11 px-3.5 rounded-2xl bg-[var(--color-card)] border border-[var(--color-card-border)] flex items-center gap-2 shadow-[var(--shadow-card)]">
            <Search size={16} className="text-slate-500 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players..."
              autoComplete="off"
              spellCheck="false"
              className="bg-transparent outline-none w-full text-slate-900 dark:text-white text-[14px] placeholder-slate-400 dark:placeholder-slate-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white shrink-0 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>

          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="h-11 px-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-card-border)] flex items-center gap-1.5 text-slate-900 dark:text-white text-[14px] font-semibold shadow-[var(--shadow-card)] whitespace-nowrap"
            >
              Sort
              <ChevronDown size={15} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-52 z-50 rounded-2xl overflow-hidden bg-white dark:bg-[#111827] border border-black/10 dark:border-white/10 shadow-xl">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => { setSortType(option); setSortOpen(false) }}
                    className={`w-full px-4 py-3.5 text-left text-[14px] font-medium transition-colors
                      ${sortType === option
                        ? "bg-green-500 text-black"
                        : "text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Player list */}
        <div className="space-y-3.5">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))
          ) : (
            <div className="py-12 flex flex-col items-center gap-3 text-center">
              <span className="text-4xl">🔍</span>
              <p className="text-[15px] font-semibold text-slate-700 dark:text-white">
                No player found
              </p>
              <p className="text-[13px] text-slate-500 dark:text-gray-400">
                No match for "<span className="font-semibold">{search}</span>"
              </p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddPlayerModal
          onClose={() => setShowAddModal(false)}
          onPlayerAdded={() => setShowAddModal(false)}
        />
      )}
    </MobileLayout>
  )
}
