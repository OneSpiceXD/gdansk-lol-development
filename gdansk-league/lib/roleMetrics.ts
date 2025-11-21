/**
 * Role-Specific Metrics Configuration
 * Defines metrics for each role, their data sources, and calculation methods
 */

export type Role = 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support' | 'All Roles'

export type MetricSource = 'direct' | 'calculated' | 'timeline'

export interface MetricDefinition {
  id: string
  name: string
  description: string
  source: MetricSource
  unit?: string
  format: 'decimal' | 'percentage' | 'integer'
  decimals?: number
  higherIsBetter: boolean
  // Data sources from Riot API
  apiFields?: string[]
  // Calculation function reference
  calculationMethod?: string
}

export interface RoleMetrics {
  role: Role
  metrics: MetricDefinition[]
}

/**
 * ADC Metrics Configuration
 */
export const ADC_METRICS: MetricDefinition[] = [
  {
    id: 'damage_per_minute',
    name: 'Damage per Minute',
    description: 'Champion damage dealt per minute - measures carry potential',
    source: 'direct',
    apiFields: ['challenges.damagePerMinute'],
    format: 'decimal',
    decimals: 1,
    higherIsBetter: true,
  },
  {
    id: 'cs_per_minute',
    name: 'CS/Min',
    description: 'Creep score per minute - measures farm efficiency',
    source: 'calculated',
    apiFields: ['totalMinionsKilled', 'neutralMinionsKilled', 'info.gameDuration'],
    calculationMethod: '(totalMinionsKilled + neutralMinionsKilled) / (gameDuration / 60)',
    format: 'decimal',
    decimals: 1,
    higherIsBetter: true,
  },
  {
    id: 'damage_share',
    name: 'Damage Share %',
    description: 'Percentage of team\'s total damage',
    source: 'direct',
    apiFields: ['challenges.teamDamagePercentage'],
    format: 'percentage',
    decimals: 1,
    higherIsBetter: true,
  },
  {
    id: 'gold_efficiency',
    name: 'Gold Efficiency',
    description: 'Damage dealt per gold earned',
    source: 'calculated',
    apiFields: ['totalDamageDealtToChampions', 'goldEarned'],
    calculationMethod: 'totalDamageDealtToChampions / goldEarned',
    format: 'decimal',
    decimals: 2,
    higherIsBetter: true,
  },
  {
    id: 'positioning_score',
    name: 'Positioning Score',
    description: 'Damage dealt relative to deaths - measures safety while dealing damage',
    source: 'calculated',
    apiFields: ['totalDamageDealtToChampions', 'deaths'],
    calculationMethod: 'totalDamageDealtToChampions / max(deaths, 1)',
    format: 'integer',
    higherIsBetter: true,
  },
  {
    id: 'objective_damage',
    name: 'Objective Damage',
    description: 'Total damage to turrets, dragons, and Baron',
    source: 'direct',
    apiFields: ['damageDealtToTurrets', 'damageDealtToObjectives'],
    format: 'integer',
    higherIsBetter: true,
  },
]

/**
 * Support Metrics Configuration
 */
export const SUPPORT_METRICS: MetricDefinition[] = [
  {
    id: 'vision_score_per_minute',
    name: 'Vision Score/Min',
    description: 'Vision score per minute - measures map control',
    source: 'direct',
    apiFields: ['challenges.visionScorePerMinute'],
    format: 'decimal',
    decimals: 2,
    higherIsBetter: true,
  },
  {
    id: 'kill_participation',
    name: 'Kill Participation %',
    description: 'Percentage of team kills participated in',
    source: 'direct',
    apiFields: ['challenges.killParticipation'],
    format: 'percentage',
    decimals: 1,
    higherIsBetter: true,
  },
  {
    id: 'crowd_control_score',
    name: 'Crowd Control Score',
    description: 'Total seconds of crowd control applied to enemies',
    source: 'direct',
    apiFields: ['timeCCingOthers'],
    format: 'decimal',
    decimals: 1,
    unit: 's',
    higherIsBetter: true,
  },
  {
    id: 'roaming_impact',
    name: 'Roaming Impact',
    description: 'Kills and assists from successful roams to other lanes',
    source: 'timeline',
    apiFields: ['timeline.events.CHAMPION_KILL'],
    calculationMethod: 'Count kills/assists outside bot lane from timeline',
    format: 'integer',
    higherIsBetter: true,
  },
  {
    id: 'gold_efficiency',
    name: 'Gold Efficiency',
    description: 'Utility provided per gold earned (assists + wards)',
    source: 'calculated',
    apiFields: ['assists', 'wardsPlaced', 'goldEarned'],
    calculationMethod: '(assists + wardsPlaced / 2) / (goldEarned / 1000)',
    format: 'decimal',
    decimals: 2,
    higherIsBetter: true,
  },
  {
    id: 'death_efficiency',
    name: 'Death Efficiency',
    description: 'Value provided per death (assists + saves)',
    source: 'calculated',
    apiFields: ['assists', 'challenges.saveAllyFromDeath', 'deaths'],
    calculationMethod: '(assists + saveAllyFromDeath) / max(deaths, 1)',
    format: 'decimal',
    decimals: 1,
    higherIsBetter: true,
  },
]

