/**
 * Cost Split Utilities for Team Bookings
 * Handles both Team Wise and Player Wise split calculations
 */

/**
 * Calculate costs for team-wise split
 * Formula: Team Amount = Total ÷ Number of Teams
 *          Player Cost = Team Amount ÷ Players in Team
 */
export function calculateTeamWiseSplit(amount, teams) {
  if (!teams || teams.length === 0) return {}

  const teamAmount = amount / teams.length
  const result = {}

  teams.forEach((team) => {
    // Only count players NOT marked as excluded for this booking
    const excludedIds = team.excludedPlayerIds || []
    const activePlayerIds = (team.playerIds || []).filter(
      (pid) => !excludedIds.includes(pid)
    )
    const playerCount = activePlayerIds.length
    const playerCost = playerCount > 0 ? teamAmount / playerCount : 0

    result[team.id] = {
      teamAmount,
      playerCost,
      playerCount,
      totalTeamPlayers: team.playerIds?.length || 0,
      activePlayerIds
    }
  })

  return result
}

/**
 * Calculate costs for player-wise split
 * Formula: Per Player Cost = Total ÷ Total Players Across All Teams
 */
export function calculatePlayerWiseSplit(amount, teams) {
  if (!teams || teams.length === 0) return {}

  const totalPlayers = teams.reduce((sum, team) => sum + (team.playerIds?.length || 0), 0)
  const playerCost = totalPlayers > 0 ? amount / totalPlayers : 0

  const result = {}

  teams.forEach((team) => {
    result[team.id] = {
      teamAmount: null, // Not shown in player-wise split
      playerCost,
      playerCount: team.playerIds?.length || 0,
      totalTeamPlayers: team.playerIds?.length || 0
    }
  })

  return result
}

/**
 * Get calculated share for a specific player in a team
 */
export function getPlayerShare(teamId, splitCosts) {
  if (!splitCosts || !splitCosts[teamId]) return 0
  return splitCosts[teamId].playerCost
}

/**
 * Get team amount for a specific team
 */
export function getTeamAmount(teamId, splitCosts) {
  if (!splitCosts || !splitCosts[teamId]) return 0
  return splitCosts[teamId].teamAmount
}

/**
 * Validate team booking structure
 * - At least 1 team required
 * - Each team must have at least 1 player
 * - Team-wise split requires at least 2 teams
 */
export function validateTeamBooking(teams, splitMode) {
  const errors = []

  if (!teams || teams.length === 0) {
    errors.push("At least one team required")
  }

  teams?.forEach((team, index) => {
    if (!team.name || team.name.trim() === "") {
      errors.push(`Team ${index + 1}: Name is required`)
    }
    if (!team.playerIds || team.playerIds.length === 0) {
      errors.push(`Team ${team.name || index + 1}: Must have at least one player`)
    }
  })

  if (splitMode === "Team" && teams.length < 2) {
    errors.push("At least 2 teams required for Team Wise Split")
  }

  return errors
}

/**
 * Check if team-wise split is available
 */
export function isTeamWiseSplitAvailable(teams) {
  return teams && teams.length >= 2
}
