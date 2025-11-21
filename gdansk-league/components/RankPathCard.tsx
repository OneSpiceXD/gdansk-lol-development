import React from 'react'
import { RankProgressionPlan, formatImprovementText } from '@/lib/rankProgressionCalculator'
import RankIcon from './RankIcon'
import { type TierName } from '@/lib/tierCalculator'

interface RankPathCardProps {
  progressionPlan: RankProgressionPlan
}

export default function RankPathCard({ progressionPlan }: RankPathCardProps) {
  const { nextDivision, nextTier, improvementsForNextDivision, improvementsForNextTier, recommendedFocus } = progressionPlan

  return (
    <div className="bg-[#0f1420] rounded-lg p-6 border border-gray-800">
      <h3 className="text-lg font-bold text-white mb-6">
        🎯 Your path to rank up
      </h3>

      {/* Next Division Target */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <RankIcon tier={nextDivision.targetTier as TierName} size={32} />
          <div>
            <div className="text-xs text-gray-400">Next rank</div>
            <div className="text-sm font-bold text-white">{nextDivision.displayText}</div>
          </div>
        </div>

        {/* Recommended Focus */}
        <div className="bg-[#151b28] rounded-lg p-4 border-l-2 border-[#00D4FF]">
          <div className="text-xs font-medium text-[#00D4FF] mb-2">
            🎯 Best path forward
          </div>
          <div className="text-sm text-white mb-1">
            {formatImprovementText(recommendedFocus)}
          </div>
          <div className="text-xs text-gray-400">
            This will have the biggest impact on your X-Ray score
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 my-6"></div>

      {/* Next Tier Milestone */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <RankIcon tier={nextTier.targetTier as TierName} size={32} />
          <div>
            <div className="text-xs text-gray-400">Next tier milestone</div>
            <div className="text-sm font-bold text-white">{nextTier.displayText}</div>
          </div>
        </div>

        {/* Multiple Improvement Paths */}
        <div className="space-y-2">
          <div className="text-xs text-gray-400 mb-2">
            Multiple paths to get there:
          </div>
          {improvementsForNextTier.slice(0, 3).map((improvement, idx) => (
            <div
              key={improvement.metricId}
              className="bg-[#151b28] rounded-lg p-3"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="text-xs font-medium text-white">
                  {idx + 1}. {improvement.metricName}
                </div>
                <div className="text-xs font-bold text-[#00D4FF]">
                  +{improvement.improvementPercent.toFixed(0)}%
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {improvement.currentValue.toFixed(1)} → {improvement.targetValue.toFixed(1)}
              </div>
            </div>
          ))}
        </div>

        {/* Contextual Tip */}
        <div className="mt-4 text-xs text-gray-500 italic">
          Focus on one path at a time for fastest results
        </div>
      </div>
    </div>
  )
}
