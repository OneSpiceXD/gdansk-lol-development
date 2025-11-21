'use client'

import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { getMetricIcon } from '@/lib/metricIcons'

interface RadarDataPoint {
  metric: string
  metricId: string
  player: number
  average: number
  fullMark: number
}

interface RadarChartProps {
  data: {
    id: string
    name: string
    value: number
    percentile: number
    polishAverage?: number
    euwAverage?: number
    euneAverage?: number
  }[]
  server: 'PL' | 'EUW' | 'EUNE'
  className?: string
}

export default function RadarChart({ data, server, className = '' }: RadarChartProps) {
  // Normalize data to 0-100 scale for radar visualization
  const normalizeValue = (value: number, max: number): number => {
    return Math.min((value / max) * 100, 100)
  }

  // Find max values for normalization
  const maxValues = data.map(stat => {
    const serverAvg = server === 'PL' ? stat.polishAverage : server === 'EUW' ? stat.euwAverage : stat.euneAverage
    return Math.max(stat.value, serverAvg || stat.value)
  })

  // Transform data for radar chart
  const radarData: RadarDataPoint[] = data.map((stat, index) => {
    const serverAvg = server === 'PL' ? stat.polishAverage : server === 'EUW' ? stat.euwAverage : stat.euneAverage
    const max = maxValues[index] * 1.2 // Add 20% headroom

    return {
      metric: stat.name,
      metricId: stat.id,
      player: normalizeValue(stat.value, max),
      average: normalizeValue(serverAvg || stat.value, max),
      fullMark: 100
    }
  })

  // Custom tick component that renders icons with text labels
  const CustomTick = ({ payload, x, y, cx, cy }: any) => {
    // Find the matching stat to get the metric name
    const stat = data.find(s => s.id === payload.value)
    if (!stat) return null

    const IconComponent = getMetricIcon(stat.id)

    // Calculate position based on angle from center
    const angle = Math.atan2(y - cy, x - cx)
    const distance = 15 // Distance to push icon+text away from chart
    const iconX = Math.cos(angle) * distance
    const iconY = Math.sin(angle) * distance

    // Determine text anchor based on position
    let textAnchor: 'start' | 'middle' | 'end' = 'middle'
    if (iconX > 5) textAnchor = 'start'
    else if (iconX < -5) textAnchor = 'end'

    return (
      <g transform={`translate(${x},${y})`}>
        {/* Icon - centered on the axis point */}
        <foreignObject x={iconX - 10} y={iconY - 10} width={20} height={20}>
          <div className="flex items-center justify-center w-full h-full">
            <IconComponent className="text-[#00D4FF]" size={20} />
          </div>
        </foreignObject>

        {/* Text label */}
        <text
          x={iconX}
          y={iconY + 22}
          textAnchor={textAnchor}
          fill="#9CA3AF"
          fontSize={11}
          fontWeight="500"
          className="select-none"
        >
          {stat.name}
        </text>
      </g>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const statIndex = data.findIndex(s => s.name === payload[0].payload.metric)
      const originalStat = data[statIndex]
      const serverAvg = server === 'PL' ? originalStat.polishAverage : server === 'EUW' ? originalStat.euwAverage : originalStat.euneAverage

      // Get the icon for this metric
      const IconComponent = getMetricIcon(originalStat.id)

      // Determine tier based on percentile
      let tier = 'Emerald Tier'
      let tierColor = '#00D4FF'
      if (originalStat.percentile <= 10) {
        tier = 'Emerald Tier'
        tierColor = '#00D4FF'
      } else if (originalStat.percentile <= 25) {
        tier = 'Diamond Tier'
        tierColor = '#00D4FF'
      } else if (originalStat.percentile <= 50) {
        tier = 'Platinum Tier'
        tierColor = '#00D4FF'
      }

      return (
        <div className="bg-[#0A0E27] border border-[#1e2836] rounded-lg p-4 shadow-xl min-w-[200px]">
          {/* Header with icon */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#1e2836]">
            <IconComponent className="text-[#00D4FF]" size={20} />
            <h4 className="text-white font-semibold text-sm">{originalStat.name}</h4>
          </div>

          {/* Player vs Server comparison */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">
                {payload[0]?.name || 'petRoXD#euw'} (Last 10 Games):
              </span>
              <span className="text-white font-bold text-sm">{originalStat.value.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">{tier}:</span>
              <span className="text-gray-400 font-semibold text-sm">{serverAvg?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-xs leading-relaxed">
            {originalStat.name} represents your performance in this key metric.
          </p>

          {/* Footer hint */}
          <p className="text-gray-500 text-[10px] mt-2 italic">
            Click icon to see skill breakdown
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`bg-[#151b28] rounded-lg border border-[#1e2836] p-6 ${className}`}>
      <ResponsiveContainer width="100%" height="100%" className="overflow-visible">
        <RechartsRadar data={radarData}>
          <PolarGrid
            stroke="#1e2836"
            strokeWidth={1}
          />
          <PolarAngleAxis
            dataKey="metricId"
            tick={<CustomTick />}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name={`${server} Average`}
            dataKey="average"
            stroke="#EF4444"
            fill="#EF4444"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Radar
            name="Your Performance"
            dataKey="player"
            stroke="#00D4FF"
            fill="#00D4FF"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Legend
            align="right"
            verticalAlign="top"
            layout="vertical"
            wrapperStyle={{ paddingTop: '5px', paddingRight: '10px', lineHeight: '1.4' }}
            iconType="circle"
            iconSize={6}
            formatter={(value) => <span className="text-gray-400 text-xs">{value}</span>}
          />
          <Tooltip content={<CustomTooltip />} />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  )
}
