'use client'

import { useEffect, useState } from 'react'
import CompactMetricCard from '@/components/CompactMetricCard'
import FocusPlanSidebar from '@/components/FocusPlanSidebar'
import {
  calculateXRayScore,
  getOverallPercentile
} from '@/lib/tierCalculator'

interface InsightsTabProps {
  summonerName: string
  defaultRole?: string
}

interface MetricData {
  id: string
  name: string
  value: number
  polishAverage?: number
  percentile?: number
  category?: string
  tier?: string
  tierColor?: string
  pointContribution?: number
}

interface RoleStats {
  role: string
  metrics: MetricData[]
  currentTier?: string
  currentRank?: string
}

// Role-specific category mapping - logically consistent categories
// MECHANICAL = Damage, Farming, Fighting execution
// GAME_SENSE = Vision, Map awareness, Objectives, Teamplay
// CONSISTENCY = Efficiency, Survival, Resource management
const ROLE_METRIC_CATEGORIES: Record<string, Record<string, 'MECHANICAL' | 'GAME_SENSE' | 'CONSISTENCY'>> = {
  // ADC: DPM, CS, Damage Share = Mechanical | Objective focus = Game Sense | Efficiency = Consistency
  ADC: {
    damage_per_minute: 'MECHANICAL',
    cs_per_minute: 'MECHANICAL',
    damage_share: 'MECHANICAL',
    objective_damage: 'GAME_SENSE',
    gold_efficiency: 'CONSISTENCY',
    positioning_score: 'CONSISTENCY',
  },
  // Support: CC = Mechanical | Vision, KP, Roaming = Game Sense | Efficiency = Consistency
  SUPPORT: {
    crowd_control_score: 'MECHANICAL',
    vision_score_per_minute: 'GAME_SENSE',
    kill_participation: 'GAME_SENSE',
    roaming_impact: 'GAME_SENSE',
    gold_efficiency: 'CONSISTENCY',
    death_efficiency: 'CONSISTENCY',
  },
  // Jungle: CS, Early ganks = Mechanical | Vision, Obj, KP = Game Sense | Pathing = Consistency
  JUNGLE: {
    cs_per_minute: 'MECHANICAL',
    early_game_impact: 'MECHANICAL',
    kill_participation: 'GAME_SENSE',
    objective_control: 'GAME_SENSE',
    vision_score: 'GAME_SENSE',
    jungle_proximity: 'CONSISTENCY',
  },
  // Mid: DPM, CS, Solo kills = Mechanical | Roam, KP, Vision = Game Sense
  MID: {
    damage_per_minute: 'MECHANICAL',
    cs_per_minute: 'MECHANICAL',
    solo_kills: 'MECHANICAL',
    roaming_impact: 'GAME_SENSE',
    kill_participation: 'GAME_SENSE',
    vision_score: 'GAME_SENSE',
  },
  // Top: DPM, CS, Solo kills = Mechanical | Lane control = Game Sense | Tanking, Split = Consistency
  TOP: {
    damage_per_minute: 'MECHANICAL',
    cs_per_minute: 'MECHANICAL',
    solo_kills: 'MECHANICAL',
    early_game_dominance: 'GAME_SENSE',
    durability_score: 'CONSISTENCY',
    split_push_pressure: 'CONSISTENCY',
  },
  // All Roles: Balanced overview
  all: {
    cs_per_minute: 'MECHANICAL',
    damage_share: 'MECHANICAL',
    kill_participation: 'GAME_SENSE',
    vision_score: 'GAME_SENSE',
    objective_control: 'GAME_SENSE',
    kda: 'CONSISTENCY',
  },
}

// Fallback category for unknown metrics
const DEFAULT_CATEGORIES: Record<string, 'MECHANICAL' | 'GAME_SENSE' | 'CONSISTENCY'> = {
  cs_per_minute: 'MECHANICAL',
  damage_per_minute: 'MECHANICAL',
  damage_share: 'MECHANICAL',
  solo_kills: 'MECHANICAL',
  objective_damage: 'MECHANICAL',
  kill_participation: 'GAME_SENSE',
  vision_score: 'GAME_SENSE',
  vision_score_per_minute: 'GAME_SENSE',
  objective_control: 'GAME_SENSE',
  roaming_impact: 'GAME_SENSE',
  jungle_proximity: 'GAME_SENSE',
  early_game_impact: 'GAME_SENSE',
  early_game_dominance: 'GAME_SENSE',
  crowd_control_score: 'GAME_SENSE',
  kda: 'CONSISTENCY',
  gold_efficiency: 'CONSISTENCY',
  positioning_score: 'CONSISTENCY',
  death_efficiency: 'CONSISTENCY',
  durability_score: 'CONSISTENCY',
  split_push_pressure: 'CONSISTENCY',
}

