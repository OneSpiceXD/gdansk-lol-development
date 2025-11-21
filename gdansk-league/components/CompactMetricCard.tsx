'use client'

import { useState } from 'react'
import { getMetricIcon } from '@/lib/metricIcons'

type MetricState = 'good' | 'average' | 'bad'

// Rank-based metric averages for all tiers
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

const RANK_ORDER = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER']

interface CompactMetricCardProps {
  id: string
  name: string
  value: number
  polishAverage: number
  percentile: number
  unit?: string
  categoryColor: 'cyan' | 'purple' | 'green'
  regionalContext?: string
  rankAverage?: number
  rankLabel?: string
}

export default function CompactMetricCard({
  id,
  name,
  value,
  polishAverage,
  percentile,
  unit = '',
  categoryColor,
  regionalContext,
  rankAverage,
  rankLabel
}: CompactMetricCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Determine metric state based on comparison to average
  const diff = value - polishAverage
  const diffPercent = ((diff / polishAverage) * 100)

  let state: MetricState = 'average'
  if (diffPercent > 5) state = 'good'
  if (diffPercent < -10) state = 'bad'

  // Color mappings
  const stateColors = {
    good: {
      badge: 'bg-emerald-500/10 text-emerald-400',
      border: 'border-gray-800 hover:border-emerald-500/30',
      bar: 'bg-emerald-500',
      glow: ''
    },
    average: {
      badge: 'bg-amber-500/10 text-amber-400',
      border: 'border-gray-800 hover:border-gray-600',
      bar: 'bg-amber-500',
      glow: ''
    },
    bad: {
      badge: 'bg-red-500/10 text-red-400',
      border: 'border-red-500/40',
      bar: 'bg-red-500',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]'
    }
  }

  const colors = stateColors[state]
  const Icon = getMetricIcon(id)

  // Format value display
  const formatValue = (val: number) => {
    if (val >= 100) return val.toFixed(0)
    if (val >= 10) return val.toFixed(1)
    return val.toFixed(2)
  }

  // Get rank averages for this metric
  const metricRankAverages = RANK_METRIC_AVERAGES[id] || {}
  const hasRankData = Object.keys(metricRankAverages).length > 0

  // Find where player's value falls among ranks
  const getPlayerRankPlacement = () => {
    if (!hasRankData) return null

    // Find the highest rank the player beats
    let placementRank = 'IRON'
    for (const rank of RANK_ORDER) {
      if (metricRankAverages[rank] && value >= metricRankAverages[rank]) {
        placementRank = rank
      }
    }
    return placementRank
  }

  const playerPlacement = getPlayerRankPlacement()

  return (
    <>
      <div
        onClick={() => hasRankData && setIsExpanded(true)}
        className={`bg-[#0f121d] p-4 rounded-xl border transition-all ${colors.border} ${colors.glow} ${hasRankData ? 'cursor-pointer' : ''}`}
      >
        {/* Header: Name */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Icon size={14} className="text-gray-500" />
            <span className="text-xs text-gray-400 font-medium">{name}</span>
          </div>
          {hasRankData && (
            <span className="text-[10px] text-gray-600">Click for details</span>
          )}
        </div>

        {/* Large Value */}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-2xl font-mono font-bold text-white">
            {formatValue(value)}
          </span>
          {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>

        {/* Comparison Rows with Bars */}
        <div className="space-y-3">
          {/* Your value bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">You</span>
              <span className="font-bold text-white">{formatValue(value)}</span>
            </div>
            <div className="h-2 bg-[#0A0E27] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  rankAverage !== undefined && value >= rankAverage ? 'bg-emerald-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((value / Math.max(value, rankAverage || value)) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* vs Rank bar */}
          {rankAverage !== undefined && rankLabel && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1.5">
                  <img
                    src={`/ranks/${rankLabel?.toUpperCase()}.png`}
                    alt={rankLabel}
                    className="w-3.5 h-3.5"
                  />
                  <span className="text-gray-400">{rankLabel} avg</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{formatValue(rankAverage)}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    value > rankAverage ? 'bg-emerald-500/10 text-emerald-400' :
                    value < rankAverage ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {value > rankAverage ? '+' : ''}{(((value - rankAverage) / rankAverage) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-[#0A0E27] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((rankAverage / Math.max(value, rankAverage)) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Modal */}
      {isExpanded && hasRankData && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="bg-[#0f121d] rounded-xl border border-[#1e2836] p-6 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Icon size={20} className="text-cyan-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">{name}</h3>
                  <p className="text-sm text-gray-400">Rank placement comparison</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white p-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Player Value Display */}
            <div className="bg-[#151b28] rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Your {name}</div>
                  <div className="text-3xl font-mono font-bold text-white">
                    {formatValue(value)}{unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
                  </div>
                </div>
                {playerPlacement && (
                  <div className="text-right">
                    <div className="text-sm text-gray-400 mb-1">Performs at</div>
                    <div className="flex items-center gap-2">
                      <img
                        src={`/ranks/${playerPlacement}.png`}
                        alt={playerPlacement}
                        className="w-8 h-8"
                      />
                      <span className="text-lg font-bold text-cyan-400">
                        {playerPlacement.charAt(0) + playerPlacement.slice(1).toLowerCase()} level
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rank Bars Visualization */}
            <div className="space-y-2">
              {RANK_ORDER.map((rank) => {
                const rankAvg = metricRankAverages[rank]
                if (!rankAvg) return null

                const maxValue = Math.max(value, ...Object.values(metricRankAverages))
                const barWidth = (rankAvg / maxValue) * 100
                const playerBarWidth = (value / maxValue) * 100
                const isAboveThisRank = value >= rankAvg
                const isPlayerRank = rankLabel?.toUpperCase() === rank
                const isPerformanceRank = playerPlacement === rank

                return (
                  <div
                    key={rank}
                    className={`flex items-center gap-3 px-2 py-1 rounded-lg transition-all ${
                      isPerformanceRank
                        ? 'bg-cyan-500/10 border border-cyan-500/30'
                        : ''
                    }`}
                  >
                    {/* Rank Icon */}
                    <div className="w-7 h-7 flex-shrink-0">
                      <img
                        src={`/ranks/${rank}.png`}
                        alt={rank}
                        className={`w-full h-full ${isAboveThisRank ? 'opacity-100' : 'opacity-40'}`}
                      />
                    </div>

                    {/* Bar Container */}
                    <div className="flex-1 relative">
                      <div className="h-6 bg-[#0A0E27] rounded overflow-hidden relative">
                        {/* Rank Average Bar */}
                        <div
                          className={`h-full transition-all duration-300 ${
                            isPerformanceRank ? 'bg-cyan-600' : isAboveThisRank ? 'bg-gray-600' : 'bg-gray-700'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />

                        {/* Player Value Indicator */}
                        <div
                          className="absolute top-0 h-full w-0.5 bg-cyan-400"
                          style={{ left: `${playerBarWidth}%` }}
                        />
                      </div>
                    </div>

                    {/* Value */}
                    <div className={`w-14 text-right text-sm font-mono ${
                      isPerformanceRank ? 'text-cyan-300 font-bold' : isAboveThisRank ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {formatValue(rankAvg)}
                    </div>

                    {/* Comparison Badge */}
                    <div className="w-24 flex-shrink-0">
                      {isPerformanceRank ? (
                        <span className="text-[10px] px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 font-bold whitespace-nowrap">
                          YOU PLAY HERE
                        </span>
                      ) : isPlayerRank ? (
                        <span className="text-[10px] px-2 py-1 rounded bg-purple-500/20 text-purple-400 font-bold whitespace-nowrap">
                          YOUR RANK
                        </span>
                      ) : isAboveThisRank ? (
                        <span className="text-[10px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">
                          +{(((value - rankAvg) / rankAvg) * 100).toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-400">
                          {(((value - rankAvg) / rankAvg) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-[#1e2836] flex items-center justify-center gap-4 text-xs text-gray-400 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-sm"></div>
                <span>Your value</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-600 rounded-sm"></div>
                <span>Performance level</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-600 rounded-sm"></div>
                <span>Rank average</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
