import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Edit, Trash2, TrendingUp, TrendingDown,
  ArrowDownLeft, ArrowUpRight, Users,
} from "lucide-react";
import { getInitials } from "../../utils/initials";
import MobileLayout from "../../components/layout/MobileLayout";
import GlassCard from "../../components/common/GlassCard";
import PlayerCard from "../../components/player/PlayerCard";
import PlayerAvatar from "../../components/common/PlayerAvatar";
import { useApp } from "../../context/useApp";
import { useHaptics } from "../../context/HapticsContext";
import { formatCurrency } from "../../utils/format";
import ConfirmDialog from "../../components/common/ConfirmDialog";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function SquadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getSquadById, deleteSquad, getPlayerById, updateSquad,
    getTurfById, getSportById, bookings, contributeToSquad,
    updatePlayer,
  } = useApp();
  const haptics = useHaptics();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [playerSelectMode, setPlayerSelectMode] = useState(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState(new Set());
  const [showRemovePlayersConfirm, setShowRemovePlayersConfirm] = useState(false);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [expandedBookings, setExpandedBookings] = useState(new Set());
  const [contributeModal, setContributeModal] = useState(null);
  const [contributeAmount, setContributeAmount] = useState("");
  const [contributeError, setContributeError] = useState("");
  const [editPaymentModal, setEditPaymentModal] = useState(null); // { contributionId, playerId, playerName, currentAmount }
  const [editPaymentAmount, setEditPaymentAmount] = useState("");
  const [editPaymentError, setEditPaymentError] = useState("");
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

  const squadBalance = (squad.contributions || []).reduce(
    (total, c) => total + (c.amount || 0), 0
  );

  const squadBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        if (booking.bookingType !== "Team") return false;
        if (!booking.teams?.length) return false;
        return booking.teams.some((team) =>
          team.playerIds?.some((pid) => memberIds.includes(pid))
        );
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [bookings, memberIds]);

  // Payment History should only show real player top-ups, not booking deductions
  const paymentHistory = useMemo(() => {
    return (squad.contributions || [])
      .filter((c) => c.playerId && !c.bookingId && c.amount > 0)
      .map((c) => {
        const player = getPlayerById(c.playerId);
        return { ...c, playerName: player?.name || "Unknown" };
      })
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [squad.contributions, getPlayerById]);

  const handleDelete = () => {
    haptics.trigger([15, 50, 15]);
    deleteSquad(squad.id);
    navigate("/players");
  };

  const displayedBookings = showAllBookings ? squadBookings : squadBookings.slice(0, 3);
  const displayedPayments = showAllPayments ? paymentHistory : paymentHistory.slice(0, 4);

  return (
    <MobileLayout>
      <div className="pt-3 px-4 pb-24 space-y-3 animate-fade-in-up">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 dark:text-white leading-tight">{squad.name}</h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Squad overview & history</p>
          </div>

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

        {/* Remove old header section */}
        <div className="hidden">
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
        </div>

        {/* Squad Info Card */}
        <GlassCard style={{ padding: "16px" }}>
          <div className="flex items-center gap-3 mb-3">
            <div style={{
              width: "44px", height: "44px", borderRadius: "14px", overflow: "hidden",
              background: squad.imageUrl ? "transparent" : "linear-gradient(135deg, var(--brand), #00B4D8)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {squad.imageUrl ? (
                <img src={squad.imageUrl} alt={squad.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "16px", fontWeight: 800, color: "#000" }}>
                  {getInitials(squad.name)}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-slate-900 dark:text-white m-0">
                {squad.name}
              </h1>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 m-0">
                {memberIds.length} {memberIds.length === 1 ? "member" : "members"}
              </p>
            </div>
          </div>

          <div className={`rounded-2xl p-3 ${squadBalance >= 0 ? "bg-green-500/8 border border-green-500/20" : "bg-red-500/8 border border-red-500/20"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide m-0">
                  Total Squad Balance
                </p>
                <p className={`text-[20px] font-bold mt-0.5 m-0 ${squadBalance >= 0 ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-500"}`}>
                  {squadBalance >= 0 ? "↑" : "↓"} {formatCurrency(Math.abs(squadBalance))}
                </p>
              </div>
              {squadBalance >= 0
                ? <TrendingUp size={20} strokeWidth={2} className="text-green-600" />
                : <TrendingDown size={20} strokeWidth={2} className="text-red-500" />}
            </div>
          </div>
        </GlassCard>

        {/* Players Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">
              Players ({memberIds.length})
            </h2>
            {playerSelectMode && (
              <button
                type="button"
                onClick={() => {
                  haptics.trigger(8);
                  setPlayerSelectMode(false);
                  setSelectedPlayerIds(new Set());
                }}
                className="text-[13px] font-semibold text-slate-500 dark:text-slate-400"
              >
                Cancel
              </button>
            )}
          </div>
          <div className="space-y-2">
            {memberIds.map((pid) => {
              const player = getPlayerById(pid);
              if (!player) return null;
              return (
                <PlayerCard
                  key={pid}
                  player={player}
                  squadId={squad.id}
                  selectMode={playerSelectMode}
                  selected={selectedPlayerIds.has(pid)}
                  onLongPress={() => {
                    setPlayerSelectMode(true);
                    setSelectedPlayerIds(new Set([pid]));
                  }}
                  onSelect={(id) => {
                    setSelectedPlayerIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(id)) next.delete(id);
                      else next.add(id);
                      if (next.size === 0) setPlayerSelectMode(false);
                      return next;
                    });
                  }}
                  onContribute={(p) => {
                    haptics.trigger(8);
                    setContributeAmount("");
                    setContributeError("");
                    setContributeModal({ playerId: p.id, playerName: p.name, playerBalance: p.balance });
                  }}
                />
              );
            })}
          </div>

          {playerSelectMode && selectedPlayerIds.size > 0 && (
            <button
              type="button"
              onClick={() => {
                haptics.trigger(8);
                setShowRemovePlayersConfirm(true);
              }}
              className="w-full mt-3 py-3.5 rounded-2xl bg-red-500 text-white font-bold text-[15px] flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Remove {selectedPlayerIds.size} {selectedPlayerIds.size === 1 ? "Player" : "Players"}
            </button>
          )}
        </div>

        {/* Booking History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">
              Booking History ({squadBookings.length})
            </h2>
            {squadBookings.length > 3 && (
              <button onClick={() => setShowAllBookings(!showAllBookings)}
                className="text-[14px] font-semibold text-green-600 dark:text-green-400 bg-none border-none cursor-pointer">
                {showAllBookings ? "See Few" : "See All"}
              </button>
            )}
          </div>

          {squadBookings.length > 0 ? (
            <div className="space-y-2">
              {displayedBookings.map((booking) => {
                const sport = getSportById(booking.sportId);
                const turf = getTurfById(booking.turfId);
                const numTeams = booking.teams?.length || 1;
                const squadCost = booking.amount / numTeams;

                // Find the team that has members from this squad
                const relevantTeam = booking.teams?.find(team =>
                  team.playerIds?.some(pid => memberIds.includes(pid))
                );

                // Get active players from this squad in this booking
                // FIXED: Handle case where relevantTeam might not be found but players are still in the booking
                let activePlayers = [];

                if (relevantTeam?.playerIds) {
                  // Standard case: team found with playerIds
                  activePlayers = relevantTeam.playerIds
                    .filter(pid => memberIds.includes(pid))
                    .filter(pid => !relevantTeam.excludedPlayerIds?.includes(pid));
                } else if (booking.bookingType === "Team" && booking.teams) {
                  // Fallback: check all teams for squad members
                  const allTeamPlayers = booking.teams.flatMap(team => team.playerIds || []);
                  activePlayers = allTeamPlayers
                    .filter(pid => memberIds.includes(pid))
                    .filter(pid => {
                      // Check if excluded in any team
                      return !booking.teams.some(team =>
                        team.excludedPlayerIds?.includes(pid)
                      );
                    });
                } else if (booking.playerIds) {
                  // Individual booking case: check if any squad members participated
                  activePlayers = booking.playerIds.filter(pid => memberIds.includes(pid));
                }

                const costPerPlayer = activePlayers.length > 0 ? squadCost / activePlayers.length : 0;
                const isExpanded = expandedBookings.has(booking.id);

                return (
                  <GlassCard key={booking.id} style={{ padding: "14px 16px" }}>
                    <div
                      className="flex items-center justify-between gap-3 cursor-pointer"
                      onClick={() => {
                        setExpandedBookings(prev => {
                          const next = new Set(prev);
                          if (next.has(booking.id)) next.delete(booking.id);
                          else next.add(booking.id);
                          return next;
                        });
                      }}
                    >
                      {/* Icon Container (Using Users icon colored Purple for Squad Booking) */}
                      <div style={{
                        width: "38px", height: "38px", borderRadius: "10px",
                        background: "rgba(139,92,246,0.1)", display: "flex",
                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Users size={18} style={{ color: "#8b5cf6" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-900 dark:text-white">
                          Squad Booking • {booking.id}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {turf?.name || "Turf"} • {formatDate(booking.date)}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <p className="text-base font-bold text-red-500">
                            -{formatCurrency(squadCost)}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">÷{numTeams} squads</p>
                        </div>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            color: "var(--text-muted)",
                            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease"
                          }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-dashed border-slate-300 dark:border-slate-700">
                        <div className="space-y-1.5">
                          {activePlayers.length > 0 ? (
                            activePlayers.map((pid) => {
                              const player = getPlayerById(pid);
                              if (!player) return null;
                              return (
                                <div key={pid} className="flex items-center justify-between text-xs">
                                  <span className="text-slate-700 dark:text-slate-300">{player.name}</span>
                                  <span className="text-slate-500 dark:text-slate-400">-{formatCurrency(costPerPlayer)}</span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                              No active players found from this squad in this booking
                            </div>
                          )}
                        </div>
                        <div className="mt-2 pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Cost per player: {formatCurrency(costPerPlayer)} ({activePlayers.length} players)
                          </p>
                        </div>
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            <GlassCard style={{ padding: "32px 24px", textAlign: "center" }}>
              <p className="text-slate-500 dark:text-slate-400 text-sm">No bookings yet with this squad</p>
            </GlassCard>
          )}
        </div>

        {/* Payment History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">
              Payment History ({paymentHistory.length})
            </h2>
            {paymentHistory.length > 4 && (
              <button onClick={() => setShowAllPayments(!showAllPayments)}
                className="text-sm font-semibold text-green-600 dark:text-green-400">
                {showAllPayments ? "See Few" : "See All"}
              </button>
            )}
          </div>

          {paymentHistory.length > 0 ? (
            <div className="space-y-2">
              {displayedPayments.map((item) => (
                <GlassCard key={item.id} style={{ padding: "14px 16px" }}>
                  <div className="flex items-center justify-between gap-3">
                    {/* Icon Container (Using Users icon matching target layout) */}
                    <div style={{
                      width: "38px", height: "38px", borderRadius: "10px",
                      background: "rgba(16,185,129,0.1)", display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Users size={18} style={{ color: "#10b981" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white">
                        {item.playerName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Contributed to squad • {formatDate(item.date)}
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                      <p className="text-base font-bold text-green-600 dark:text-green-400">
                        +{formatCurrency(item.amount)}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          haptics.trigger(8);
                          setEditPaymentAmount(String(item.amount));
                          setEditPaymentError("");
                          setEditPaymentModal({
                            contributionId: item.id,
                            playerId: item.playerId,
                            playerName: item.playerName,
                            currentAmount: item.amount,
                          });
                        }}
                        style={{ fontSize: "11px", fontWeight: 700, color: "var(--brand)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard style={{ padding: "32px 24px", textAlign: "center" }}>
              <p className="text-slate-500 dark:text-slate-400 text-sm">No payments yet from squad members</p>
            </GlassCard>
          )}
        </div>

      </div>

      {/* Contribute Modal */}
      {contributeModal && (
        <div
          className="fixed inset-0 z-99999 flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}
          onClick={() => setContributeModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0f172a] p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white">
                Contribute to {squad.name}
              </h2>
              <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-1 font-normal">
                {contributeModal.playerName} · Personal balance:{" "}
                <span className={contributeModal.playerBalance >= 0 ? "text-green-600" : "text-red-500"}>
                  {formatCurrency(contributeModal.playerBalance)}
                </span>
              </p>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "var(--bg-card)", border: "1.5px solid var(--bg-border)",
              borderRadius: "12px", padding: "0 14px", height: "52px",
            }}>
              <span className="text-slate-500 font-semibold">₹</span>
              <input
                type="number"
                value={contributeAmount}
                onChange={(e) => { setContributeAmount(e.target.value); setContributeError(""); }}
                placeholder="Enter amount to contribute"
                style={{ flex: 1, background: "transparent", outline: "none", fontSize: "16px", color: "var(--text-primary)", border: "none" }}
              />
            </div>
            {contributeError && <p className="text-sm text-red-500 font-medium">{contributeError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setContributeModal(null)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-semibold text-sm">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const result = contributeToSquad(squad.id, contributeModal.playerId, Number(contributeAmount));
                  if (!result.ok) { setContributeError(result.error); return; }
                  haptics.trigger([10, 30, 10]);
                  setContributeModal(null);
                  setContributeAmount("");
                }}
                className="px-4 py-2.5 rounded-2xl bg-green-600 text-white font-semibold text-sm"
              >
                Contribute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Modal (Converted to centered pop-up with custom Portal) */}
      {editPaymentModal && createPortal(
        <div
          className="fixed inset-0 z-99999 flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}
          onClick={() => setEditPaymentModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0f172a] p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white">
                Edit Contribution
              </h2>
              <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-1 font-normal">
                From <span className="font-semibold">{editPaymentModal.playerName}</span> · Currently{" "}
                <span className="text-green-600 font-semibold">
                  {formatCurrency(editPaymentModal.currentAmount)}
                </span>
              </p>
            </div>

            {/* Input Box Container (Adjusted styles for absolute dark-theme visibility) */}
            <div className="flex items-center gap-2 rounded-xl px-3.5 h-[52px] bg-black/4 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <span className="text-slate-500 font-semibold">₹</span>
              <input
                type="number"
                value={editPaymentAmount}
                onChange={(e) => { setEditPaymentAmount(e.target.value); setEditPaymentError(""); }}
                placeholder="Enter new amount"
                style={{ flex: 1, background: "transparent", outline: "none", fontSize: "16px", border: "none" }}
                className="text-slate-900 dark:text-white"
              />
            </div>

            {editPaymentError && (
              <p className="text-sm text-red-500 font-medium">{editPaymentError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditPaymentModal(null)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const parsed = Number(editPaymentAmount);
                  if (isNaN(parsed) || parsed < 0) {
                    setEditPaymentError("Enter a valid amount");
                    return;
                  }
                  const delta = parsed - editPaymentModal.currentAmount;
                  if (delta !== 0) {
                    // 1. Find the target contribution inside the squad first to get its exact date
                    const contributionObj = (squad.contributions || []).find(
                      (c) => c.id === editPaymentModal.contributionId
                    );

                    if (contributionObj) {
                      // 2. Update the contribution entry inside the squad
                      const updatedContributions = (squad.contributions || []).map((c) =>
                        c.id === editPaymentModal.contributionId ? { ...c, amount: parsed } : c
                      );
                      updateSquad(squad.id, { contributions: updatedContributions });

                      // 3. Update the matching item in the player's personal transaction history & wallet balance
                      const playerObj = getPlayerById(editPaymentModal.playerId);
                      if (playerObj) {
                        const updatedHistory = (playerObj.history || []).map((h) => {
                          const matchesOldAmount = h.amount === editPaymentModal.currentAmount;
                          
                          // Compare strictly first, fall back to calendar-day comparison to handle different ISO formats
                          const matchesDate = h.date === contributionObj.date || 
                            h.createdAt === contributionObj.createdAt ||
                            (h.date && contributionObj.date && new Date(h.date).toDateString() === new Date(contributionObj.date).toDateString());
                          
                          if (matchesOldAmount && matchesDate) {
                            return { ...h, amount: parsed }; // Sync with the new edited amount
                          }
                          return h;
                        });

                        updatePlayer(playerObj.id, {
                          balance: playerObj.balance - delta,
                          history: updatedHistory,
                        });
                      }
                    }
                  }
                  haptics.trigger([10, 30, 10]);
                  setEditPaymentModal(null);
                  setEditPaymentAmount("");
                }}
                className="flex-1 py-2.5 rounded-2xl bg-green-600 text-white font-semibold text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Remove Players Confirmation */}
      <ConfirmDialog
        open={showRemovePlayersConfirm}
        title={`Remove ${selectedPlayerIds.size} ${selectedPlayerIds.size === 1 ? "Player" : "Players"}?`}
        message={<>They will be removed from <b>{squad.name}</b>. This won't affect their personal balance or booking history.</>}
        confirmLabel="Remove"
        onConfirm={() => {
          const newMemberIds = memberIds.filter((pid) => !selectedPlayerIds.has(pid));
          updateSquad(squad.id, { memberPlayerIds: newMemberIds });
          setShowRemovePlayersConfirm(false);
          setPlayerSelectMode(false);
          setSelectedPlayerIds(new Set());
        }}
        onCancel={() => setShowRemovePlayersConfirm(false)}
      />

      {/* Delete Confirmation */}
      < ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Squad"
        message={<>This will permanently delete <b>{squad.name}</b>. Members won't be affected.</>}
        confirmLabel="Delete Squad"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </MobileLayout>
  );
}