// Get next rank for Focus Plan
function getNextRank(currentTier: string, currentRank: string | null): string {
  const tiers = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Challenger']
  const tierIndex = tiers.findIndex(t => t.toUpperCase() === currentTier?.toUpperCase())

  if (tierIndex === -1 || tierIndex >= tiers.length - 1) return 'Challenger'

  // If rank I, go to next tier
  if (currentRank === 'I') {
    return tiers[tierIndex + 1]
  }

  return tiers[tierIndex]
}

// Rank-based metric averages (mock data - these would come from aggregated player data)
// Format: { metricId: { RANK: average_value } }
const RANK_METRIC_AVERAGES: Record<string, Record<string, number>> = {
  cs_per_minute: {
    IRON: 4.2, BRONZE: 4.8, SILVER: 5.3, GOLD: 5.8, PLATINUM: 6.2,
    EMERALD: 6.6, DIAMOND: 7.1, MASTER: 7.5, GRANDMASTER: 7.8, CHALLENGER: 8.2
  },
  damage_per_minute: {
    IRON: 380, BRONZE: 420, SILVER: 480, GOLD: 540, PLATINUM: 600,
    EMERALD: 650, DIAMOND: 720, MASTER: 780, GRANDMASTER: 820, CHALLENGER: 880
  },
  damage_share: {
    IRON: 18, BRONZE: 19, SILVER: 20, GOLD: 21, PLATINUM: 22,
    EMERALD: 23, DIAMOND: 24, MASTER: 25, GRANDMASTER: 26, CHALLENGER: 27
  },
  kill_participation: {
    IRON: 45, BRONZE: 48, SILVER: 52, GOLD: 55, PLATINUM: 58,
    EMERALD: 61, DIAMOND: 64, MASTER: 67, GRANDMASTER: 70, CHALLENGER: 73
  },
  vision_score: {
    IRON: 0.6, BRONZE: 0.7, SILVER: 0.8, GOLD: 0.9, PLATINUM: 1.0,
    EMERALD: 1.1, DIAMOND: 1.2, MASTER: 1.3, GRANDMASTER: 1.4, CHALLENGER: 1.5
  },
  vision_score_per_minute: {
    IRON: 0.5, BRONZE: 0.6, SILVER: 0.7, GOLD: 0.8, PLATINUM: 0.9,
    EMERALD: 1.0, DIAMOND: 1.1, MASTER: 1.2, GRANDMASTER: 1.3, CHALLENGER: 1.4
  },
  objective_control: {
    IRON: 35, BRONZE: 38, SILVER: 42, GOLD: 46, PLATINUM: 50,
    EMERALD: 54, DIAMOND: 58, MASTER: 62, GRANDMASTER: 66, CHALLENGER: 70
  },
  kda: {
    IRON: 1.8, BRONZE: 2.0, SILVER: 2.3, GOLD: 2.6, PLATINUM: 2.9,
    EMERALD: 3.2, DIAMOND: 3.5, MASTER: 3.8, GRANDMASTER: 4.1, CHALLENGER: 4.5
  },
  gold_efficiency: {
    IRON: 85, BRONZE: 87, SILVER: 89, GOLD: 91, PLATINUM: 93,
    EMERALD: 95, DIAMOND: 97, MASTER: 98, GRANDMASTER: 99, CHALLENGER: 100
  },
  objective_damage: {
    IRON: 1800, BRONZE: 2100, SILVER: 2400, GOLD: 2700, PLATINUM: 3000,
    EMERALD: 3300, DIAMOND: 3600, MASTER: 3900, GRANDMASTER: 4200, CHALLENGER: 4500
  },
  positioning_score: {
    IRON: 40, BRONZE: 45, SILVER: 50, GOLD: 55, PLATINUM: 60,
    EMERALD: 65, DIAMOND: 70, MASTER: 75, GRANDMASTER: 80, CHALLENGER: 85
  },
  solo_kills: {
    IRON: 0.3, BRONZE: 0.4, SILVER: 0.5, GOLD: 0.6, PLATINUM: 0.7,
    EMERALD: 0.8, DIAMOND: 0.9, MASTER: 1.0, GRANDMASTER: 1.1, CHALLENGER: 1.2
  },
  roaming_impact: {
    IRON: 25, BRONZE: 30, SILVER: 35, GOLD: 40, PLATINUM: 45,
    EMERALD: 50, DIAMOND: 55, MASTER: 60, GRANDMASTER: 65, CHALLENGER: 70
  },
  early_game_impact: {
    IRON: 30, BRONZE: 35, SILVER: 40, GOLD: 45, PLATINUM: 50,
    EMERALD: 55, DIAMOND: 60, MASTER: 65, GRANDMASTER: 70, CHALLENGER: 75
  },
  crowd_control_score: {
    IRON: 15, BRONZE: 18, SILVER: 21, GOLD: 24, PLATINUM: 27,
    EMERALD: 30, DIAMOND: 33, MASTER: 36, GRANDMASTER: 39, CHALLENGER: 42
  },
  death_efficiency: {
    IRON: 50, BRONZE: 55, SILVER: 60, GOLD: 65, PLATINUM: 70,
    EMERALD: 75, DIAMOND: 80, MASTER: 85, GRANDMASTER: 88, CHALLENGER: 92
  },
  jungle_proximity: {
    IRON: 35, BRONZE: 38, SILVER: 42, GOLD: 46, PLATINUM: 50,
    EMERALD: 54, DIAMOND: 58, MASTER: 62, GRANDMASTER: 66, CHALLENGER: 70
  },
  early_game_dominance: {
    IRON: 30, BRONZE: 35, SILVER: 40, GOLD: 45, PLATINUM: 50,
    EMERALD: 55, DIAMOND: 60, MASTER: 65, GRANDMASTER: 70, CHALLENGER: 75
  },
  durability_score: {
    IRON: 40, BRONZE: 45, SILVER: 50, GOLD: 55, PLATINUM: 60,
    EMERALD: 65, DIAMOND: 70, MASTER: 75, GRANDMASTER: 80, CHALLENGER: 85
  },
  split_push_pressure: {
    IRON: 20, BRONZE: 25, SILVER: 30, GOLD: 35, PLATINUM: 40,
    EMERALD: 45, DIAMOND: 50, MASTER: 55, GRANDMASTER: 60, CHALLENGER: 65
  },
}