/**
 * Jungle Metrics Configuration
 */
export const JUNGLE_METRICS: MetricDefinition[] = [
  {
    id: 'cs_per_minute',
    name: 'CS/Min',
    description: 'Jungle farm efficiency',
    source: 'calculated',
    apiFields: ['totalMinionsKilled', 'neutralMinionsKilled', 'info.gameDuration'],
    calculationMethod: '(totalMinionsKilled + neutralMinionsKilled) / (gameDuration / 60)',
    format: 'decimal',
    decimals: 1,
    higherIsBetter: true,
  },
  {
    id: 'kill_participation',
    name: 'Kill Participation %',
    description: 'Percentage of team kills participated in',
    source: 'direct',
    apiFields: ['challenges.killParticipation'],
    format: 'percentage',
    decimals: 1,
    higherIsBetter: true,
  },
  {
    id: 'objective_control',
    name: 'Objective Control',
    description: 'Dragons, Barons, and Rift Heralds secured',
    source: 'direct',
    apiFields: ['dragonKills', 'baronKills', 'challenges.riftHeraldTakedowns'],
    calculationMethod: 'dragonKills + baronKills + riftHeraldTakedowns',
    format: 'integer',
    higherIsBetter: true,
  },
  {
    id: 'early_game_impact',
    name: 'Early Game Impact',
    description: 'Kills and assists before 15 minutes',
    source: 'direct',
    apiFields: ['challenges.takedownsFirstXMinutes'],
    format: 'integer',
    higherIsBetter: true,
  },
  {
    id: 'vision_score',
    name: 'Vision Score',
    description: 'Total vision score - wards placed and cleared',
    source: 'direct',
    apiFields: ['visionScore'],
    format: 'decimal',
    decimals: 1,
    higherIsBetter: true,
  },
  {
    id: 'jungle_proximity',
    name: 'Jungle Proximity',
    description: 'Time spent near objectives and key jungle areas',
    source: 'timeline',
    apiFields: ['timeline.participantFrames.position'],
    calculationMethod: 'Calculate % time in jungle quadrants from position data',
    format: 'percentage',
    decimals: 1,
    higherIsBetter: true,
  },
]

/**
 * Mid Lane Metrics Configuration
 */
export const MID_METRICS: MetricDefinition[] = [
  {
    id: 'damage_per_minute',
    name: 'Damage per Minute',
    description: 'Champion damage dealt per minute',
    source: 'direct',
    apiFields: ['challenges.damagePerMinute'],
    format: 'decimal',
    decimals: 1,
    higherIsBetter: true,
  },
  {
    id: 'cs_per_minute',
    name: 'CS/Min',
    description: 'Farm efficiency',
    source: 'calculated',
    apiFields: ['totalMinionsKilled', 'neutralMinionsKilled', 'info.gameDuration'],
    calculationMethod: '(totalMinionsKilled + neutralMinionsKilled) / (gameDuration / 60)',
    format: 'decimal',
    decimals: 1,
    higherIsBetter: true,
  },
  {
    id: 'roaming_impact',
    name: 'Roaming Impact',
    description: 'Successful roams that lead to kills/objectives',
    source: 'timeline',
    apiFields: ['timeline.events.CHAMPION_KILL', 'challenges.killsOnOtherLanesEarlyJungleAsLaner'],
    calculationMethod: 'Count kills/assists outside mid lane',
    format: 'integer',
    higherIsBetter: true,
  },
  {
    id: 'kill_participation',
    name: 'Kill Participation %',
    description: 'Percentage of team kills participated in',
    source: 'direct',
    apiFields: ['challenges.killParticipation'],
    format: 'percentage',
    decimals: 1,
    higherIsBetter: true,
  },
  {
    id: 'solo_kills',
    name: 'Solo Kills',
    description: 'Lane dominance through 1v1 outplays',
    source: 'direct',
    apiFields: ['challenges.soloKills'],
    format: 'integer',
    higherIsBetter: true,
  },
  {
    id: 'vision_score',
    name: 'Vision Score',
    description: 'Map control through wards',
    source: 'direct',
    apiFields: ['visionScore'],
    format: 'decimal',
    decimals: 1,
    higherIsBetter: true,
  },
]

/**
 * Top Lane Metrics Configuration
 */
