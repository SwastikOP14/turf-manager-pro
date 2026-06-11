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
      <div className="pt-2 px-5 pb-5 space-y-4 animate-fade-in-up">
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", margin: 0 }}>Players</h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0" }}>
            {players.length} total · Manage balances &amp; dues
          </p>
        </div>

        {/* Search + sort row */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--bg-card)",
            border: "1.5px solid var(--bg-border)",
            borderRadius: "12px",
            padding: "0 14px",
            height: "46px",
          }}>
            <Search size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players..."
              autoComplete="off"
              spellCheck="false"
              style={{
                flex: 1, background: "transparent", outline: "none",
                fontSize: "14px", color: "var(--text-primary)", border: "none",
              }}
            />
            {search && (
              <button type="button" onClick={() => setSearch("")}
                style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", fontSize: "18px", lineHeight: 1 }}>
                ×
              </button>
            )}
          </div>

          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              style={{
                height: "46px",
                padding: "0 14px",
                borderRadius: "12px",
                background: "var(--bg-card)",
                border: "1.5px solid var(--bg-border)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--text-primary)",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Sort
              <ChevronDown size={14} style={{ transition: "transform 0.2s", transform: sortOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>

            {sortOpen && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)", width: "180px", zIndex: 50,
                borderRadius: "14px", overflow: "hidden",
                background: "var(--bg-card)", border: "1px solid var(--bg-border)",
                boxShadow: "var(--shadow-elevated)",
              }}>
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => { setSortType(option); setSortOpen(false) }}
                    style={{
                      width: "100%", padding: "12px 16px", textAlign: "left",
                      fontSize: "13px", fontWeight: 500, fontFamily: "inherit",
                      background: sortType === option ? "var(--brand)" : "transparent",
                      color: sortType === option ? "#000" : "var(--text-primary)",
                      border: "none", cursor: "pointer",
                    }}
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
