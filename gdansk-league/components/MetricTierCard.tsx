'use client'

import RankIcon from './RankIcon'
import { getTierFromPercentile } from '@/lib/tierCalculator'
import { getMetricIcon } from '@/lib/metricIcons'

interface MetricTierCardProps {
  id: string
  name: string
  value: number
  percentile: number
  pointContribution: number
  polishAverage?: number
  playerRank?: string // e.g., "PLATINUM", "GOLD"
  unit?: string
  className?: string
  isFocus?: boolean // Highlight as "Skill to Focus"
  targetValue?: number // Target value to reach next rank
  targetRank?: string // e.g., "Gold I" - the rank you'll reach
}

export default function MetricTierCard({
  id,
  name,
  value,
  percentile,
  pointContribution,
  polishAverage,
  playerRank = 'PLATINUM',
  unit = '',
  className = '',
  isFocus = false,
  targetValue,
  targetRank
}: MetricTierCardProps) {
  const tier = getTierFromPercentile(percentile)
  const Icon = getMetricIcon(id)

  // Calculate performance comparison
  const hasComparison = polishAverage !== undefined && polishAverage !== null
  const benchmarkValue = polishAverage || value
  const isAboveAverage = hasComparison && value >= benchmarkValue

  // Calculate bar widths (0-100%)
  const maxValue = Math.max(value, benchmarkValue)
  const playerBarWidth = (value / maxValue) * 100
  const benchmarkBarWidth = (benchmarkValue / maxValue) * 100

  // Format rank label for display
  const formatRankLabel = (rank: string) => {
    return rank.charAt(0) + rank.slice(1).toLowerCase()
  }

  return (
    <div
      className={`relative rounded-lg transition-all hover:scale-[1.02] ${className} ${
        isFocus ? 'p-6 border-[3px]' : 'p-4 border-2'
      }`}
      style={{
        background: isFocus
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%)'
          : '#151b28',
        borderColor: isFocus ? '#8B5CF6' : tier.color + '40',
        boxShadow: isFocus
          ? '0 0 40px rgba(139, 92, 246, 0.4), inset 0 0 60px rgba(139, 92, 246, 0.1)'
          : `0 0 10px ${tier.color}10`
      }}
    >
      {/* Focus Badge - Centered at top */}
      {isFocus && (
        <div className="flex justify-center mb-3">
          <div className="px-3 py-1.5 rounded-md text-xs font-bold bg-purple-500/30 text-purple-200 border-2 border-purple-400/50 shadow-lg">
            ⚡ SKILL TO FOCUS
          </div>
        </div>
      )}

      {/* Small Rank Icon - Top Right */}
      <div className={`absolute ${isFocus ? 'top-3 right-3' : 'top-2 right-2'}`}>
        <RankIcon tier={tier.name} size={isFocus ? 28 : 24} />
      </div>

      {/* Metric name with icon */}
      <div className={`flex items-center gap-2 ${isFocus ? 'mb-5' : 'mb-4 mt-1'}`}>
        <Icon size={isFocus ? 22 : 18} className={isFocus ? 'text-purple-300' : 'text-gray-400'} />
        <span className={`${isFocus ? 'text-base' : 'text-sm'} font-semibold ${isFocus ? 'text-purple-200' : 'text-gray-300'}`}>
          {name}
        </span>
      </div>

      {/* Comparison Numbers - Mobalytics Style */}
      <div className="flex items-baseline gap-2 mb-4">
        <div className={`${isFocus ? 'text-4xl' : 'text-3xl'} font-bold ${isFocus ? 'text-purple-100' : 'text-white'}`}>
          {value.toFixed(value >= 10 ? 1 : 2)}
        </div>
        <div className={`text-lg ${isFocus ? 'text-purple-300' : 'text-gray-500'}`}>vs</div>
        <div className={`${isFocus ? 'text-3xl' : 'text-2xl'} font-semibold text-gray-400`}>
          {benchmarkValue.toFixed(benchmarkValue >= 10 ? 1 : 2)}
        </div>
        {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
      </div>

      {/* Horizontal Comparison Bars */}
      <div className="space-y-2 mb-3">
        {/* Player Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className={isFocus ? 'text-purple-300' : 'text-gray-400'}>You</span>
          </div>
          <div className={`w-full bg-[#1e2836] rounded-full ${isFocus ? 'h-3' : 'h-2'} overflow-hidden`}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${playerBarWidth}%`,
                background: isAboveAverage
                  ? 'linear-gradient(90deg, #22C55E, #16A34A)'
                  : 'linear-gradient(90deg, #EF4444, #DC2626)'
              }}
            />
          </div>
        </div>

        {/* Benchmark Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className={isFocus ? 'text-purple-400' : 'text-gray-500'}>vs {formatRankLabel(playerRank)}</span>
          </div>
          <div className={`w-full bg-[#1e2836] rounded-full ${isFocus ? 'h-3' : 'h-2'} overflow-hidden`}>
            <div
              className="h-full rounded-full bg-gray-600 transition-all"
              style={{ width: `${benchmarkBarWidth}%` }}
            />
          </div>
        </div>
      </div>

      {/* Focus message with target */}
      {isFocus && (
        <div className="mt-4 pt-3 border-t border-purple-500/30">
          {targetValue && targetRank ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-400">Target for {targetRank}:</span>
                <span className="text-sm font-bold text-cyan-400">
                  {targetValue.toFixed(targetValue >= 10 ? 1 : 2)}{unit}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-purple-900/30 rounded-full h-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                    style={{
                      width: `${Math.min((value / targetValue) * 100, 100)}%`
                    }}
                  />
                </div>
                <span className="text-xs text-purple-300">
                  {Math.round((value / targetValue) * 100)}%
                </span>
              </div>
              <p className="text-xs text-purple-300 leading-relaxed">
                +{((targetValue - value) / value * 100).toFixed(0)}% improvement needed
              </p>
            </div>
          ) : (
            <p className="text-xs text-purple-300 leading-relaxed">
              Focusing on this skill will bring the most immediate improvements to your play.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
