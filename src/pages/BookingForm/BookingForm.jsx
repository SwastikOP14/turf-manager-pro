import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Check, Search, Trash2, X, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import MobileLayout from "../../components/layout/MobileLayout";
import GlassCard from "../../components/common/GlassCard";
import SectionTitle from "../../components/common/SectionTitle";
import InputField from "../../components/common/InputField";
import DropdownField from "../../components/common/DropdownField";
import DatePickerField from "../../components/common/DatePickerField";
import TimePickerField from "../../components/common/TimePickerField";
import SegmentedControl from "../../components/common/SegmentedControl";
import PrimaryButton from "../../components/common/PrimaryButton";
import AddTurfModal from "../../components/turf/AddTurfModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import TeamManager from "../../components/booking/TeamManager";
import TeamCostDisplay from "../../components/booking/TeamCostDisplay";
import AddPlayerModal from "../../components/booking/AddPlayerModal";
import PlayerAvatar from "../../components/common/PlayerAvatar";
import { useApp } from "../../context/useApp";
import { useHaptics } from "../../context/HapticsContext";
import { useModalBackHandler } from "../../hooks/useModalBackHandler";
import {
  toDateKey,
  timeTo24,
  timeFrom24,
  formatCurrency,
} from "../../utils/format";
import { formatPhoneDisplay } from "../../utils/phone";
import { searchPlayers } from "../../utils/players";
import { calculateTeamWiseSplit } from "../../utils/costSplit";
import { getInitials } from "../../utils/initials";

const AVATAR_COLORS = [
  { bg: "#DBEAFE", text: "#2563EB" },
  { bg: "#D1FAE5", text: "#059669" },
  { bg: "#EDE9FE", text: "#7C3AED" },
  { bg: "#FEF3C7", text: "#D97706" },
  { bg: "#FCE7F3", text: "#DB2777" },
];


function getAvatarColor(seed) {
  const hash = String(seed)
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function SquadAvatar({ squad, size = 36 }) {
  if (squad?.imageUrl) {
    return (
      <img
        src={squad.imageUrl}
        alt={squad.name}
        style={{
          width: size, height: size, borderRadius: "50%",
          objectFit: "cover", flexShrink: 0,
        }}
      />
    );
  }
  const color = getAvatarColor(squad?.id || squad?.name || "?");
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: color.bg, color: color.text,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
      }}
    >
      {getInitials(squad?.name)}
    </div>
  );
}