// Helper to get rank average for a metric
function getRankAverage(metricId: string, rank: string | null): number | undefined {
  if (!rank) return undefined
  const upperRank = rank.toUpperCase()
  return RANK_METRIC_AVERAGES[metricId]?.[upperRank]
}

// Player Archetype Definitions
interface PlayerArchetype {
  id: string
  name: string
  description: string
  icon: string // Emoji icon
  gradient: string // Tailwind gradient classes
  borderColor: string
}

const ARCHETYPES: Record<string, PlayerArchetype> = {
  bloodthirster: {
    id: 'bloodthirster',
    name: 'Bloodthirster',
    description: 'Lives for the kill, deals massive damage',
    icon: '🗡️',
    gradient: 'from-red-500/20 to-orange-500/10',
    borderColor: 'border-red-500/30'
  },
  lane_kingdom: {
    id: 'lane_kingdom',
    name: 'Lane Kingdom',
    description: 'Dominates lane phase with superior farming',
    icon: '👑',
    gradient: 'from-amber-500/20 to-yellow-500/10',
    borderColor: 'border-amber-500/30'
  },
  vision_oracle: {
    id: 'vision_oracle',
    name: 'Vision Oracle',
    description: 'Map awareness master, controls information',
    icon: '👁️',
    gradient: 'from-purple-500/20 to-indigo-500/10',
    borderColor: 'border-purple-500/30'
  },
  late_bloomer: {
    id: 'late_bloomer',
    name: 'Late Bloomer',
    description: 'Steady player who shines in late game',
    icon: '🌸',
    gradient: 'from-pink-500/20 to-rose-500/10',
    borderColor: 'border-pink-500/30'
  },
  first_blood: {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Early game terror, loves to fight',
    icon: '⚔️',
    gradient: 'from-orange-500/20 to-red-500/10',
    borderColor: 'border-orange-500/30'
  },
  objective_hunter: {
    id: 'objective_hunter',
    name: 'Objective Hunter',
    description: 'Dragon/Baron focused, macro player',
    icon: '🐉',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'border-emerald-500/30'
  },
  team_soul: {
    id: 'team_soul',
    name: 'Team Soul',
    description: 'Always there for the team',
    icon: '🤝',
    gradient: 'from-cyan-500/20 to-blue-500/10',
    borderColor: 'border-cyan-500/30'
  },
  iron_will: {
    id: 'iron_will',
    name: 'Iron Will',
    description: 'Hard to kill, plays safe and smart',
    icon: '🛡️',
    gradient: 'from-slate-500/20 to-zinc-500/10',
    borderColor: 'border-slate-500/30'
  }
}

