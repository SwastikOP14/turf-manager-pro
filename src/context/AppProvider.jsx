import { useEffect, useState } from "react"

import { AppContext } from "./AppContextInstance"
import { loadAppData, saveAppData } from "./storage"
import { createId, createBookingId } from "../utils/id"
import { normalizePhone, isValidIndianPhone } from "../utils/phone"
import { isDuplicateName, isDuplicatePhone } from "../utils/players"
import { createEmptyPlayer } from "./initialData"
import { applySharesToPlayers, applySquadShares, applySquadPlayerHistory } from "../utils/bookingShares"

export function AppProvider({ children }) {
  const [data, setData] = useState(() => loadAppData())

  useEffect(() => {
    saveAppData(data)
  }, [data])

  const players = data.players
  const turfs = data.turfs
  const sports = data.sports
  const bookings = data.bookings
  const squads = data.squads || []
  const settings = data.settings

  const getPlayerById = (id) => players.find((p) => p.id === id)
  const getTurfById = (id) => turfs.find((t) => t.id === id)
  const getSportById = (id) => sports.find((s) => s.id === id)
  const getSquadById = (id) => squads.find((sq) => sq.id === id)

  const addPlayer = (player) => {
    const name = player.name?.trim()
    const phone = normalizePhone(player.phone)

    if (!name) {
      return { ok: false, error: "Player name is required" }
    }

    if (!isValidIndianPhone(phone)) {
      return { ok: false, error: "Enter a valid 10-digit Indian mobile number" }
    }

    if (isDuplicateName(players, name)) {
      return { ok: false, error: "Player with this name already exists" }
    }

    if (isDuplicatePhone(players, phone)) {
      return { ok: false, error: "Player with this mobile number already exists" }
    }

    const entry = {
      ...createEmptyPlayer(),
      ...player,
      id: createId("p"),
      name,
      phone
    }

    setData((prev) => ({
      ...prev,
      players: [...prev.players, entry]
    }))

    return { ok: true, player: entry }
  }

  const updatePlayer = (id, updates) => {
    const name = updates.name?.trim()
    const phone = normalizePhone(updates.phone)

    if (name && isDuplicateName(players, name, id)) {
      return { ok: false, error: "Player with this name already exists" }
    }

    if (phone && !isValidIndianPhone(phone)) {
      return { ok: false, error: "Enter a valid 10-digit Indian mobile number" }
    }

    if (phone && isDuplicatePhone(players, phone, id)) {
      return { ok: false, error: "Player with this mobile number already exists" }
    }

    setData((prev) => ({
      ...prev,
      players: prev.players.map((player) =>
        player.id === id
          ? {
            ...player,
            ...updates,
            ...(name ? { name } : {}),
            ...(phone ? { phone } : {})
          }
          : player
      )
    }))

    return { ok: true }
  }

  const deletePlayer = (id) => {
    setData((prev) => ({
      ...prev,
      players: prev.players.filter((player) => player.id !== id)
    }))
    return { ok: true }
  }

  const addTurf = (turf) => {
    const entry = {
      id: createId("t"),
      name: turf.name?.trim(),
      location: turf.location?.trim() || "",
      ownerName: turf.ownerName?.trim() || "",
      ownerContact: normalizePhone(turf.ownerContact) || ""
    }

    setData((prev) => ({
      ...prev,
      turfs: [...prev.turfs, entry]
    }))

    return entry
  }

  const updateTurf = (id, updates) => {
    setData((prev) => ({
      ...prev,
      turfs: prev.turfs.map((turf) =>
        turf.id === id ? { ...turf, ...updates } : turf
      )
    }))
  }

  const deleteTurf = (id) => {
    setData((prev) => ({
      ...prev,
      turfs: prev.turfs.filter((turf) => turf.id !== id)
    }))
  }

  const addSport = (sport) => {
    const entry = {
      id: createId("s"),
      name: sport.name?.trim(),
      icon: sport.icon || "cricket"
    }

    setData((prev) => ({
      ...prev,
      sports: [...prev.sports, entry]
    }))

    return entry
  }

  const updateSport = (id, updates) => {
    setData((prev) => ({
      ...prev,
      sports: prev.sports.map((sport) =>
        sport.id === id ? { ...sport, ...updates } : sport
      )
    }))
  }

  const deleteSport = (id) => {
    setData((prev) => ({
      ...prev,
      sports: prev.sports.filter((sport) => sport.id !== id)
    }))
  }

  // ── Squad operations ────────────────────────────────────────────────────

  const addSquad = (squad) => {
    const name = squad.name?.trim()

    if (!name) {
      return { ok: false, error: "Squad name is required" }
    }

    const entry = {
      id: createId("sq"),
      name,
      memberPlayerIds: squad.memberPlayerIds || []
    }

    setData((prev) => ({
      ...prev,
      squads: [...(prev.squads || []), entry]
    }))

    return { ok: true, squad: entry }
  }

  const updateSquad = (id, updates) => {
    setData((prev) => ({
      ...prev,
      squads: (prev.squads || []).map((squad) =>
        squad.id === id ? { ...squad, ...updates } : squad
      )
    }))
    return { ok: true }
  }

  const deleteSquad = (id) => {
    setData((prev) => ({
      ...prev,
      squads: (prev.squads || []).filter((squad) => squad.id !== id)
    }))
    return { ok: true }
  }

  // Contribute from player's personal balance to a squad's pool
  const contributeToSquad = (squadId, playerId, amount) => {
    const numAmount = Number(amount)
    if (!numAmount || numAmount <= 0) {
      return { ok: false, error: "Enter a valid amount" }
    }

    const player = data.players.find((p) => p.id === playerId)
    if (!player) return { ok: false, error: "Player not found" }

    if (player.balance < numAmount) {
      return { ok: false, error: "Low balance — not enough to contribute this amount" }
    }

    const contributionItem = {
      id: createId("c"),
      playerId,
      amount: numAmount,
      date: new Date().toISOString().split("T")[0],
      notes: `Contributed to squad`,
    }

    const historyItem = {
      id: createId("h"),
      bookingId: null,
      sportId: null,
      turfId: null,
      date: contributionItem.date,
      startTime: "",
      endTime: "",
      amount: numAmount,
      type: "debit",
      paymentMode: "",
      notes: `Squad contribution`,
    }

    setData((prev) => ({
      ...prev,
      squads: (prev.squads || []).map((sq) =>
        sq.id === squadId
          ? { ...sq, contributions: [...(sq.contributions || []), contributionItem] }
          : sq
      ),
      players: prev.players.map((p) =>
        p.id === playerId
          ? {
            ...p,
            balance: p.balance - numAmount,
            history: [historyItem, ...p.history],
          }
          : p
      ),
    }))

    return { ok: true }
  }

  // Check if squad balance is sufficient for a prospective booking cost
  const getSquadBalance = (squadId) => {
    const squad = squads.find((sq) => sq.id === squadId)
    if (!squad) return 0
    return (squad.contributions || []).reduce((sum, c) => sum + (c.amount || 0), 0)
  }

  // ────────────────────────────────────────────────────────────────────────

  const addBooking = (booking) => {
    let created = null

    setData((prev) => {
      const { id, nextCounter } = createBookingId(prev.bookings, prev.bookingCounter)

      // Store calculated squad cost split so we can reverse precisely on edit/delete.
      let squadSplitCost = null
      let playerSplitCost = null

      if (booking?.bookingType === "Team" && Array.isArray(booking.teams)) {
        const teams = booking.teams || []
        const teamCount = teams.length || 0
        const amount = Number(booking.amount || 0)

        // Per requirement: costPerSquad = amount / teams.length
        squadSplitCost = teamCount > 0 ? amount / teamCount : 0
        playerSplitCost = {}

        teams.forEach((team) => {
          const playerIds = team.playerIds || []
          const perPlayer =
            playerIds.length > 0 ? squadSplitCost / playerIds.length : 0

          playerIds.forEach((pid) => {
            playerSplitCost[pid] = perPlayer
          })
        })
      }

      const entry = {
        id,
        paidAmount:
          booking.status === "Paid"
            ? booking.amount
            : booking.status === "Partial"
              ? Number(booking.paidAmount) || 0
              : 0,
        ...booking,
        // id must win over anything in booking payload
        id,
        squadSplitCost,
        playerSplitCost,
      }

      created = entry

      return {
        ...prev,
        bookingCounter: nextCounter, // ← persist high-water mark
        bookings: [...prev.bookings, entry],
        players: applySquadPlayerHistory(
          applySharesToPlayers(prev.players, entry),
          entry
        ),
        squads: applySquadShares(prev.squads || [], entry)
      }
    })

    return created
  }

  const updateBooking = (id, updates) => {
    let updated = null

    setData((prev) => {
      const previous = prev.bookings.find((booking) => booking.id === id)

      // Build next entry first, then recompute split costs deterministically.
      const nextBooking = {
        ...previous,
        ...updates,
      }

      const nextPaidAmount =
        updates.status === "Paid"
          ? updates.amount ?? previous.amount
          : updates.status === "Partial"
            ? Number(updates.paidAmount ?? previous.paidAmount) || 0
            : updates.status === "Pending"
              ? 0
              : previous.paidAmount

      nextBooking.paidAmount = nextPaidAmount

      let squadSplitCost = null
      let playerSplitCost = null

      if (nextBooking?.bookingType === "Team" && Array.isArray(nextBooking.teams)) {
        const teams = nextBooking.teams || []
        const teamCount = teams.length || 0
        const amount = Number(nextBooking.amount || 0)

        // Per requirement: costPerSquad = amount / teams.length
        squadSplitCost = teamCount > 0 ? amount / teamCount : 0
        playerSplitCost = {}

        teams.forEach((team) => {
          const playerIds = team.playerIds || []
          const perPlayer =
            playerIds.length > 0 ? squadSplitCost / playerIds.length : 0

          playerIds.forEach((pid) => {
            playerSplitCost[pid] = perPlayer
          })
        })
      }

      const entry = {
        ...nextBooking,
        squadSplitCost,
        playerSplitCost,
      }

      updated = entry

      return {
        ...prev,
        bookings: prev.bookings.map((booking) =>
          booking.id === id ? entry : booking
        ),
        players: applySquadPlayerHistory(
          applySharesToPlayers(prev.players, entry, previous),
          entry,
          previous
        ),
        squads: applySquadShares(prev.squads || [], entry, previous)
      }
    })

    return updated
  }

  const deleteBooking = (id) => {
    setData((prev) => {
      const previous = prev.bookings.find((booking) => booking.id === id)

      return {
        ...prev,
        bookings: prev.bookings.filter((booking) => booking.id !== id),
        players: applySquadPlayerHistory(
          applySharesToPlayers(prev.players, null, previous),
          null,
          previous
        ),
        squads: applySquadShares(prev.squads || [], null, previous)
      }
    })
  }


  const addBalance = (playerId, payload) => {
    setData((prev) => ({
      ...prev,
      players: prev.players.map((player) => {
        if (player.id !== playerId) {
          return player
        }

        const historyItem = {
          id: createId("h"),
          bookingId: null,
          sportId: null,
          turfId: null,
          date: payload.date,
          startTime: payload.time,
          endTime: "",
          amount: Number(payload.amount) || 0,
          type: "credit",
          paymentMode: payload.paymentMode,
          notes: payload.notes || "Balance added"
        }

        return {
          ...player,
          balance: player.balance + Number(payload.amount || 0),
          history: [historyItem, ...player.history]
        }
      })
    }))
  }

  const updateSettings = (updates) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...updates,
        notifications: {
          ...prev.settings.notifications,
          ...updates.notifications
        }
      }
    }))
  }

  const importAppData = (payload) => {
    setData(() => ({
      ...getInitialData(),
      ...payload,
      players: Array.isArray(payload.players) ? payload.players : getInitialData().players,
      turfs: Array.isArray(payload.turfs) ? payload.turfs : getInitialData().turfs,
      sports: Array.isArray(payload.sports) ? payload.sports : getInitialData().sports,
      bookings: Array.isArray(payload.bookings) ? payload.bookings : getInitialData().bookings,
      settings: {
        ...getInitialData().settings,
        ...(payload.settings || {})
      }
    }))
  }

  const value = {
    players,
    turfs,
    sports,
    bookings,
    squads,
    settings,
    getPlayerById,
    getTurfById,
    getSportById,
    getSquadById,
    getSquadBalance,
    addPlayer,
    updatePlayer,
    deletePlayer,
    addTurf,
    updateTurf,
    deleteTurf,
    addSport,
    updateSport,
    deleteSport,
    addSquad,
    updateSquad,
    deleteSquad,
    contributeToSquad,
    addBooking,
    updateBooking,
    deleteBooking,
    addBalance,
    updateSettings,
    importAppData
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