function ModalBlurWrapper({ onClose, children }) {
  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  useModalBackHandler(onClose);

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.25rem",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "22rem",
          maxHeight: "85vh",
          overflowY: "auto",
          borderRadius: "1.5rem",
          padding: "1.25rem",
          boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        }}
        className="bg-white dark:bg-[#111827] border border-black/10 dark:border-white/10"
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export default function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const haptics = useHaptics();
  const isEdit = Boolean(id);

  const {
    bookings,
    players,
    turfs,
    sports,
    squads,
    addBooking,
    updateBooking,
    deleteBooking,
    addTurf,
    getPlayerById,
  } = useApp();

  const existing = bookings.find((b) => b.id === id);
  const start = timeFrom24(existing?.startTime);
  const end = timeFrom24(existing?.endTime);

  const [sportId, setSportId] = useState(existing?.sportId || "");
  const [turfId, setTurfId] = useState(existing?.turfId || "");
  const [date, setDate] = useState(
    existing?.date ? new Date(existing.date) : null,
  );
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [status, setStatus] = useState(existing?.status || "Paid");
  const [paidAmount, setPaidAmount] = useState(
    existing ? String(existing.paidAmount || 0) : "",
  );
  const [paidByPlayerId, setPaidByPlayerId] = useState(
    existing?.paidByPlayerId || "",
  );
  const [playerIds, setPlayerIds] = useState(existing?.playerIds || []);

  // Team booking states
  const [bookingType, setBookingType] = useState(
    existing?.bookingType || (existing?.teams?.length ? "Team" : "Individual"),
  );
  const [teams, setTeams] = useState(existing?.teams || []);
  const [squadId, setSquadId] = useState(existing?.squadId || "");
  const [squadPickerOpen, setSquadPickerOpen] = useState(false);

  const [turfModalOpen, setTurfModalOpen] = useState(false);
  const [paidByModalOpen, setPaidByModalOpen] = useState(false);
  const [playersModalOpen, setPlayersModalOpen] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [playerQuery, setPlayerQuery] = useState("");
  const [paidByQuery, setPaidByQuery] = useState("");
  const [error, setError] = useState("");
  const [lowBalanceConfirm, setLowBalanceConfirm] = useState(null); // { squadName, deficit }
  const [expandedSquadCards, setExpandedSquadCards] = useState(new Set());
  const [localPlayers, setLocalPlayers] = useState(players);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [startHour, setStartHour] = useState(start.hour);
  const [startMinute, setStartMinute] = useState(start.minute);
  const [startPeriod, setStartPeriod] = useState(start.period);
  const [endHour, setEndHour] = useState(end.hour);
  const [endMinute, setEndMinute] = useState(end.minute);
  const [endPeriod, setEndPeriod] = useState(end.period);
  const [durationHours, setDurationHours] = useState(() => {
    if (!existing?.startTime || !existing?.endTime) return null
    const [sh, sm] = existing.startTime.split(":").map(Number)
    const [eh, em] = existing.endTime.split(":").map(Number)
    let diff = (eh * 60 + em) - (sh * 60 + sm)
    if (diff < 0) diff += 24 * 60 // handle overnight wrap
    return diff / 60
  });

  const remaining = Math.max(0, Number(amount || 0) - Number(paidAmount || 0));

  // Calculate split costs based on mode
  const splitCosts = useMemo(() => {
    if (bookingType === "Individual") return {};

    return calculateTeamWiseSplit(
      Number(amount || 0),
      teams
    );
  }, [bookingType, teams, amount]);

  const perPersonShare = useMemo(() => {
    if (bookingType === "Individual") {
      if (!amount || !playerIds.length) return 0;
      return Number(amount) / playerIds.length;
    } else {
      if (!amount || teams.length === 0) return 0;
      return splitCosts[teams[0]?.id]?.playerCost || 0;
    }
  }, [amount, playerIds, teams, splitCosts, bookingType]);

  const filteredPlayers = useMemo(
    () => searchPlayers(localPlayers, playerQuery),
    [localPlayers, playerQuery],
  );

  const filteredPaidBy = useMemo(
    () => searchPlayers(localPlayers, paidByQuery),
    [localPlayers, paidByQuery],
  );

  const sportOptions = sports.map((s) => ({ value: s.id, label: s.name }));

  const turfOptions = [
    ...turfs.map((t) => ({ value: t.id, label: t.name })),
    { value: "__add_new__", label: "+ Add New Turf/Ground" },
  ];

  const handleTurfChange = (e) => {
    if (e.target.value === "__add_new__") {
      setTurfModalOpen(true);
      return;
    }
    setTurfId(e.target.value);
  };

  const togglePlayer = (pid) => {
    setPlayerIds((prev) =>
      prev.includes(pid) ? prev.filter((p) => p !== pid) : [...prev, pid],
    );
  };

  const handleBookingTypeChange = (type) => {
    // Just switch the view — don't clear teams or playerIds.
    // Both states are preserved in memory so toggling back restores everything.
    setBookingType(type);
  };

  const togglePlayerInTeam = (teamId, playerId) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        const currentExcluded = t.excludedPlayerIds || [];
        const isExcluded = currentExcluded.includes(playerId);
        return {
          ...t,
          excludedPlayerIds: isExcluded
            ? currentExcluded.filter((id) => id !== playerId)
            : [...currentExcluded, playerId],
        };
      })
    );
  };

  const handlePlayerAdded = (newPlayer) => {
    setLocalPlayers((prev) => [...prev, newPlayer]);
  };

  const handleSave = () => {
    haptics.trigger(30);
    // Validate sport
    if (!sportId || sportId === "") {
      setError("Please select sport/game");
      return;
    }
    // Validate turf
    if (!turfId || turfId === "") {
      setError("Please select turf/ground");
      return;
    }
    // Validate date
    if (!date) {
      setError("Please select a booking date");
      return;
    }
    // Validate amount
    if (!amount || amount === "0" || amount === "") {
      setError("Please enter total amount");
      return;
    }
    // Validate time
    if (!startHour || !startMinute) {
      setError("Please select a start time");
      return;
    }
    if (!durationHours) {
      setError("Please select a duration");
      return;
    }

    // Validate start < end time
    const startMinutes = timeTo24(startHour, startMinute, startPeriod)
    const endMinutes = timeTo24(endHour, endMinute, endPeriod)
    const startMins = parseInt(startMinutes.split(":")[0]) * 60 + parseInt(startMinutes.split(":")[1])
    const endMins = parseInt(endMinutes.split(":")[0]) * 60 + parseInt(endMinutes.split(":")[1])
    if (endMins <= startMins) {
      setError("End time must be after start time");
      return;
    }

    // Validate paid by
    if (!paidByPlayerId || paidByPlayerId === "") {
      setError("Please select who paid the turf owner");
      return;
    }

    // Validate players/teams
    if (bookingType === "Individual") {
      if (!playerIds || playerIds.length === 0) {
        setError("Please add at least one player");
        return;
      }
    } else {
      if (!teams || teams.length === 0) {
        setError("Please add at least one squad");
        return;
      }
      if (teams.some((t) => !t.playerIds || t.playerIds.length === 0)) {
        setError("All squads must have at least one player");
        return;
      }
    }
    if (status === "Partial" && (!paidAmount || paidAmount === "0")) {
      setError("Please enter paid amount for partial payment");
      return;
    }

    // Check squad balances before saving (Team bookings only)
    if (bookingType === "Team") {
      const numSquads = teams.length;
      const costPerSquad = numSquads > 0 ? Number(amount) / numSquads : 0;

      for (const team of teams) {
        const squad = squads.find((s) => s.id === team.squadId);
        const squadBalance = (squad?.contributions || []).reduce(
          (sum, c) => sum + (c.amount || 0), 0
        );

        // If editing, add back the previous deduction for this squad before comparing
        let effectiveBalance = squadBalance;
        if (isEdit && existing?.bookingType === "Team") {
          const prevTeam = existing.teams?.find((t) => t.squadId === team.squadId);
          if (prevTeam) {
            const prevCostPerSquad = existing.squadSplitCost ?? 0;
            effectiveBalance += prevCostPerSquad;
          }
        }

        if (effectiveBalance < costPerSquad) {
          setLowBalanceConfirm({
            squadName: team.name,
            deficit: costPerSquad - effectiveBalance,
          });
          return;
        }
      }
    }

    saveBooking();
  };

  const saveBooking = () => {
    const payload = {
      sportId,
      turfId,
      date: toDateKey(date),
      startTime: timeTo24(startHour, startMinute, startPeriod),
      endTime: timeTo24(endHour, endMinute, endPeriod),
      amount: Number(amount),
      durationHours: durationHours || null,
      status,
      paidAmount:
        status === "Partial"
          ? Number(paidAmount)
          : status === "Paid"
            ? Number(amount)
            : 0,
      paidByPlayerId,
      bookingType,
      ...(bookingType === "Individual"
        ? { playerIds }
        : { teams, squadId: squadId || null }),
    };

    if (isEdit) updateBooking(id, payload);
    else addBooking(payload);
    navigate("/");
  };

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    haptics.trigger([10, 50, 10]);
    deleteBooking(id);
    navigate("/");
  };

  return (
    <MobileLayout hideFab>
      <div className="pt-3 px-4 pb-24 space-y-3 animate-fade-in-up">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 dark:text-white leading-tight">
              {isEdit ? "Edit Booking" : "Add Booking"}
            </h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isEdit ? "Update booking details" : "Schedule a new session"}
            </p>
          </div>

          {isEdit && (
            <button
              onClick={handleDelete}
              className="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center hover:bg-red-500/25 transition-all duration-200"
              title="Delete booking"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {/* ── Booking Details ──────────────────────────────── */}
        <GlassCard className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400 mb-2">Booking Details</p>
          <DropdownField
            label="Sport / Game"
            value={sportId}
            onChange={(e) => setSportId(e.target.value)}
            options={sportOptions}
            placeholder="Select sport"
          />

          <DropdownField
            label="Turf / Ground"
            value={turfId}
            onChange={handleTurfChange}
            options={turfOptions}
            placeholder="Select turf"
          />

          <DatePickerField
            label="Date"
            selected={date}
            onChange={(v) => {
              setDate(v);
              setError("");
            }}
          />

          <TimePickerField
            label="Time"
            startHour={startHour}
            startMinute={startMinute}
            startPeriod={startPeriod}
            onStartHourChange={setStartHour}
            onStartMinuteChange={setStartMinute}
            onStartPeriodChange={setStartPeriod}
            endHour={endHour}
            endMinute={endMinute}
            endPeriod={endPeriod}
            onEndHourChange={setEndHour}
            onEndMinuteChange={setEndMinute}
            onEndPeriodChange={setEndPeriod}
            durationHours={durationHours}
            onDurationChange={setDurationHours}
          />
        </GlassCard>

        {/* ── Payment Summary ──────────────────────────────── */}
        <GlassCard className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400 mb-2">Payment Summary</p>
          <InputField
            label="Total Amount"
            prefix="₹"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            rightElement={<Pencil size={16} className="text-green-500" />}
          />
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Payment Status
            </label>
            <SegmentedControl
              options={["Paid", "Partial", "Pending"]}
              value={status}
              onChange={setStatus}
            />
          </div>

          {status === "Partial" && (
            <>
              <InputField
                label="Amount Paid Till Now"
                prefix="₹"
                value={paidAmount}
                onChange={(e) =>
                  setPaidAmount(e.target.value.replace(/\D/g, ""))
                }
              />
              <div className="rounded-2xl p-4 bg-linear-to-r from-green-50 to-orange-50 dark:from-green-950/20 dark:to-orange-950/20 border border-green-200 dark:border-green-800">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">{formatCurrency(amount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Paid</p>
                    <p className="text-lg font-semibold text-green-700 dark:text-green-400 mt-1">{formatCurrency(paidAmount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Remaining</p>
                    <p className="text-lg font-semibold text-orange-600 dark:text-orange-400 mt-1">{formatCurrency(remaining)}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Payment Progress</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {amount > 0 ? Math.round((Number(paidAmount || 0) / Number(amount)) * 100) : 0}%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-linear-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: amount > 0 ? `${Math.min(100, (Number(paidAmount || 0) / Number(amount)) * 100)}%` : '0%'
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </GlassCard>

        {/* ── Paid By ──────────────────────────────────────── */}
        <GlassCard className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400 mb-2">Paid By</p>          <p className="text-xs text-slate-500 dark:text-gray-400 -mt-1">
            Who paid the turf owner?
          </p>


          {paidByPlayerId ? (
            <div className="p-3 rounded-xl bg-green-500/8 border border-green-500/20 flex items-center gap-3">
              <PlayerAvatar player={getPlayerById(paidByPlayerId)} size={40} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Paid by:{" "}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {getPlayerById(paidByPlayerId)?.name}
                  </span>
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  {existing?.paidBy ? "Imported Data" : `Balance: ${formatCurrency(getPlayerById(paidByPlayerId)?.balance ?? 0)}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaidByModalOpen(true)}
                className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold text-sm shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Change
              </button>
            </div>
          ) : (
            <>
              {existing?.paidBy && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                    ℹ️ Imported Data
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Paid by: <span className="font-semibold">{existing.paidBy}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Select a player from your list to link this booking
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setPaidByModalOpen(true)}
                className="premium-input w-full flex items-center justify-between gap-2 px-4 py-3 cursor-pointer text-left"
              >
                <span className="text-slate-400 dark:text-slate-500">
                  Select player
                </span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
            </>
          )}
        </GlassCard>


        {/* ── Booking Type ─────────────────────────────────── */}
        <GlassCard className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400 mb-2">Booking Type</p>          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "Individual", label: "Individual" },
              { value: "Team", label: "Squad" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleBookingTypeChange(opt.value)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${bookingType === opt.value
                  ? "bg-green-500 text-black"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            {bookingType === "Individual"
              ? "Select individual players who participated"
              : "Pick a squad or organize players into teams"}
          </p>
        </GlassCard>

        {/* ── Individual Players ────────────────────────────– */}
        {bookingType === "Individual" && (
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400">Player List ({playerIds.length})</p>
              <button
                type="button"
                onClick={() => setPlayersModalOpen(true)}
                className="text-xs font-bold text-green-600 dark:text-green-400"
              >
                + Add Player
              </button>
            </div>
            {playerIds.length > 0 && (
              <div className="divide-y divide-black/5 dark:divide-white/10">
                {playerIds.map((pid) => {
                  const p = getPlayerById(pid);
                  if (!p) return null;
                  return (
                    <div
                      key={pid}
                      className="flex items-center gap-3 py-3"
                    >
                      <PlayerAvatar player={p} />
                      <p className="flex-1 text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {p.name}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setPlayerIds((prev) =>
                            prev.filter((id) => id !== pid),
                          )
                        }
                        className="text-sm font-semibold text-red-500 shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Show imported player data as info */}
            {playerIds.length === 0 && existing?.playerList && existing?.nosOfPlayers > 0 && (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                  ℹ️ Imported Booking Data
                </p>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {existing.nosOfPlayers} players participated:
                  </p>
                  <div className="flex flex-col gap-1 mt-1">
                    {existing.playerList.split(",").map((name, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-green-500/15 flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-400 shrink-0">
                          {name.trim().charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{name.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-blue-500/20 pt-2 mt-2">
                  💡 This booking was imported from Excel. Add players from your list to calculate splits and update balances.
                </p>
              </div>
            )}

            {playerIds.length === 0 && !existing?.playerList && (
              <p className="text-sm text-slate-500 dark:text-gray-400 italic text-center py-4">
                No players selected yet
              </p>
            )}
            {playerIds.length > 0 && (
              <div className="pt-3 border-t border-dashed border-black/10 dark:border-white/10">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400 mb-2">
                  Cost Breakdown
                </p>
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/8 border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-green-500/15 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Total Players</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{playerIds.length}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 mt-1">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Cost per Person</span>
                  <span className="text-base font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(perPersonShare)}
                  </span>
                </div>
              </div>
            )}
          </GlassCard>
        )}
        {/* ── Team Booking ──────────────────────────────– */}
        {bookingType === "Team" && (
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400 mb-2">{`Squads (${teams.length})`}</p>
              <button
                type="button"
                onClick={() => setSquadPickerOpen(true)}
                className="text-sm font-semibold text-green-600 dark:text-green-400 cursor-pointer"
              >
                + Add Squad
              </button>
            </div>
            <div className="space-y-3">
              {teams.map((team) => {
                const squad = squads.find((s) => s.id === team.squadId);

                const squadBalance = (squad?.contributions || []).reduce(
                  (sum, c) => sum + (c.amount || 0), 0
                );

                const excludedIds = team.excludedPlayerIds || [];
                const activeCount = (team.playerIds || []).filter(pid => !excludedIds.includes(pid)).length;

                return (
                  <div
                    key={team.id}
                    className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4 space-y-3"
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => {
                        setExpandedSquadCards((prev) => {
                          const next = new Set(prev);
                          if (next.has(team.id)) next.delete(team.id);
                          else next.add(team.id);
                          return next;
                        });
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`transition-transform duration-200 ${expandedSquadCards.has(team.id) ? "rotate-180" : ""}`}>
                          <ChevronDown size={14} className="text-green-500" />
                        </div>
                        <SquadAvatar squad={squad} size={36} />
                        <div>
                          <h3 className="font-semibold text-sm text-slate-900 dark:text-white leading-tight truncate max-w-[100px]">
                            {team.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-gray-400">
                            {activeCount} of {team.playerIds?.length || 0} playing
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-[10px] uppercase text-slate-500 dark:text-gray-400">Squad Balance</p>
                          <p className={`text-base font-bold ${squadBalance >= 0 ? "text-green-600" : "text-red-500"}`}>
                            {formatCurrency(squadBalance)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTeams((prev) => prev.filter((t) => t.id !== team.id));
                          }}
                          className="w-7 h-7 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center hover:bg-red-500/25 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {expandedSquadCards.has(team.id) && (
                      <div className="space-y-1.5 pt-1 border-t border-green-500/10">
                        {(team.playerIds || []).map((pid) => {
                          const p = getPlayerById(pid);
                          if (!p) return null;
                          const isExcluded = excludedIds.includes(pid);
                          return (
                            <div
                              key={pid}
                              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg ${isExcluded ? "opacity-40" : ""}`}
                            >
                              <PlayerAvatar player={p} size={28} />
                              <div className="flex-1 min-w-0">
                                <span className={`text-xs font-medium block ${isExcluded ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200"}`}>
                                  {p.name}
                                </span>
                                <span className={`text-[11px] font-semibold ${p.balance >= 0 ? "text-green-600" : "text-red-500"}`}>
                                  {formatCurrency(p.balance)}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => togglePlayerInTeam(team.id, pid)}
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${isExcluded
                                  ? "bg-green-500/15 text-green-600"
                                  : "bg-red-500/15 text-red-500"
                                  }`}
                              >
                                {isExcluded ? "Add back" : "Remove"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {teams.length > 0 && amount && Number(amount) > 0 && (
              <div className="pt-3 border-t border-dashed border-black/10 dark:border-white/10">
                <TeamCostDisplay
                  teams={teams}
                  allPlayers={localPlayers}
                  splitCosts={splitCosts}
                  getPlayerById={getPlayerById}
                  onTogglePlayer={togglePlayerInTeam}
                  embedded
                />
              </div>
            )}
          </GlassCard>
        )}

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <div className="space-y-3">
          <PrimaryButton
            text={isEdit ? "Update Booking" : "Create Booking"}
            onClick={handleSave}
          />
        </div>
      </div>

      <AddTurfModal
        open={turfModalOpen}
        onClose={() => setTurfModalOpen(false)}
        onSave={(form) => {
          const turf = addTurf(form);
          setTurfId(turf.id);
        }}
      />

      {/* ── Paid By Modal ──────────────────────────────– */}
      {paidByModalOpen && (
        <ModalBlurWrapper onClose={() => setPaidByModalOpen(false)}>
          <div className="flex items-center gap-2 mb-4">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-500"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Paid By
            </h2>
          </div>

          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={paidByQuery}
              onChange={(e) => setPaidByQuery(e.target.value)}
              placeholder="Search player..."
              className="premium-input py-3 text-sm"
              style={{ paddingLeft: "2.25rem" }}
            />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-hide">
            {filteredPaidBy.map((player) => {
              const selected = paidByPlayerId === player.id;
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => {
                    setPaidByPlayerId(player.id);
                    setPaidByModalOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-2xl p-3 border transition-all cursor-pointer text-left
                    ${selected ? "bg-green-500/15 border-green-500/50" : "bg-slate-100 dark:bg-white/5 border-black/5 dark:border-white/10 hover:border-green-500/30"}`}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm ${selected ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-white"}`}
                    >
                      {player.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-slate-500 dark:text-gray-400">
                        {formatPhoneDisplay(player.phone)}
                      </p>
                      <span className="text-xs">•</span>
                      <p
                        className={`text-xs font-semibold ${player.balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
                      >
                        {formatCurrency(player.balance)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                    ${selected ? "bg-green-500 border-green-500" : "border-slate-300 dark:border-white/30"}`}
                  >
                    {selected && <Check size={11} className="text-white" />}
                  </div>
                </button>
              );
            })}
            {filteredPaidBy.length === 0 && (
              <p className="text-sm text-center text-slate-400 py-4">
                No players found
              </p>
            )}
          </div>
        </ModalBlurWrapper>
      )}

      {/* ── Total Players Modal ────────────────────────────– */}
      {playersModalOpen && (
        <ModalBlurWrapper onClose={() => setPlayersModalOpen(false)}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Select Players
              </h2>
            </div>
            <span className="text-sm text-slate-500 dark:text-gray-400">
              {playerIds.length} selected
            </span>
          </div>

          <div className="flex gap-2 my-3">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={playerQuery}
                onChange={(e) => setPlayerQuery(e.target.value)}
                placeholder="Search..."
                className="premium-input py-3 text-sm w-full"
                style={{ paddingLeft: "2.25rem" }}
              />
            </div>
            <button
              onClick={() => setShowAddPlayerModal(true)}
              className="px-3 py-3 rounded-2xl bg-green-500/20 border border-green-500/40 text-green-700 dark:text-green-400 hover:bg-green-500/35 transition-colors font-semibold text-sm shrink-0"
            >
              + Add
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide mb-4">
            {filteredPlayers.map((player) => {
              const checked = playerIds.includes(player.id);
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => togglePlayer(player.id)}
                  className={`w-full flex items-center justify-between rounded-2xl p-3 border transition-all cursor-pointer text-left
                    ${checked ? "bg-green-500/15 border-green-500/50" : "bg-slate-100 dark:bg-white/5 border-black/5 dark:border-white/10 hover:border-green-500/30"}`}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm ${checked ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-white"}`}
                    >
                      {player.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-slate-500 dark:text-gray-400">
                        {formatPhoneDisplay(player.phone)}
                      </p>
                      <span className="text-xs text-slate-400">•</span>
                      <p
                        className={`text-xs font-semibold ${player.balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
                      >
                        {formatCurrency(player.balance)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all
                    ${checked ? "bg-green-500 border-green-500" : "border-slate-300 dark:border-white/30"}`}
                  >
                    {checked && <Check size={11} className="text-white" />}
                  </div>
                </button>
              );
            })}
            {filteredPlayers.length === 0 && (
              <p className="text-sm text-center text-slate-400 py-4">
                No players found
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setPlayersModalOpen(false);
              setPlayerQuery("");
            }}
            className="w-full py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 text-black font-bold text-[15px] cursor-pointer transition-colors"
          >
            {playerIds.length > 0
              ? `Done (${playerIds.length})  •  ${formatCurrency(perPersonShare)} / person`
              : "Done"}
          </button>
        </ModalBlurWrapper>
      )}

      {/* ── Squad Picker Modal ─────────────────────────────– */}
      {squadPickerOpen && (
        <ModalBlurWrapper onClose={() => setSquadPickerOpen(false)}>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
            Select a Squad
          </h2>
          <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-hide">
            {squads.map((squad) => (
              <button
                key={squad.id}
                type="button"
                onClick={() => {
                  const alreadyAdded = teams.some(
                    (t) => t.squadId === squad.id,
                  );

                  if (alreadyAdded) return;
                  const newTeam = {
                    id: `team_${Date.now()}`,
                    name: squad.name,
                    playerIds: squad.memberPlayerIds,
                    squadId: squad.id,
                  };
                  setTeams((prev) => [...prev, newTeam]);
                  setSquadId(squad.id);
                  setSquadPickerOpen(false);
                }}
                className="w-full flex items-center gap-3 rounded-2xl p-3 border border-black/5 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:border-green-500/30 transition-all cursor-pointer text-left"
              >
                <SquadAvatar squad={squad} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">
                    {squad.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                    {squad.memberPlayerIds.length}{" "}
                    {squad.memberPlayerIds.length === 1 ? "member" : "members"}
                  </p>
                </div>
              </button>
            ))}
            {squads.length === 0 && (
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No squads created yet
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Go to the Players screen and switch to the "Squads" tab to create a squad first.
                </p>
                <button
                  type="button"
                  onClick={() => setSquadPickerOpen(false)}
                  className="mt-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </ModalBlurWrapper>
      )}

      {/* ── Add Player Modal ──────────────────────────────– */}
      {showAddPlayerModal && (
        <AddPlayerModal
          onClose={() => setShowAddPlayerModal(false)}
          onPlayerAdded={handlePlayerAdded}
        />
      )}

      {/* ── Low Squad Balance Confirmation ─────────────────────────── */}
      {lowBalanceConfirm && (
        <ModalBlurWrapper onClose={() => setLowBalanceConfirm(null)}>
          <h2 className="text-lg font-bold text-red-500 mb-2">
            Squad Balance Low
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            <strong>{lowBalanceConfirm.squadName}</strong> is short by{" "}
            <span className="text-red-500 font-semibold">
              {formatCurrency(lowBalanceConfirm.deficit)}
            </span>
            . Please add/update positive balance, or continue and the squad
            balance will go negative.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setLowBalanceConfirm(null)}
              className="flex-1 py-3.5 rounded-2xl border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold text-[15px]"
            >
              Cancel Booking
            </button>
            <button
              type="button"
              onClick={() => {
                setLowBalanceConfirm(null);
                saveBooking();
              }}
              className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-bold text-[15px]"
            >
              Continue Booking
            </button>
          </div>
        </ModalBlurWrapper>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Booking"
        message="Are you sure you want to delete this booking? This action cannot be undone."
        confirmLabel="Delete Booking"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </MobileLayout>
  );
}