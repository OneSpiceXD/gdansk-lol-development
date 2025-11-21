import React from 'react'
import { getMetricIcon } from '@/lib/metricIcons'

interface FocusMetricCardProps {
  metricId: string
  metricName: string
  currentValue: number
  targetValue: number
  targetRank: string
  improvementPercent: number
  unit?: string
  advice: string
}

export default function FocusMetricCard({
  metricId,
  metricName,
  currentValue,
  targetValue,
  targetRank,
  improvementPercent,
  unit = '',
  advice
}: FocusMetricCardProps) {
  const Icon = getMetricIcon(metricId)
  const progressPercent = Math.min((currentValue / targetValue) * 100, 100)

  return (
    <div
      className="relative rounded-lg p-8 border-[3px]"
      style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%)',
        borderColor: '#8B5CF6',
        boxShadow: '0 0 40px rgba(139, 92, 246, 0.4), inset 0 0 60px rgba(139, 92, 246, 0.1)'
      }}
    >
      {/* Header with badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="px-4 py-2 rounded-md text-sm font-bold bg-purple-500/30 text-purple-200 border-2 border-purple-400/50 shadow-lg">
          ⚡ SKILL TO FOCUS
        </div>
        <div className="text-xs text-purple-300">
          Path to {targetRank}
        </div>
      </div>

      {/* Metric name with large icon */}
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-purple-900/30 rounded-lg p-3">
          <Icon size={32} className="text-purple-300" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-purple-100">{metricName}</h3>
          <p className="text-sm text-purple-300">Your weakest metric vs your rank</p>
        </div>
      </div>

      {/* Current vs Target comparison */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Current Value */}
        <div className="bg-purple-900/30 rounded-lg p-4 text-center">
          <div className="text-xs text-purple-400 mb-1">Current</div>
          <div className="text-3xl font-bold text-white">
            {currentValue.toFixed(currentValue >= 10 ? 1 : 2)}
            <span className="text-lg text-gray-400">{unit}</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>

        {/* Target Value */}
        <div className="bg-cyan-900/30 rounded-lg p-4 text-center border-2 border-cyan-500/30">
          <div className="text-xs text-cyan-400 mb-1">Target</div>
          <div className="text-3xl font-bold text-cyan-300">
            {targetValue.toFixed(targetValue >= 10 ? 1 : 2)}
            <span className="text-lg text-gray-400">{unit}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-purple-300">Your progress</span>
          <span className="text-sm font-bold text-cyan-400">
            {progressPercent.toFixed(0)}% of target
          </span>
        </div>
        <div className="h-3 bg-purple-900/30 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Improvement needed callout */}
      <div className="bg-purple-900/40 border-l-4 border-cyan-400 rounded-r-lg p-4 mb-6">
        <div className="text-xs text-purple-300 mb-1">Improvement needed</div>
        <div className="text-xl font-bold text-cyan-300">
          +{improvementPercent.toFixed(0)}%
        </div>
        <div className="text-xs text-gray-400 mt-1">
          to reach {targetRank}
        </div>
      </div>

      {/* Actionable advice */}
      <div className="bg-purple-900/20 rounded-lg p-5 border border-purple-500/30">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <div className="text-sm font-semibold text-purple-200 mb-2">How to improve</div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {advice}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