export const TOP_METRICS: MetricDefinition[] = [
  {
    id: 'cs_per_minute',
    name: 'CS/Min',
    description: 'Farm efficiency',
    source: 'calculated',
    apiFields: ['totalMinionsKilled', 'neutralMinionsKilled', 'info.gameDuration'],
    calculationMethod: '(totalMinionsKilled + neutralMinionsKilled) / (gameDuration / 60)',
    format: 'decimal',
    decimals: 1,
    higherIsBetter: true,
  },
  {
    id: 'damage_per_minute',
    name: 'Damage per Minute',
    description: 'Teamfight and skirmish impact',
    source: 'direct',
    apiFields: ['challenges.damagePerMinute'],
    format: 'decimal',
    decimals: 1,
    higherIsBetter: true,
  },
  {
    id: 'solo_kills',
    name: 'Solo Kills',
    description: 'Lane dominance',
    source: 'direct',
    apiFields: ['challenges.soloKills'],
    format: 'integer',
    higherIsBetter: true,
  },
  {
    id: 'early_game_dominance',
    name: 'Early Game Dominance',
    description: 'Solo kills and early kills before 10 minutes',
    source: 'calculated',
    apiFields: ['challenges.soloKills', 'challenges.takedownsFirstXMinutes', 'deaths'],
    calculationMethod: '(soloKills + takedownsFirst10Minutes) / max(deaths, 1)',
    format: 'decimal',
    decimals: 2,
    higherIsBetter: true,
  },
  {
    id: 'durability_score',
    name: 'Durability Score',
    description: 'Damage absorbed per death',
    source: 'calculated',
    apiFields: ['totalDamageTaken', 'damageSelfMitigated', 'deaths'],
    calculationMethod: '(totalDamageTaken + damageSelfMitigated) / max(deaths, 1)',
    format: 'integer',
    higherIsBetter: true,
  },
  {
    id: 'split_push_pressure',
    name: 'Split Push Pressure',
    description: 'Turret damage and solo turret takedowns',
    source: 'calculated',
    apiFields: ['damageDealtToTurrets', 'challenges.soloTurretsLategame', 'challenges.turretPlatesTaken'],
    calculationMethod: 'damageDealtToTurrets / 1000 + soloTurretsLategame * 2 + turretPlatesTaken',
    format: 'decimal',
    decimals: 1,
    higherIsBetter: true,
  },
]

/**
 * Get metrics for a specific role
 */
export function getMetricsForRole(role: Role): MetricDefinition[] {
  switch (role) {
    case 'ADC':
      return ADC_METRICS
    case 'Support':
      return SUPPORT_METRICS
    case 'Jungle':
      return JUNGLE_METRICS
    case 'Mid':
      return MID_METRICS
    case 'Top':
      return TOP_METRICS
    case 'All Roles':
      // Return a common set of role-agnostic metrics
      return [
        {
          id: 'kda',
          name: 'KDA',
          description: 'Kill/Death/Assist ratio',
          source: 'calculated',
          apiFields: ['kills', 'deaths', 'assists'],
          calculationMethod: '(kills + assists) / max(deaths, 1)',
          format: 'decimal',
          decimals: 2,
          higherIsBetter: true,
        },
        {
          id: 'cs_per_minute',
          name: 'CS/Min',
          description: 'Farm efficiency',
          source: 'calculated',
          format: 'decimal',
          decimals: 1,
          higherIsBetter: true,
        },
        {
          id: 'kill_participation',
          name: 'Kill Participation %',
          description: 'Percentage of team kills participated in',
          source: 'direct',
          format: 'percentage',
          decimals: 1,
          higherIsBetter: true,
        },
        {
          id: 'vision_score',
          name: 'Vision Score',
          description: 'Ward control',
          source: 'direct',
          format: 'decimal',
          decimals: 1,
          higherIsBetter: true,
        },
        {
          id: 'damage_share',
          name: 'Damage Share %',
          description: 'Percentage of team damage',
          source: 'direct',
          format: 'percentage',
          decimals: 1,
          higherIsBetter: true,
        },
        {
          id: 'objective_participation',
          name: 'Objective Participation',
          description: 'Dragons, Barons, and turrets',
          source: 'calculated',
          format: 'integer',
          higherIsBetter: true,
        },
      ]
    default:
      return []
  }
}

/**
 * Format a metric value for display
 */
export function formatMetricValue(
  value: number,
  metric: MetricDefinition
): string {
  if (value === null || value === undefined) return '-'

  switch (metric.format) {
    case 'percentage':
      return `${(value * 100).toFixed(metric.decimals ?? 1)}%`
    case 'decimal':
      return value.toFixed(metric.decimals ?? 1)
    case 'integer':
      return Math.round(value).toString()
    default:
      return value.toString()
  }
}

/**
 * Get percentile badge styling
 */
export function getPercentileBadge(percentile: number, isNegativeStat: boolean = false) {
  // Invert for negative stats (lower is better)
  const displayPercentile = isNegativeStat ? 100 - percentile : percentile

  // Round to nearest 20% for vagueness
  const roundedPercentile = Math.round(displayPercentile / 20) * 20

  if (roundedPercentile <= 20) {
    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/15',
      label: `Top ${roundedPercentile}%`,
    }
  } else if (roundedPercentile <= 40) {
    return {
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/15',
      label: `Top ${roundedPercentile}%`,
    }
  } else if (roundedPercentile <= 60) {
    return {
      text: 'text-yellow-400',
      bg: 'bg-yellow-500/15',
      label: `Top ${roundedPercentile}%`,
    }
  } else if (roundedPercentile <= 80) {
    return {
      text: 'text-gray-400',
      bg: 'bg-gray-500/15',
      label: 'Average',
    }
  } else {
    return {
      text: 'text-gray-400',
      bg: 'bg-gray-500/15',
      label: 'Below Average',
    }
  }
}
