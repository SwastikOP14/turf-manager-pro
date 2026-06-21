import { useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import MobileLayout from "../../components/layout/MobileLayout";
import GlassCard from "../../components/common/GlassCard";
import PlayerCard from "../../components/player/PlayerCard";
import { useApp } from "../../context/useApp";
import { useHaptics } from "../../context/HapticsContext";
import { formatCurrency } from "../../utils/format";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SquadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getSquadById,
    deleteSquad,
    getPlayerById,
    getTurfById,
    getSportById,
    bookings,
  } = useApp();
  const haptics = useHaptics();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [showAllPayments, setShowAllPayments] = useState(false);

  const squad = getSquadById(id);

  if (!squad) {
    return (
      <MobileLayout>
        <div className="pt-2 px-5 pb-5 flex items-center justify-center h-full">
          <p className="text-slate-500">Squad not found</p>
        </div>
      </MobileLayout>
    );
  }

  const memberIds = squad.memberPlayerIds || [];

  // Live squad balance = sum of member balances
  const squadBalance = memberIds.reduce((total, pid) => {
    const player = getPlayerById(pid);
    return total + (player?.balance || 0);
  }, 0);

  // Booking History — bookings where ANY member of this squad was in a team
  const squadBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        if (!booking.teams?.length) return false;
        return booking.teams.some((team) =>
          team.playerIds?.some((pid) => memberIds.includes(pid))
        );
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [bookings, memberIds]);

  // Payment History — credit history items from all squad members
  const paymentHistory = useMemo(() => {
    const entries = [];
    memberIds.forEach((pid) => {
      const player = getPlayerById(pid);
      if (!player?.history) return;
      player.history
        .filter((h) => h.type === "credit")
        .forEach((h) => {
          entries.push({
            ...h,
            playerName: player.name,
            playerId: pid,
          });
        });
    });
    return entries.sort(
      (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
    );
  }, [memberIds, getPlayerById]);

  const handleDelete = () => {
    haptics.trigger([15, 50, 15]);
    deleteSquad(squad.id);
    navigate("/players");
  };

  const displayedBookings = showAllBookings
    ? squadBookings
    : squadBookings.slice(0, 3);

  const displayedPayments = showAllPayments
    ? paymentHistory
    : paymentHistory.slice(0, 4);

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
              onClick={() => navigate(`/squad/${squad.id}/edit`)}
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
              width: "56px", height: "56px", borderRadius: "16px",
              background: "linear-gradient(135deg, var(--brand), #00B4D8)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Users size={28} style={{ color: "#000" }} strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
                {squad.name}
              </h1>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "4px 0 0", fontWeight: 500 }}>
                {memberIds.length} {memberIds.length === 1 ? "member" : "members"}
              </p>
            </div>
          </div>

          {/* Squad Balance */}
          <div className="rounded-2xl p-4" style={{
            background: squadBalance >= 0 ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            border: squadBalance >= 0 ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(239,68,68,0.2)",
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                  Total Squad Balance
                </p>
                <p style={{ fontSize: "28px", fontWeight: 800, color: squadBalance >= 0 ? "#10b981" : "#ef4444", margin: "4px 0 0", fontFeatureSettings: '"tnum" 1', letterSpacing: "-0.03em" }}>
                  {squadBalance >= 0 ? "↑" : "↓"} {formatCurrency(Math.abs(squadBalance))}
                </p>
              </div>
              {squadBalance >= 0
                ? <TrendingUp size={32} style={{ color: "#10b981" }} />
                : <TrendingDown size={32} style={{ color: "#ef4444" }} />}
            </div>
          </div>
        </GlassCard>

        {/* Players Section */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
            Players ({memberIds.length})
          </h2>
          <div className="space-y-2">
            {memberIds.map((pid) => {
              const player = getPlayerById(pid);
              if (!player) return null;
              return <PlayerCard key={pid} player={player} />;
            })}
          </div>
        </div>

        {/* Booking History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Booking History ({squadBookings.length})
            </h2>
            {squadBookings.length > 3 && (
              <button
                onClick={() => setShowAllBookings(!showAllBookings)}
                className="text-sm font-semibold text-green-600 dark:text-green-400"
              >
                {showAllBookings ? "Show Less" : "View All"}
              </button>
            )}
          </div>

          {squadBookings.length > 0 ? (
            <div className="space-y-2">
              {displayedBookings.map((booking) => {
                const sport = getSportById(booking.sportId);
                const turf = getTurfById(booking.turfId);
                // Cost this squad paid = costPerSquad (amount / numTeams)
                const numTeams = booking.teams?.length || 1;
                const squadCost = booking.amount / numTeams;

                return (
                  <GlassCard key={booking.id} style={{ padding: "14px 16px" }}>
                    <div className="flex items-center justify-between gap-3">
                      <div style={{
                        width: "38px", height: "38px", borderRadius: "10px",
                        background: "rgba(239,68,68,0.1)", display: "flex",
                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <ArrowDownLeft size={18} style={{ color: "#ef4444" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-900 dark:text-white">
                          {sport?.name || "Sport"} • {booking.id}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {turf?.name || "Turf"} • {formatDate(booking.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-red-500">
                          -{formatCurrency(squadCost)}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          ÷{numTeams} squads
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            <GlassCard style={{ padding: "32px 24px", textAlign: "center" }}>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                No bookings yet with this squad
              </p>
            </GlassCard>
          )}
        </div>

        {/* Payment History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Payment History ({paymentHistory.length})
            </h2>
            {paymentHistory.length > 4 && (
              <button
                onClick={() => setShowAllPayments(!showAllPayments)}
                className="text-sm font-semibold text-green-600 dark:text-green-400"
              >
                {showAllPayments ? "Show Less" : "View All"}
              </button>
            )}
          </div>

          {paymentHistory.length > 0 ? (
            <div className="space-y-2">
              {displayedPayments.map((item) => (
                <GlassCard key={item.id} style={{ padding: "14px 16px" }}>
                  <div className="flex items-center justify-between gap-3">
                    <div style={{
                      width: "38px", height: "38px", borderRadius: "10px",
                      background: "rgba(16,185,129,0.1)", display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <ArrowUpRight size={18} style={{ color: "#10b981" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white">
                        {item.playerName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.notes || "Balance Top-up"} • {formatDate(item.date)}
                      </p>
                    </div>
                    <p className="text-base font-bold text-green-600 dark:text-green-400">
                      +{formatCurrency(item.amount)}
                    </p>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard style={{ padding: "32px 24px", textAlign: "center" }}>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                No payments yet from squad members
              </p>
            </GlassCard>
          )}
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
  );
}