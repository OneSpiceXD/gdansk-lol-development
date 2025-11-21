// Rank progression calculator for X-Ray insights
// Calculates improvement targets to reach next rank/tier

import { getPerformanceTier } from './tierCalculator'

export interface RankTarget {
  targetTier: string
  targetRank: string | null
  displayText: string
  targetPercentile: number
  isNextDivision: boolean // true for next division, false for next tier
}

export interface MetricImprovement {
  metricId: string
  metricName: string
  currentValue: number
  targetValue: number
  improvementNeeded: number
  improvementPercent: number
  impact: number // How much this affects overall X-Ray score
}

export interface RankProgressionPlan {
  currentRank: RankTarget
  nextDivision: RankTarget
  nextTier: RankTarget
  divisionGap: number
  improvementsForNextDivision: MetricImprovement[]
  improvementsForNextTier: MetricImprovement[]
  recommendedFocus: MetricImprovement // Single best metric to improve
}

// Tier order for progression calculation
const TIER_ORDER = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER']
const RANK_ORDER = ['IV', 'III', 'II', 'I'] // Ascending order

/**
 * Get the next division from current rank
 */
function getNextDivision(tier: string, rank: string | null): RankTarget {
  const tierIndex = TIER_ORDER.indexOf(tier.toUpperCase())

  // Master+ don't have divisions
  if (!rank || tierIndex >= 6) {
    const nextTierIndex = tierIndex + 1
    if (nextTierIndex >= TIER_ORDER.length) {
      return {
        targetTier: tier,
        targetRank: null,
        displayText: tier,
        targetPercentile: 5, // Top 5% for Challenger
        isNextDivision: true
      }
    }
    return {
      targetTier: TIER_ORDER[nextTierIndex],
      targetRank: null,
      displayText: TIER_ORDER[nextTierIndex],
      targetPercentile: getPercentileForTier(TIER_ORDER[nextTierIndex], null),
      isNextDivision: true
    }
  }

  const rankIndex = RANK_ORDER.indexOf(rank)

  // If at rank I, next division is next tier IV
  if (rankIndex === 3) {
    const nextTierIndex = tierIndex + 1
    if (nextTierIndex >= TIER_ORDER.length) {
      return {
        targetTier: tier,
        targetRank: rank,
        displayText: `${tier} ${rank}`,
        targetPercentile: 5,
        isNextDivision: true
      }
    }
    const nextTier = TIER_ORDER[nextTierIndex]
    return {
      targetTier: nextTier,
      targetRank: 'IV',
      displayText: `${nextTier} IV`,
      targetPercentile: getPercentileForTier(nextTier, 'IV'),
      isNextDivision: true
    }
  }

  // Otherwise, move up one rank within same tier
  const nextRank = RANK_ORDER[rankIndex + 1]
  return {
    targetTier: tier,
    targetRank: nextRank,
    displayText: `${tier} ${nextRank}`,
    targetPercentile: getPercentileForTier(tier, nextRank),
    isNextDivision: true
  }
}

/**
 * Get the next tier milestone (e.g., Gold II -> Platinum IV)
 */
function getNextTierMilestone(tier: string, rank: string | null): RankTarget {
  const tierIndex = TIER_ORDER.indexOf(tier.toUpperCase())
  const nextTierIndex = tierIndex + 1

  if (nextTierIndex >= TIER_ORDER.length) {
    return {
      targetTier: tier,
      targetRank: rank,
      displayText: tier,
      targetPercentile: 5,
      isNextDivision: false
    }
  }

  const nextTier = TIER_ORDER[nextTierIndex]
  const nextTierRank = nextTierIndex >= 6 ? null : 'IV' // Master+ don't have divisions

  return {
    targetTier: nextTier,
    targetRank: nextTierRank,
    displayText: nextTierRank ? `${nextTier} ${nextTierRank}` : nextTier,
    targetPercentile: getPercentileForTier(nextTier, nextTierRank),
    isNextDivision: false
  }
}

/**
 * Get approximate percentile threshold for a given tier/rank
 * Based on League distribution data
 */
