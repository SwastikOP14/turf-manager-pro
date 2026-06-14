import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2, Users, TrendingUp, TrendingDown } from "lucide-react"
import MobileLayout from "../../components/layout/MobileLayout"
import GlassCard from "../../components/common/GlassCard"
import BookingCard from "../../components/booking/BookingCard"
import { useApp } from "../../context/useApp"
import { useHaptics } from "../../context/HapticsContext"
import { formatCurrency } from "../../utils/format"
import { formatPhoneDisplay } from "../../utils/phone"

export default function SquadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { squads, getSquadById, deleteSquad, getPlayerById, bookings, getTurfById, getSportById } = useApp()
  const haptics = useHaptics()
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showBookingHistory, setShowBookingHistory] = useState(false)

  const squad = getSquadById(id)

  if (!squad) {
    return (
      <MobileLayout>
        <div className="pt-2 px-5 pb-5 flex items-center justify-center h-full">
          <p className="text-slate-500">Squad not found</p>
        </div>
      </MobileLayout>
    )
  }

  // Calculate squad balance
  const squadBalance = squad.memberPlayerIds.reduce((total, playerId) => {
    const player = getPlayerById(playerId)
    return total + (player?.balance || 0)
  }, 0)

  // Get squad bookings
  const squadBookings = useMemo(() => {
    return bookings
      .filter(booking => booking.squadId === squad.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [bookings, squad.id])

  const handleDelete = () => {
    haptics.trigger([15, 50, 15])
    deleteSquad(squad.id)
    navigate("/players")
  }

  const handleEdit = () => {
    navigate(`/squad/${squad.id}/edit`)
  }

  const displayedBookings = showBookingHistory ? squadBookings : squadBookings.slice(0, 3)

  return (
    <MobileLayout>
      <div className="pt-2 px-5 pb-5 space-y-4 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/players")}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-slate-700 dark:text-white" />
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="w-10 h-10 rounded-xl bg-green-500/15 text-green-600 dark:text-green-400 flex items-center justify-center"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Squad Info Card */}
        <GlassCard style={{ padding: "20px" }}>
          <div className="flex items-center gap-3 mb-4">
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, var(--brand), #00B4D8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Users size={28} style={{ color: "#000" }} strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "var(--text-primary)",
                margin: 0,
                letterSpacing: "-0.02em"
              }}>
                {squad.name}
              </h1>
              <p style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                margin: "4px 0 0",
                fontWeight: 500
              }}>
                {squad.memberPlayerIds.length} {squad.memberPlayerIds.length === 1 ? "member" : "members"}
              </p>
            </div>
          </div>

          {/* Squad Balance */}
          <div className="rounded-2xl p-4" style={{
            background: squadBalance >= 0 ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            border: squadBalance >= 0 ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(239,68,68,0.2)"
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  margin: 0
                }}>
                  Total Squad Balance
                </p>
                <p style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: squadBalance >= 0 ? "#10b981" : "#ef4444",
                  margin: "4px 0 0",
                  fontFeatureSettings: '"tnum" 1',
                  letterSpacing: "-0.03em"
                }}>
                  {formatCurrency(Math.abs(squadBalance))}
                </p>
              </div>
              {squadBalance >= 0 ? (
                <TrendingUp size={32} style={{ color: "#10b981" }} />
              ) : (
                <TrendingDown size={32} style={{ color: "#ef4444" }} />
              )}
            </div>
          </div>
        </GlassCard>

        {/* Players Section */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
            Players ({squad.memberPlayerIds.length})
          </h2>
          <div className="space-y-2">
            {squad.memberPlayerIds.map(playerId => {
              const player = getPlayerById(playerId)
              if (!player) return null
              
              return (
                <GlassCard
                  key={player.id}
                  className="cursor-pointer hover:shadow-lg transition-all"
                  style={{ padding: "14px 16px" }}
                  onClick={() => navigate(`/player/${player.id}`)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-bold text-slate-900 dark:text-white mb-1">
                        {player.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatPhoneDisplay(player.phone)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                        Balance
                      </p>
                      <p className={`text-lg font-bold ${player.balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                        {formatCurrency(player.balance)}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              )
            })}
          </div>
        </div>

        {/* Booking History Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Booking History ({squadBookings.length})
            </h2>
            {squadBookings.length > 3 && !showBookingHistory && (
              <button
                onClick={() => setShowBookingHistory(true)}
                className="text-sm font-semibold text-green-600 dark:text-green-400"
              >
                View All
              </button>
            )}
          </div>
          
          {squadBookings.length > 0 ? (
            <div className="space-y-3">
              {displayedBookings.map(booking => {
                const turf = getTurfById(booking.turfId)
                const sport = getSportById(booking.sportId)
                return (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    turfName={turf?.name || "Unknown Turf"}
                    sportName={sport?.name || "Sport"}
                    sportId={sport?.id}
                    sport={sport}
                    selectMode={false}
                    selected={false}
                  />
                )
              })}
              {showBookingHistory && squadBookings.length > 3 && (
                <button
                  onClick={() => setShowBookingHistory(false)}
                  className="w-full py-3 text-sm font-semibold text-slate-600 dark:text-slate-400"
                >
                  Show Less
                </button>
              )}
            </div>
          ) : (
            <GlassCard style={{ padding: "32px 24px", textAlign: "center" }}>
              <p className="text-slate-500 dark:text-slate-400">
                No bookings yet with this squad
              </p>
            </GlassCard>
          )}
        </div>

        {/* Payment History Placeholder */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
            Payment History
          </h2>
          <GlassCard style={{ padding: "32px 24px", textAlign: "center" }}>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Payment history will be available soon
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-99999 flex items-end"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full bg-white dark:bg-[#0f172a] rounded-t-3xl px-5 pt-5 pb-8 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-500/15 flex items-center justify-center shrink-0">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-slate-900 dark:text-white">
                  Delete Squad?
                </h2>
                <p className="text-sm text-red-500 dark:text-red-400 mt-0.5 font-medium">
                  This will permanently delete "{squad.name}". Members won't be affected.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3.5 rounded-2xl border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold text-[15px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-bold text-[15px] flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  )
}