/**
 * Tier Calculator - Maps percentiles to League of Legends rank tiers
 * Used to display player performance metrics with familiar rank badges
 */

export type TierName =
  | 'CHALLENGER'
  | 'GRANDMASTER'
  | 'MASTER'
  | 'DIAMOND'
  | 'EMERALD'
  | 'PLATINUM'
  | 'GOLD'
  | 'SILVER'
  | 'BRONZE'
  | 'IRON'

export interface TierInfo {
  name: TierName
  displayName: string
  color: string
  gradient: string
  minPercentile: number
  maxPercentile: number
  pointMultiplier: number // For X-RAY Score calculation
}

/**
 * Tier definitions based on percentile ranges
 * Lower percentile = better performance (Top 5% = Challenger)
 */
export const TIER_DEFINITIONS: TierInfo[] = [
  {
    name: 'CHALLENGER',
    displayName: 'Challenger',
    color: '#F4E5C2',
    gradient: 'from-yellow-200 via-yellow-300 to-yellow-400',
    minPercentile: 0,
    maxPercentile: 5,
    pointMultiplier: 2.0,
  },
  {
    name: 'GRANDMASTER',
    displayName: 'Grandmaster',
    color: '#FF4655',
    gradient: 'from-red-500 to-red-600',
    minPercentile: 5,
    maxPercentile: 10,
    pointMultiplier: 1.8,
  },
  {
    name: 'MASTER',
    displayName: 'Master',
    color: '#C27FFF',
    gradient: 'from-purple-400 to-purple-500',
    minPercentile: 10,
    maxPercentile: 20,
    pointMultiplier: 1.6,
  },
  {
    name: 'DIAMOND',
    displayName: 'Diamond',
    color: '#57C4E8',
    gradient: 'from-blue-400 to-blue-500',
    minPercentile: 20,
    maxPercentile: 35,
    pointMultiplier: 1.4,
  },
  {
    name: 'EMERALD',
    displayName: 'Emerald',
    color: '#00D97E',
    gradient: 'from-green-400 to-green-500',
    minPercentile: 35,
    maxPercentile: 50,
    pointMultiplier: 1.2,
  },
  {
    name: 'PLATINUM',
    displayName: 'Platinum',
    color: '#4ECDC4',
    gradient: 'from-cyan-400 to-cyan-500',
    minPercentile: 50,
    maxPercentile: 65,
    pointMultiplier: 1.0,
  },
  {
    name: 'GOLD',
    displayName: 'Gold',
    color: '#FFD700',
    gradient: 'from-yellow-500 to-yellow-600',
    minPercentile: 65,
    maxPercentile: 80,
    pointMultiplier: 0.8,
  },
  {
    name: 'SILVER',
    displayName: 'Silver',
    color: '#C0C0C0',
    gradient: 'from-gray-300 to-gray-400',
    minPercentile: 80,
    maxPercentile: 90,
    pointMultiplier: 0.6,
  },
  {
    name: 'BRONZE',
    displayName: 'Bronze',
    color: '#CD7F32',
    gradient: 'from-orange-700 to-orange-800',
    minPercentile: 90,
    maxPercentile: 95,
    pointMultiplier: 0.4,
  },
  {
    name: 'IRON',
    displayName: 'Iron',
    color: '#6B6B6B',
    gradient: 'from-gray-500 to-gray-600',
    minPercentile: 95,
    maxPercentile: 100,
    pointMultiplier: 0.2,
  },
]

/**
 * Get tier information based on percentile rank
 * @param percentile - Player's percentile (0-100, where lower is better)
 * @returns TierInfo object with tier details
 */
export function getTierFromPercentile(percentile: number): TierInfo {
  // Clamp percentile to valid range
  const clampedPercentile = Math.max(0, Math.min(100, percentile))

  // Find matching tier
  const tier = TIER_DEFINITIONS.find(
    (t) => clampedPercentile >= t.minPercentile && clampedPercentile < t.maxPercentile
  )

  // Default to Iron if not found (shouldn't happen)
  return tier || TIER_DEFINITIONS[TIER_DEFINITIONS.length - 1]
}

/**
 * Calculate point contribution for X-RAY Score
 * Base formula: 100 points × tier multiplier
 * Result: 0-200 points per metric
 *
 * @param percentile - Player's percentile (0-100)
 * @returns Points to contribute to X-RAY Score
 */
export function calculatePointContribution(percentile: number): number {
  const tier = getTierFromPercentile(percentile)
  const basePoints = 100
  return Math.round(basePoints * tier.pointMultiplier)
}

/**
 * Calculate total X-RAY Score from all metrics
 * @param metrics - Array of metric percentiles
 * @returns Total X-RAY Score (0-1200 for 6 metrics)
 */
export function calculateXRayScore(metrics: Array<{ percentile: number }>): number {
  const totalPoints = metrics.reduce((sum, metric) => {
    return sum + calculatePointContribution(metric.percentile)
  }, 0)

  return totalPoints
}

/**
 * Categorize metrics for score breakdown
 */
export type MetricCategory = 'MECHANICAL' | 'GAME_SENSE' | 'CONSISTENCY'

export const METRIC_CATEGORIES: Record<string, MetricCategory> = {
  // Mechanical skill
  'cs_per_minute': 'MECHANICAL',
  'damage_per_minute': 'MECHANICAL',
  'solo_kills': 'MECHANICAL',
  'positioning_score': 'MECHANICAL',

  // Game sense
  'vision_score': 'GAME_SENSE',
  'vision_score_per_minute': 'GAME_SENSE',
  'kill_participation': 'GAME_SENSE',
  'objective_control': 'GAME_SENSE',
  'roaming_impact': 'GAME_SENSE',

  // Consistency
  'kda': 'CONSISTENCY',
  'gold_efficiency': 'CONSISTENCY',
  'death_efficiency': 'CONSISTENCY',
  'damage_share': 'CONSISTENCY',
}