function getPercentileForTier(tier: string, rank: string | null): number {
  const tierUpper = tier.toUpperCase()

  // Percentiles represent top X% (lower is better)
  const tierPercentiles: { [key: string]: number } = {
    'IRON IV': 100,
    'IRON III': 95,
    'IRON II': 90,
    'IRON I': 85,
    'BRONZE IV': 80,
    'BRONZE III': 75,
    'BRONZE II': 70,
    'BRONZE I': 65,
    'SILVER IV': 60,
    'SILVER III': 55,
    'SILVER II': 50,
    'SILVER I': 45,
    'GOLD IV': 40,
    'GOLD III': 35,
    'GOLD II': 30,
    'GOLD I': 25,
    'PLATINUM IV': 20,
    'PLATINUM III': 17,
    'PLATINUM II': 14,
    'PLATINUM I': 11,
    'DIAMOND IV': 9,
    'DIAMOND III': 7,
    'DIAMOND II': 5.5,
    'DIAMOND I': 4,
    'MASTER': 3,
    'GRANDMASTER': 1.5,
    'CHALLENGER': 0.5
  }

  const key = rank ? `${tierUpper} ${rank}` : tierUpper
  return tierPercentiles[key] || 50
}

/**
 * Calculate how much a metric needs to improve to reach target percentile
 */
function calculateMetricImprovement(
  metricId: string,
  metricName: string,
  currentValue: number,
  currentPercentile: number,
  targetPercentile: number,
  polishAverage: number
): MetricImprovement {
  // Estimate target value based on percentile gap
  // This is a simplified calculation - in reality, you'd use your tier benchmarks
  const percentileGap = currentPercentile - targetPercentile
  const improvementFactor = 1 + (percentileGap * 0.015) // Roughly 1.5% per percentile point

  const targetValue = currentValue * improvementFactor
  const improvementNeeded = targetValue - currentValue
  const improvementPercent = (improvementNeeded / currentValue) * 100

  // Calculate impact (how much this metric affects overall X-Ray score)
  // Metrics further from target have higher potential impact
  const impact = percentileGap * (improvementPercent / 100)

  return {
    metricId,
    metricName,
    currentValue,
    targetValue,
    improvementNeeded,
    improvementPercent,
    impact
  }
}

/**
 * Main function: Calculate complete rank progression plan
 */
export function calculateRankProgressionPlan(
  currentTier: string,
  currentRank: string | null,
  currentPercentile: number,
  metrics: Array<{
    id: string
    name: string
    value: number
    percentile: number
    polishAverage: number
  }>
): RankProgressionPlan {
  const currentPerformance = getPerformanceTier(currentPercentile)

  const currentRankTarget: RankTarget = {
    targetTier: currentTier,
    targetRank: currentRank,
    displayText: currentRank ? `${currentTier} ${currentRank}` : currentTier,
    targetPercentile: getPercentileForTier(currentTier, currentRank),
    isNextDivision: false
  }

  const nextDivision = getNextDivision(currentTier, currentRank)
  const nextTier = getNextTierMilestone(currentTier, currentRank)

  // Calculate improvements needed for next division
  const improvementsForNextDivision = metrics.map(metric =>
    calculateMetricImprovement(
      metric.id,
      metric.name,
      metric.value,
      metric.percentile,
      nextDivision.targetPercentile,
      metric.polishAverage
    )
  ).sort((a, b) => b.impact - a.impact) // Sort by impact (highest first)

  // Calculate improvements needed for next tier
  const improvementsForNextTier = metrics.map(metric =>
    calculateMetricImprovement(
      metric.id,
      metric.name,
      metric.value,
      metric.percentile,
      nextTier.targetPercentile,
      metric.polishAverage
    )
  ).sort((a, b) => b.impact - a.impact)

  // Recommended focus: metric with highest impact for next division
  const recommendedFocus = improvementsForNextDivision[0]

  // Calculate division gap
  const currentTierIndex = TIER_ORDER.indexOf(currentTier.toUpperCase())
  const performanceTierIndex = TIER_ORDER.indexOf(currentPerformance.tier.toUpperCase())

  let divisionGap = (performanceTierIndex - currentTierIndex) * 4 // 4 divisions per tier

  if (currentRank && currentPerformance.rank) {
    const currentRankIndex = RANK_ORDER.indexOf(currentRank)
    const performanceRankIndex = RANK_ORDER.indexOf(currentPerformance.rank)
    divisionGap += (performanceRankIndex - currentRankIndex)
  }

  return {
    currentRank: currentRankTarget,
    nextDivision,
    nextTier,
    divisionGap,
    improvementsForNextDivision,
    improvementsForNextTier,
    recommendedFocus
  }
}

/**
 * Format improvement text for display
 */
export function formatImprovementText(improvement: MetricImprovement): string {
  const percent = improvement.improvementPercent.toFixed(0)
  const current = improvement.currentValue.toFixed(1)
  const target = improvement.targetValue.toFixed(1)

  return `Improve ${improvement.metricName} from ${current} to ${target} (+${percent}%)`
}
