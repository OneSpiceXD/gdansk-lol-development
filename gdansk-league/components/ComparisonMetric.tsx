'use client'

interface ComparisonMetricProps {
  name: string
  playerValue: number
  serverValue: number
  server?: 'PL' | 'EUW' | 'EUNE'
  rankValue?: number       // Optional rank average for comparison
  rankLabel?: string       // Label for rank (e.g., "Diamond", "Platinum")
  unit?: string
  className?: string
  lowerIsBetter?: boolean  // If true, lower values are better (e.g., death %)
}

export default function ComparisonMetric({
  name,
  playerValue,
  serverValue,
  server = 'EUNE',
  rankValue,
  rankLabel,
  unit = '',
  className = '',
  lowerIsBetter = false
}: ComparisonMetricProps) {
  // Calculate percentage difference vs server
  const difference = playerValue - serverValue
  const percentDiff = serverValue !== 0 ? (difference / serverValue) * 100 : 0
  const isAboveAverage = difference > 0

  // Calculate percentage difference vs rank (if provided)
  const rankDifference = rankValue !== undefined ? playerValue - rankValue : 0
  const rankPercentDiff = rankValue !== undefined && rankValue !== 0 ? (rankDifference / rankValue) * 100 : 0
  const isAboveRankAvg = rankDifference > 0

  // Determine if this is good or bad
  const isGood = lowerIsBetter ? !isAboveAverage : isAboveAverage
  const isGoodVsRank = lowerIsBetter ? !isAboveRankAvg : isAboveRankAvg

  // Calculate bar widths (max value determines 100%)
  const maxValue = Math.max(playerValue, serverValue, rankValue || 0)
  const playerBarWidth = Math.min((playerValue / maxValue) * 100, 100)
  const serverBarWidth = Math.min((serverValue / maxValue) * 100, 100)
  const rankBarWidth = rankValue !== undefined ? Math.min((rankValue / maxValue) * 100, 100) : 0

  return (
    <div className={`bg-[#151b28] rounded-lg p-4 border border-[#1e2836] ${className}`}>
      {/* Metric name */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-300">{name}</h4>
        <div className="flex items-center gap-2">
          {rankValue !== undefined && (
            <div className={`text-xs px-2 py-1 rounded font-medium ${
              isGoodVsRank
                ? 'bg-green-500/10 text-green-400'
                : 'bg-red-500/10 text-red-400'
            }`}>
              vs {rankLabel}: {isAboveRankAvg ? '+' : ''}{rankPercentDiff.toFixed(0)}%
            </div>
          )}
          <div className={`text-xs px-2 py-1 rounded font-medium ${
            isGood
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          }`}>
            vs {server}: {isAboveAverage ? '+' : ''}{percentDiff.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Player value */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-400">You</span>
          <span className="font-bold text-white">
            {playerValue.toFixed(1)}{unit}
          </span>
        </div>
        <div className="h-2 bg-[#0A0E27] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isGood ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ width: `${playerBarWidth}%` }}
          />
        </div>
      </div>

      {/* Rank average (if provided) */}
      {rankValue !== undefined && rankLabel && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-400">{rankLabel} average</span>
            <span className="font-bold text-purple-400">
              {rankValue.toFixed(1)}{unit}
            </span>
          </div>
          <div className="h-2 bg-[#0A0E27] rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${rankBarWidth}%` }}
            />
          </div>
        </div>
      )}

      {/* Server average */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-400">{server} average</span>
          <span className="font-bold text-gray-400">
            {serverValue.toFixed(1)}{unit}
          </span>
        </div>
        <div className="h-2 bg-[#0A0E27] rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-600 rounded-full transition-all duration-300"
            style={{ width: `${serverBarWidth}%` }}
          />
        </div>
      </div>
    </div>
  )
}
