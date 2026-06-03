import { useMemo, useRef, useEffect, useState } from "react"
import { Search, ChevronDown } from "lucide-react"

import MobileLayout from "../../components/layout/MobileLayout"
import PlayerCard from "../../components/player/PlayerCard"
import AddPlayerModal from "../../components/booking/AddPlayerModal"
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

  const filteredPlayers = useMemo(() => {
    let list = searchPlayers(players, search)

    if (sortType === "Sort A-Z") list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sortType === "Sort Z-A") list = [...list].sort((a, b) => b.name.localeCompare(a.name))
    if (sortType === "Positive Balance") list = [...list].sort((a, b) => b.balance - a.balance)
    if (sortType === "Negative Balance") list = [...list].sort((a, b) => a.balance - b.balance)

    return list
  }, [players, search, sortType])

  return (
    <MobileLayout onFabClick={() => setShowAddModal(true)}>
      <div className="p-5 space-y-5 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Players</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
            Manage balances, track dues &amp; add players
          </p>
        </div>

        <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-center">
          <div className="px-4 h-11 rounded-2xl bg-green-500 text-black font-semibold flex items-center justify-center whitespace-nowrap text-sm">
            {filteredPlayers.length} Players
          </div>

          <div className="h-11 px-3 rounded-2xl bg-[var(--color-card)] border border-[var(--color-card-border)] flex items-center gap-2 shadow-[var(--shadow-card)]">
            <Search size={16} className="text-slate-500 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players..."
              className="bg-transparent outline-none w-full text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="h-11 px-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-card-border)] flex items-center gap-1.5 text-slate-900 dark:text-white text-sm font-medium shadow-[var(--shadow-card)] whitespace-nowrap"
            >
              Sort
              <ChevronDown size={15} />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-48 z-50 rounded-2xl overflow-hidden bg-white dark:bg-[#111827] border border-black/10 dark:border-white/10 shadow-[var(--shadow-glow)]">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => { setSortType(option); setSortOpen(false) }}
                    className={`w-full px-4 py-3 text-left text-sm font-medium
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

        <div className="space-y-4">
          {filteredPlayers.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      </div>

      {/* Add Player Modal — same dialog as in booking */}
      {showAddModal && (
        <AddPlayerModal
          onClose={() => setShowAddModal(false)}
          onPlayerAdded={() => setShowAddModal(false)}
        />
      )}
    </MobileLayout>
  )
}
