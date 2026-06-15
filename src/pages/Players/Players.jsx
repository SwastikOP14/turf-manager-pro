import { useRef, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, ChevronDown, Users, Layers } from "lucide-react"

import MobileLayout from "../../components/layout/MobileLayout"
import PlayerCard from "../../components/player/PlayerCard"
import SquadCard from "../../components/squad/SquadCard"
import AddPlayerModal from "../../components/booking/AddPlayerModal"
import AddSquadModal from "../../components/squad/AddSquadModal"
import { useApp } from "../../context/useApp"
import { useHaptics } from "../../context/HapticsContext"

const SORT_OPTIONS = [
  "Sort A-Z",
  "Sort Z-A",
  "Negative Balance",
  "Positive Balance"
]

function filterAndSort(players, query, sortType) {
  const q = query.trim().toLowerCase()

  let list = q
    ? players.filter((p) => {
        const name = p.name.toLowerCase()
        const phone = p.phone.replace(/\D/g, "")
        const qDigits = q.replace(/\D/g, "")
        return name.includes(q) || (qDigits && phone.includes(qDigits))
      })
    : [...players]

  if (q) {
    list.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1
      const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1
      return aStarts - bStarts
    })
    return list
  }

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
  const { players, squads } = useApp()
  const navigate = useNavigate()
  const haptics = useHaptics()

  const [view, setView] = useState("players") // "players" | "squads"
  const [search, setSearch] = useState("")
  const [sortOpen, setSortOpen] = useState(false)
  const [sortType, setSortType] = useState("Sort A-Z")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddSquadModal, setShowAddSquadModal] = useState(false)
  const sortRef = useRef(null)

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

  const handleFabClick = () => {
    if (view === "players") setShowAddModal(true)
    else setShowAddSquadModal(true)
  }

  return (
    <MobileLayout onFabClick={handleFabClick}>
      <div className="pt-4 px-5 pb-5 space-y-4 animate-fade-in-up">
        {/* Squads / Players toggle */}
        <div style={{
          display: "flex",
          background: "var(--bg-card)",
          border: "1.5px solid var(--bg-border)",
          borderRadius: "14px",
          padding: "4px",
          gap: "4px",
        }}>
          <button
            type="button"
            onClick={() => setView("squads")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px 0",
              borderRadius: "10px",
              border: "none",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: view === "squads" ? "var(--brand)" : "transparent",
              color: view === "squads" ? "#000" : "var(--text-muted)",
            }}
          >
            <Layers size={16} />
            Squads
          </button>
          <button
            type="button"
            onClick={() => setView("players")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px 0",
              borderRadius: "10px",
              border: "none",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: view === "players" ? "var(--brand)" : "transparent",
              color: view === "players" ? "#000" : "var(--text-muted)",
            }}
          >
            <Users size={16} />
            Players
          </button>
        </div>

        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
          {view === "players"
            ? `${players.length} total · Manage balances & dues`
            : `${squads.length} squad${squads.length === 1 ? "" : "s"} · Manage your teams`}
        </p>

        {view === "players" ? (
          <>
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
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "48px 24px", gap: "14px" }}>
                  <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                    <circle cx="36" cy="28" r="16" fill="var(--brand-subtle)" />
                    <circle cx="36" cy="28" r="10" fill="var(--brand)" opacity="0.3" />
                    <path d="M16 56c0-11 8.954-20 20-20s20 9 20 20" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
                  </svg>
                  <div>
                    <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>No players yet</p>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "6px 0 0" }}>
                      {search ? `No match for "${search}"` : "Tap + to add your first player"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Squads list */
          <div className="space-y-3.5">
            {squads.length > 0 ? (
              squads.map((squad) => (
                <SquadCard
                  key={squad.id}
                  squad={squad}
                  onClick={() => {
                    haptics.trigger(8)
                    navigate(`/squad/${squad.id}`)
                  }}
                />
              ))
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "48px 24px", gap: "14px" }}>
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                  <rect x="14" y="14" width="20" height="20" rx="6" fill="var(--brand-subtle)" />
                  <rect x="38" y="14" width="20" height="20" rx="6" fill="var(--brand)" opacity="0.3" />
                  <rect x="14" y="38" width="20" height="20" rx="6" fill="var(--brand)" opacity="0.3" />
                  <rect x="38" y="38" width="20" height="20" rx="6" fill="var(--brand-subtle)" />
                </svg>
                <div>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>No squads yet</p>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "6px 0 0" }}>
                    Tap + to create your first squad
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddPlayerModal
          onClose={() => setShowAddModal(false)}
          onPlayerAdded={() => setShowAddModal(false)}
        />
      )}

      {showAddSquadModal && (
        <AddSquadModal
          onClose={() => setShowAddSquadModal(false)}
          onSquadAdded={() => setShowAddSquadModal(false)}
        />
      )}
    </MobileLayout>
  )
}