/**
 * Calculate category breakdown for X-RAY Score
 */
export function calculateCategoryBreakdown(
  metrics: Array<{ id: string; percentile: number }>
): Record<MetricCategory, number> {
  const breakdown: Record<MetricCategory, number> = {
    MECHANICAL: 0,
    GAME_SENSE: 0,
    CONSISTENCY: 0,
  }

  metrics.forEach((metric) => {
    const category = METRIC_CATEGORIES[metric.id] || 'CONSISTENCY'
    breakdown[category] += calculatePointContribution(metric.percentile)
  })

  return breakdown
}

/**
 * Calculate overall percentile from multiple metrics (weighted average)
 * @param metrics - Array of metrics with percentiles
 * @returns Overall percentile (0-100)
 */
export function getOverallPercentile(metrics: Array<{ percentile: number }>): number {
  if (metrics.length === 0) return 50

  const totalPercentile = metrics.reduce((sum, metric) => sum + metric.percentile, 0)
  return Math.round(totalPercentile / metrics.length)
}

/**
 * Tier order for division calculation (higher index = lower rank)
 */
const TIER_ORDER: TierName[] = [
  'CHALLENGER',
  'GRANDMASTER',
  'MASTER',
  'DIAMOND',
  'EMERALD',
  'PLATINUM',
  'GOLD',
  'SILVER',
  'BRONZE',
  'IRON',
]

/**
 * Calculate division gap between current rank and performance tier
 * Positive gap means performing above current rank
 *
 * @param currentTier - Player's current tier (e.g., "GOLD")
 * @param currentRank - Player's current rank (e.g., "III", null for Master+)
 * @param performanceTier - Calculated performance tier
 * @param performanceRank - Calculated performance rank (derived from percentile position within tier)
 * @returns Number of divisions difference (positive = performing better, negative = performing worse)
 */
export function calculateDivisionGap(
  currentTier: string | null,
  currentRank: string | null,
  performanceTier: TierName,
  performancePercentile: number
): number {
  // If no current tier, can't calculate gap
  if (!currentTier) return 0

  // Normalize current tier to match TierName format
  const normalizedCurrentTier = currentTier.toUpperCase() as TierName

  // Get tier indices
  const currentTierIndex = TIER_ORDER.indexOf(normalizedCurrentTier)
  const performanceTierIndex = TIER_ORDER.indexOf(performanceTier)

  // Invalid tier
  if (currentTierIndex === -1 || performanceTierIndex === -1) return 0

  // For Master+ tiers, each tier is 1 division
  const isMasterPlusCurrent = currentTierIndex <= 2 // Challenger, Grandmaster, Master
  const isMasterPlusPerformance = performanceTierIndex <= 2

  // Calculate current tier divisions (from bottom)
  let currentDivisions = 0
  if (isMasterPlusCurrent) {
    // Master+ tiers don't have divisions, count as 1 division per tier
    currentDivisions = (9 - currentTierIndex) * 4 // Each tier below is 4 divisions
  } else {
    // Regular tiers: count tiers below × 4, plus current rank
    currentDivisions = (9 - currentTierIndex) * 4

    // Add divisions for current rank (IV=0, III=1, II=2, I=3)
    const rankToDivision: Record<string, number> = { 'IV': 0, 'III': 1, 'II': 2, 'I': 3 }
    currentDivisions += rankToDivision[currentRank || 'IV'] || 0
  }

  // Calculate performance tier divisions
  let performanceDivisions = 0
  if (isMasterPlusPerformance) {
    performanceDivisions = (9 - performanceTierIndex) * 4
  } else {
    performanceDivisions = (9 - performanceTierIndex) * 4

    // Estimate rank within tier based on percentile position
    const tierInfo = getTierFromPercentile(performancePercentile)
    const percentileWithinTier =
      (performancePercentile - tierInfo.minPercentile) /
      (tierInfo.maxPercentile - tierInfo.minPercentile)

    // Map to divisions: 0-0.25 = I, 0.25-0.5 = II, 0.5-0.75 = III, 0.75-1.0 = IV
    const divisionWithinTier = Math.min(3, Math.floor((1 - percentileWithinTier) * 4))
    performanceDivisions += divisionWithinTier
  }

  // Positive = performing above rank, negative = performing below rank
  return performanceDivisions - currentDivisions
}

/**
 * Get a readable performance tier with rank
 * @param percentile - Overall percentile
 * @returns Object with tier name and estimated rank
 */
export function getPerformanceTier(percentile: number): {
  tier: TierName
  rank: string | null
  displayText: string
} {
  const tierInfo = getTierFromPercentile(percentile)

  // Master+ tiers don't have divisions
  if (['CHALLENGER', 'GRANDMASTER', 'MASTER'].includes(tierInfo.name)) {
    return {
      tier: tierInfo.name,
      rank: null,
      displayText: tierInfo.displayName,
    }
  }

  // Calculate rank within tier based on percentile position
  const percentileWithinTier =
    (percentile - tierInfo.minPercentile) /
    (tierInfo.maxPercentile - tierInfo.minPercentile)

  // Map to divisions (inverted because lower percentile = better)
  // 0-0.25 = I, 0.25-0.5 = II, 0.5-0.75 = III, 0.75-1.0 = IV
  const divisions = ['I', 'II', 'III', 'IV']
  const divisionIndex = Math.min(3, Math.floor(percentileWithinTier * 4))
  const rank = divisions[divisionIndex]

  return {
    tier: tierInfo.name,
    rank,
    displayText: `${tierInfo.displayName} ${rank}`,
  }
}