// Determine player archetype based on metrics
function determineArchetype(metrics: MetricData[]): PlayerArchetype {
  // Calculate scores for each archetype based on metric performance
  const scores: Record<string, number> = {
    bloodthirster: 0,
    lane_kingdom: 0,
    vision_oracle: 0,
    late_bloomer: 0,
    first_blood: 0,
    objective_hunter: 0,
    team_soul: 0,
    iron_will: 0
  }

  metrics.forEach(metric => {
    const percentile = metric.percentile || 50
    const aboveAvg = metric.value > (metric.polishAverage || 0)
    const score = aboveAvg ? (100 - percentile) : -(percentile)

    switch (metric.id) {
      // Bloodthirster: High damage metrics
      case 'damage_per_minute':
      case 'damage_share':
        scores.bloodthirster += score * 1.5
        break

      // Lane Kingdom: CS and solo dominance
      case 'cs_per_minute':
        scores.lane_kingdom += score * 2
        break
      case 'solo_kills':
        scores.lane_kingdom += score * 1.5
        scores.first_blood += score * 1.2
        break

      // Vision Oracle: Vision control
      case 'vision_score':
      case 'vision_score_per_minute':
        scores.vision_oracle += score * 2
        break

      // Late Bloomer: Consistency and efficiency
      case 'gold_efficiency':
      case 'positioning_score':
        scores.late_bloomer += score * 1.5
        scores.iron_will += score
        break

      // First Blood: Early game aggression
      case 'early_game_impact':
      case 'early_game_dominance':
        scores.first_blood += score * 2
        break

      // Objective Hunter: Objective control
      case 'objective_control':
      case 'objective_damage':
        scores.objective_hunter += score * 2
        break

      // Team Soul: Team participation
      case 'kill_participation':
        scores.team_soul += score * 2
        break
      case 'roaming_impact':
        scores.team_soul += score * 1.5
        break
      case 'crowd_control_score':
        scores.team_soul += score
        break

      // Iron Will: Survivability
      case 'kda':
        scores.iron_will += score * 1.5
        scores.late_bloomer += score
        break
      case 'death_efficiency':
      case 'durability_score':
        scores.iron_will += score * 1.5
        break
    }
  })

  // Find the archetype with highest score
  let maxScore = -Infinity
  let bestArchetype = 'late_bloomer' // Default fallback

  Object.entries(scores).forEach(([archetype, score]) => {
    if (score > maxScore) {
      maxScore = score
      bestArchetype = archetype
    }
  })

  return ARCHETYPES[bestArchetype]
}

export default function InsightsTab({ summonerName, defaultRole }: InsightsTabProps) {
  const [roleStats, setRoleStats] = useState<RoleStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<string>(defaultRole || 'all')
  const [selectedGames, setSelectedGames] = useState(20)
  const [selectedServer, setSelectedServer] = useState<'EUNE' | 'EUW' | 'PL'>('EUNE')
  const [hasUserChangedRole, setHasUserChangedRole] = useState(false)

  // Update selected role when defaultRole is loaded (but only if user hasn't manually changed it)
  useEffect(() => {
    if (defaultRole && !hasUserChangedRole) {
      setSelectedRole(defaultRole)
    }
  }, [defaultRole, hasUserChangedRole])

  useEffect(() => {
    async function fetchRoleStats() {
      setLoading(true)
      try {
        const res = await fetch(`/api/player/${summonerName}/role-stats?role=${selectedRole}&games=${selectedGames}`)
        const data = await res.json()
        if (!data.error) {
          setRoleStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch role stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoleStats()
  }, [summonerName, selectedRole, selectedGames])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (!roleStats || !roleStats.metrics) {
    return (
      <div className="text-center py-20 text-gray-400">
        No stats available. Play more ranked games!
      </div>
    )
  }

  // Filter metrics with valid Polish averages
  const validMetrics = roleStats.metrics.filter(m => m.polishAverage !== undefined && m.polishAverage !== null)

  if (validMetrics.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        Setting up your insights... We're collecting comparison data.
      </div>
    )
  }

  // Calculate X-RAY Score - filter to metrics with valid percentile
  const metricsWithPercentile = validMetrics
    .filter(m => m.percentile !== undefined)
    .map(m => ({ ...m, percentile: m.percentile as number }))
  const rawScore = calculateXRayScore(metricsWithPercentile)
  const xrayScore = Math.round((rawScore / 1200) * 1000)
  const overallPercentile = getOverallPercentile(metricsWithPercentile)

  // Find weak metrics (below average)
  const weakMetrics = validMetrics
    .filter(m => m.value < (m.polishAverage || 0))
    .sort((a, b) => {
      const diffA = ((a.polishAverage! - a.value) / a.polishAverage!) * 100
      const diffB = ((b.polishAverage! - b.value) / b.polishAverage!) * 100
      return diffB - diffA
    })

  // Get server display name
  const getServerDisplayName = () => {
    switch (selectedServer) {
      case 'PL': return 'Poland'
      case 'EUW': return 'EUW'
      case 'EUNE': return 'EUNE'
      default: return selectedServer
    }
  }

  // Get estimated player pool for selected server
  const getServerPlayerPool = () => {
    switch (selectedServer) {
      case 'PL': return 85203 // Polish players
      case 'EUNE': return 1200000 // EUNE total
      case 'EUW': return 2800000 // EUW total
      default: return 85203
    }
  }

  const serverPlayerPool = getServerPlayerPool()
  const serverDisplayName = getServerDisplayName()

  // Rank position - calculated based on selected server's player pool
  const estimatedRankPosition = Math.max(1, Math.round((overallPercentile / 100) * serverPlayerPool))
  const roleLabel = selectedRole === 'all' ? '' : ` ${selectedRole}`

  // Next rank target
  const nextRank = getNextRank(roleStats.currentTier || 'Gold', roleStats.currentRank || 'II')

  // Regional context generator
  const getRegionalContext = (percentile: number) => {
    const regionName = selectedServer === 'PL' ? 'Poland' : selectedServer
    if (percentile <= 5) return `Top 5% in ${regionName}`
    if (percentile <= 15) return `Top 15% in ${regionName}`
    if (percentile <= 30) return `Above average in ${regionName}`
    if (percentile <= 50) return 'Average for your rank'
    return 'Below average for your rank'
  }

  // Get player's rank for comparison
  const playerRank = roleStats.currentTier?.toUpperCase() || null
  const rankLabel = playerRank ? playerRank.charAt(0) + playerRank.slice(1).toLowerCase() : undefined

  // Determine player archetype
  const playerArchetype = determineArchetype(validMetrics)

  return (
    <div className="space-y-6">
      {/* Header Row: Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          {/* Filters */}
          <div className="flex gap-3 items-center">
            {/* Role Filter */}
            <div className="flex items-center gap-1 bg-[#151b28] rounded-lg p-1 border border-[#1e2836]">
              {['all', 'TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'].map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setSelectedRole(role)
                    setHasUserChangedRole(true)
                  }}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all outline-none ${
                    selectedRole === role
                      ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/50'
                      : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  {role === 'all' ? 'All Roles' : role.charAt(0) + role.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Games Filter */}
            <div className="flex items-center gap-1 bg-[#151b28] rounded-lg p-1 border border-[#1e2836]">
              {[10, 20, 50].map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedGames(num)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all outline-none ${
                    selectedGames === num
                      ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/50'
                      : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  Last {num} Games
                </button>
              ))}
            </div>

            {/* Server Filter */}
            <div className="flex items-center gap-1 bg-[#151b28] rounded-lg p-1 border border-[#1e2836]">
              {(['EUNE', 'EUW', 'PL'] as const).map((server) => (
                <button
                  key={server}
                  onClick={() => setSelectedServer(server)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all outline-none ${
                    selectedServer === server
                      ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/50'
                      : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  {server}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: National Rank Card + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Regional Rank Card (3 cols) */}
        <div className="lg:col-span-3">
          <div className="bg-[#0f121d] rounded-xl border border-[#1e2836] p-5 h-full">
            {/* Server Flag/Icon */}
            <div className="flex items-center gap-3 mb-4">
              {selectedServer === 'PL' ? (
                <div className="w-10 h-6 rounded overflow-hidden border border-white/10">
                  <div className="w-full h-1/2 bg-[#E9E8E7]"></div>
                  <div className="w-full h-1/2 bg-[#D4213D]"></div>
                </div>
              ) : (
                <div className="w-10 h-6 rounded overflow-hidden border border-white/10 bg-[#151b28] flex items-center justify-center">
                  <span className="text-xs font-bold text-cyan-400">{selectedServer}</span>
                </div>
              )}
              <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                {selectedServer === 'PL' ? 'National rank' : 'Regional rank'}
              </div>
            </div>

            {/* Big Rank Number */}
            <div className="mb-4">
              <div className="text-3xl font-bold text-white font-mono mb-1">
                #{estimatedRankPosition.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">
                Top <span className="text-cyan-400 font-bold">{overallPercentile}%</span> in {serverDisplayName}
              </div>
            </div>

            {/* Player Archetype */}
            <div className={`mb-4 p-3 rounded-lg bg-gradient-to-r ${playerArchetype.gradient} border ${playerArchetype.borderColor}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{playerArchetype.icon}</span>
                <span className="text-sm font-bold text-white">{playerArchetype.name}</span>
              </div>
              <p className="text-xs text-gray-400">{playerArchetype.description}</p>
            </div>

            {/* Rank Badge */}
            {rankLabel && (
              <div className="p-4 bg-[#151b28] rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src={`/ranks/${playerRank}.png`}
                    alt={rankLabel}
                    className="w-12 h-12"
                  />
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Your rank</div>
                    <div className="text-lg font-bold text-white">{rankLabel}</div>
                  </div>
                </div>

                {/* Role-specific rank */}
                {selectedRole !== 'all' && (
                  <div className="mt-4 pt-4 border-t border-[#1e2836]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {selectedRole} in {serverDisplayName}
                      </span>
                      <span className="text-base font-bold text-cyan-400">
                        #{Math.max(1, Math.round(estimatedRankPosition * 0.2)).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ~{Math.round(serverPlayerPool * 0.2).toLocaleString()} {selectedRole} players
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Metrics Grid (9 cols) */}
        <div className="lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {validMetrics.slice(0, 6).map(metric => (
              <CompactMetricCard
                key={metric.id}
                id={metric.id}
                name={metric.name}
                value={metric.value}
                polishAverage={metric.polishAverage || 0}
                percentile={metric.percentile || 50}
                categoryColor="cyan"
                regionalContext={getRegionalContext(metric.percentile || 50)}
                rankAverage={getRankAverage(metric.id, playerRank)}
                rankLabel={rankLabel}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Focus Plan + Duo Partner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Focus Plan Section (2 columns) */}
        <div className="lg:col-span-2 bg-[#0f121d] rounded-xl border border-[#1e2836] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_cyan]"></div>
            <h2 className="text-lg font-bold text-white">Focus plan</h2>
            <span className="text-xs text-gray-400">· Path to {nextRank}</span>
          </div>
          <FocusPlanSidebar
            targetRank={nextRank}
            weakMetrics={weakMetrics.map(m => ({
              id: m.id,
              name: m.name,
              value: m.value,
              polishAverage: m.polishAverage || 0,
              percentile: m.percentile
            }))}
            allMetrics={validMetrics.map(m => ({
              id: m.id,
              name: m.name,
              value: m.value,
              polishAverage: m.polishAverage || 0,
              percentile: m.percentile
            }))}
            role={roleStats.role}
            horizontal={true}
            hideDuoCard={true}
          />
        </div>

        {/* Duo Partner Card (1 column - standalone) */}
        <div className="lg:col-span-1">
          <FocusPlanSidebar
            targetRank={nextRank}
            weakMetrics={[]}
            role={roleStats.role}
            horizontal={true}
            duoCardOnly={true}
          />
        </div>
      </div>
    </div>
  )
}
