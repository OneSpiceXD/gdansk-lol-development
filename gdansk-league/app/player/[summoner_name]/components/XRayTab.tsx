'use client'

import { useEffect, useState } from 'react'
import DeathHeatmap from '../x-ray/components/DeathHeatmap'
import ShadowCarousel from '../x-ray/components/ShadowCarousel'
import InsightsTab from '../x-ray/components/InsightsTab'
import ComparisonMetric from '@/components/ComparisonMetric'


interface XRayData {
  deaths: Array<{
    x: number
    y: number
    timestamp: number
    killer_champion: string
    assisting_champions: string[]
    team_id?: number
    role?: string
    match_index?: number
  }>
  kills: Array<{
    x: number
    y: number
    timestamp: number
    victim_champion: string
    assisting_champions: string[]
  }>
  assists: Array<{
    x: number
    y: number
    timestamp: number
    killer_champion: string
    victim_champion: string
  }>
  objectives: Array<{
    type: string
    subtype?: string
    x: number
    y: number
    timestamp: number
  }>
  buildings: Array<{
    type: string
    lane?: string
    tower_type?: string
    x: number
    y: number
    timestamp: number
  }>
  timeline: Array<{
    timestamp: number
    x: number
    y: number
    level: number
    total_gold: number
    current_gold: number
    cs: number
    jungle_cs: number
  }>
  totalGames: number
}

interface XRayTabProps {
  summonerName: string
}

// Rank-based death timing averages (mock data - replace with API)
const RANK_DEATH_AVERAGES: Record<string, { early: number; mid: number; late: number }> = {
  'IRON': { early: 42, mid: 33, late: 25 },
  'BRONZE': { early: 41, mid: 34, late: 25 },
  'SILVER': { early: 40, mid: 34, late: 26 },
  'GOLD': { early: 39, mid: 35, late: 26 },
  'PLATINUM': { early: 38, mid: 35, late: 27 },
  'EMERALD': { early: 37, mid: 35, late: 28 },
  'DIAMOND': { early: 35, mid: 36, late: 29 },
  'MASTER': { early: 33, mid: 37, late: 30 },
  'GRANDMASTER': { early: 32, mid: 37, late: 31 },
  'CHALLENGER': { early: 30, mid: 38, late: 32 },
}

export default function XRayTab({ summonerName }: XRayTabProps) {
  const [xrayData, setXrayData] = useState<XRayData | null>(null)
  const [shadowData, setShadowData] = useState<any>(null)
  const [playerRank, setPlayerRank] = useState<string | null>(null)
  const [playerMainRole, setPlayerMainRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedGames, setSelectedGames] = useState(20)
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedSide, setSelectedSide] = useState<string>('all')
  const [selectedPhase, setSelectedPhase] = useState<string>('all')
  const [visualizationMode, setVisualizationMode] = useState<'dots' | 'heatmap'>('dots')
  const [activeTab, setActiveTab] = useState<'insights' | 'deaths' | 'kills' | 'objectives'>('insights')

  useEffect(() => {
    async function fetchXRayData() {
      setLoading(true)
      try {
        // Fetch maximum games (50) - all filtering will be done client-side
        // Add cache parameter to force fresh data
        const res = await fetch(`/api/player/${summonerName}/x-ray-data?games=50&_t=${Date.now()}`)
        const data = await res.json()
        if (data.error) {
          console.error('X-Ray API error:', data.error)
          setXrayData(null)
        } else {
          setXrayData(data)
          console.log('Fetched deaths:', data.deaths?.length, 'Sample:', data.deaths?.[0])

          // Determine the player's main role from the deaths data
          if (data.deaths && data.deaths.length > 0) {
            const roleCounts: Record<string, number> = {}
            data.deaths.forEach((death: any) => {
              if (death.role) {
                roleCounts[death.role] = (roleCounts[death.role] || 0) + 1
              }
            })

            // Find the most common role
            let mainRole = 'all'
            let maxCount = 0
            Object.entries(roleCounts).forEach(([role, count]) => {
              if (count > maxCount) {
                maxCount = count
                mainRole = role
              }
            })

            // Set the selected role to the player's main role
            if (mainRole !== 'all') {
              setSelectedRole(mainRole)
              console.log('Auto-selected main role:', mainRole, 'with', maxCount, 'deaths')
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch X-Ray data:', error)
      } finally {
        setLoading(false)
      }
    }

    async function fetchShadowData() {
      try {
        const res = await fetch(`/api/player/${summonerName}/shadows`)
        const data = await res.json()
        if (!data.error) {
          setShadowData(data)
          console.log('Fetched shadows:', data.shadows?.length)
        }
      } catch (error) {
        console.error('Failed to fetch shadow data:', error)
      }
    }

    async function fetchPlayerRank() {
      try {
        const res = await fetch(`/api/player/${summonerName}`)
        const data = await res.json()
        if (data.tier) {
          setPlayerRank(data.tier.toUpperCase())
        }
        if (data.main_role) {
          // Convert UTILITY to SUPPORT for display
          const role = data.main_role === 'UTILITY' ? 'SUPPORT' : data.main_role.toUpperCase()
          setPlayerMainRole(role)
          setSelectedRole(role)
        }
      } catch (error) {
        console.error('Failed to fetch player rank:', error)
      }
    }

    fetchXRayData()
    fetchShadowData()
    fetchPlayerRank()
  }, [summonerName]) // Only fetch once per player

  return (
    <div className="space-y-6">

      {/* X-Ray Tabs */}
      <div className="flex gap-2 border-b border-[#1e2836]">
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'insights'
              ? 'text-white border-b-2 border-cyan-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Insights
        </button>
        <button
          onClick={() => setActiveTab('deaths')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'deaths'
              ? 'text-white border-b-2 border-red-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Death heatmap
        </button>
        <button
          onClick={() => setActiveTab('kills')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'kills'
              ? 'text-white border-b-2 border-green-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Kill heatmap
        </button>
        <button
          onClick={() => setActiveTab('objectives')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'objectives'
              ? 'text-white border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Objectives
        </button>
      </div>

      {/* Content */}
      {activeTab === 'insights' ? (
        <InsightsTab summonerName={summonerName} defaultRole={playerMainRole || undefined} />
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : xrayData ? (
        <div>
          {activeTab === 'deaths' && (
            <>
            <div className="grid grid-cols-[280px_1fr] gap-6">
              {(() => {
                // Apply client-side filtering chain: Games → Role → Side → Phase
                const gamesLimited = limitDeathsByGames(xrayData.deaths || [], selectedGames, xrayData.totalGames)
                const roleFiltered = filterDeathsByRole(gamesLimited.deaths, selectedRole)
                const sideFilteredDeaths = filterDeathsBySide(roleFiltered, selectedSide)
                const fullyFilteredDeaths = filterDeathsByPhase(sideFilteredDeaths, selectedPhase)
                const displayGamesCount = gamesLimited.gamesCount

                return (
                  <>
                    {/* Left: Filters */}
                    <div className="space-y-4">
                      <div className="bg-[#0f1420] rounded-lg p-4 border border-[#1e2836]">
                        <h3 className="text-sm font-bold text-white mb-3">Filters</h3>

                        {/* Visualization Mode */}
                        <div className="mb-4">
                          <label className="text-xs text-gray-400 mb-2 block">View mode</label>
                          <div className="grid grid-cols-2 gap-1">
                            {[
                              { value: 'dots', label: 'Dots', icon: '●' },
                              { value: 'heatmap', label: 'Heat', icon: '🔥' }
                            ].map(({ value, label, icon }) => (
                              <button
                                key={value}
                                onClick={() => setVisualizationMode(value as 'dots' | 'heatmap')}
                                className={`px-2 py-1.5 rounded text-sm transition-all ${
                                  visualizationMode === value
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-[#151b28] text-gray-400 hover:bg-[#1e2836]'
                                }`}
                              >
                                {icon} {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Games Filter */}
                        <div className="mb-4">
                    <label className="text-xs text-gray-400 mb-2 block">Last games</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[10, 20, 50].map((num) => (
                        <button
                          key={num}
                          onClick={() => setSelectedGames(num)}
                          className={`px-2 py-1.5 rounded text-sm transition-all ${
                            selectedGames === num
                              ? 'bg-cyan-500 text-white'
                              : 'bg-[#151b28] text-gray-400 hover:bg-[#1e2836]'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Role Filter */}
                  <div className="mb-4">
                    <label className="text-xs text-gray-400 mb-2 block">Role</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { value: 'all', label: 'All' },
                        { value: 'TOP', label: 'Top' },
                        { value: 'JUNGLE', label: 'Jg' },
                        { value: 'MID', label: 'Mid' },
                        { value: 'ADC', label: 'ADC' },
                        { value: 'SUPPORT', label: 'Sup' }
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => setSelectedRole(value)}
                          className={`px-2 py-1.5 rounded text-sm transition-all ${
                            selectedRole === value
                              ? 'bg-cyan-500 text-white'
                              : 'bg-[#151b28] text-gray-400 hover:bg-[#1e2836]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Side Filter */}
                  <div className="mb-4">
                    <label className="text-xs text-gray-400 mb-2 block">Side</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { value: 'all', label: 'Both', color: 'cyan' },
                        { value: 'blue', label: 'Blue', color: 'blue' },
                        { value: 'red', label: 'Red', color: 'red' }
                      ].map(({ value, label, color }) => (
                        <button
                          key={value}
                          onClick={() => setSelectedSide(value)}
                          className={`px-2 py-1.5 rounded text-sm transition-all ${
                            selectedSide === value
                              ? color === 'blue'
                                ? 'bg-blue-500 text-white'
                                : color === 'red'
                                ? 'bg-red-500 text-white'
                                : 'bg-cyan-500 text-white'
                              : 'bg-[#151b28] text-gray-400 hover:bg-[#1e2836]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Phase Filter */}
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Game phase</label>
                    <div className="space-y-1">
                      {[
                        { value: 'all', label: 'All phases', time: '' },
                        { value: 'early', label: 'Early', time: '0-15 min' },
                        { value: 'mid', label: 'Mid', time: '15-25 min' },
                        { value: 'late', label: 'Late', time: '25+ min' }
                      ].map(({ value, label, time }) => (
                        <button
                          key={value}
                          onClick={() => setSelectedPhase(value)}
                          className={`w-full px-2 py-2 rounded text-sm transition-all text-left ${
                            selectedPhase === value
                              ? 'bg-cyan-500 text-white'
                              : 'bg-[#151b28] text-gray-400 hover:bg-[#1e2836]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{label}</span>
                            {time && (
                              <span className={`text-xs ${
                                selectedPhase === value ? 'text-cyan-100' : 'text-gray-500'
                              }`}>
                                {time}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                        {/* Game Count */}
                        <div className="mt-4 pt-4 border-t border-[#1e2836]">
                          <div className="text-xs text-gray-400">Games analyzed</div>
                          <div className="text-2xl font-bold text-cyan-400">{displayGamesCount}</div>
                        </div>
                      </div>
                    </div>

                    {/* Center: Map + Quick Stats */}
                    <div className="flex gap-6">
                      {/* Map */}
                      <div>
                        <DeathHeatmap deaths={fullyFilteredDeaths} visualizationMode={visualizationMode} />
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          Hover over dots to see death details
                        </p>
                      </div>

                      {/* Quick Stats next to map */}
                      <div className="space-y-3 flex-1 flex flex-col">
                        {/* Most Dangerous Phase */}
                        <div className="bg-[#0f1420] rounded-lg p-4 border border-[#1e2836] flex-1">
                          <div className="text-xs text-gray-400 mb-2">Most dangerous phase</div>
                          {(() => {
                            const percentages = calculatePhasePercentages(sideFilteredDeaths)
                            const phases = [
                              {
                                name: 'Early',
                                short: '0-15min',
                                value: percentages.early,
                                plAvg: 38,
                                color: 'text-yellow-400',
                                tip: 'Focus on safe farming and ward placement before 15 minutes'
                              },
                              {
                                name: 'Mid',
                                short: '15-25min',
                                value: percentages.mid,
                                plAvg: 35,
                                color: 'text-orange-400',
                                tip: 'Group with team and avoid face-checking objectives'
                              },
                              {
                                name: 'Late',
                                short: '25+ min',
                                value: percentages.late,
                                plAvg: 27,
                                color: 'text-red-400',
                                tip: 'Stay with team and prioritize survival over damage'
                              }
                            ]
                            const worst = phases.reduce((max, phase) => phase.value > max.value ? phase : max, phases[0])
                            const diff = worst.value - worst.plAvg
                            const absDiff = Math.abs(diff)
                            const isWorse = diff > 0

                            return (
                              <div>
                                <div className={`text-2xl font-bold ${worst.color} mb-1`}>
                                  {worst.name} ({worst.short})
                                </div>
                                <div className="text-sm text-gray-300 mb-2">{worst.value}% of all deaths</div>

                                {/* Comparison Badge */}
                                {absDiff < 2 ? (
                                  <div className="text-xs px-2.5 py-1 rounded font-medium bg-yellow-500/10 text-yellow-400 mb-2">
                                    ≈ 🇵🇱 Same as Polish avg ({worst.plAvg}%)
                                  </div>
                                ) : (
                                  <div className={`text-xs px-2.5 py-1 rounded font-medium ${isWorse ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'} mb-2`}>
                                    {isWorse ? '⚠' : '✓'} 🇵🇱 {absDiff}% {isWorse ? 'worse' : 'better'} than Polish avg ({worst.plAvg}%)
                                  </div>
                                )}

                                {/* Quick Tip */}
                                {isWorse && (
                                  <div className="text-xs text-gray-400 italic border-t border-[#1e2836] pt-2">
                                    💡 {worst.tip}
                                  </div>
                                )}
                              </div>
                            )
                          })()}
                        </div>

                        {/* Death Timing Breakdown */}
                        <div className="bg-[#0f1420] rounded-lg p-4 border border-[#1e2836] flex-1">
                          <h3 className="text-sm font-bold text-white mb-3">Death timing breakdown</h3>
                          {(() => {
                            const percentages = calculatePhasePercentages(sideFilteredDeaths)
                            // TODO: Get from Polish player averages API
                            const polishAvg = {
                              early: 38,
                              mid: 35,
                              late: 27
                            }

                            return (
                              <div className="space-y-3">
                                <ComparisonMetric
                                  name="Early game (0-15 min)"
                                  playerValue={percentages.early}
                                  serverValue={polishAvg.early}
                                  server="PL"
                                  unit="%"
                                  lowerIsBetter={true}
                                />
                                <ComparisonMetric
                                  name="Mid game (15-25 min)"
                                  playerValue={percentages.mid}
                                  serverValue={polishAvg.mid}
                                  server="PL"
                                  unit="%"
                                  lowerIsBetter={true}
                                />
                                <ComparisonMetric
                                  name="Late game (25+ min)"
                                  playerValue={percentages.late}
                                  serverValue={polishAvg.late}
                                  server="PL"
                                  unit="%"
                                  lowerIsBetter={true}
                                />
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </div>

                  </>
                )
              })()}
            </div>

            </>
          )}

          {activeTab === 'kills' && (
            <div className="text-center py-20 text-gray-400">
              Kill heatmap coming soon...
            </div>
          )}

          {activeTab === 'objectives' && (
            <div className="text-center py-20 text-gray-400">
              Objective analysis coming soon...
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          No X-Ray data available
        </div>
      )}
    </div>
  )
}

function getMostCommonKiller(deaths: XRayData['deaths'], filterRole?: string): { champion: string; count: number } | null {
  // Filter deaths by role if specified
  const filteredDeaths = filterRole
    ? deaths.filter(death => death.role === filterRole)
    : deaths

  if (filteredDeaths.length === 0) return null

  const killerCounts: Record<string, number> = {}
  filteredDeaths.forEach(death => {
    killerCounts[death.killer_champion] = (killerCounts[death.killer_champion] || 0) + 1
  })

  const mostCommon = Object.entries(killerCounts).sort((a, b) => b[1] - a[1])[0]
  return mostCommon ? { champion: mostCommon[0], count: mostCommon[1] } : null
}

function filterDeathsByRole(deaths: XRayData['deaths'], role: string): XRayData['deaths'] {
  if (role === 'all') return deaths
  return deaths.filter(death => death.role === role)
}

function filterDeathsBySide(deaths: XRayData['deaths'], side: string): XRayData['deaths'] {
  if (side === 'all') return deaths

  const teamId = side === 'blue' ? 100 : 200
  return deaths.filter(death => death.team_id === teamId)
}

function limitDeathsByGames(deaths: XRayData['deaths'], maxGames: number, totalGames: number): { deaths: XRayData['deaths']; gamesCount: number } {
  // Filter deaths to only include those from the most recent N games
  // match_index: 0 = most recent, 1 = second most recent, etc.

  // Check if deaths have match_index (new API data)
  const hasMatchIndex = deaths.length > 0 && deaths[0].match_index !== undefined

  if (!hasMatchIndex) {
    // Fallback for old data without match_index - return all deaths
    console.warn('Deaths missing match_index - please refresh the page to get updated data')
    return { deaths, gamesCount: totalGames }
  }

  if (totalGames <= maxGames) {
    return { deaths, gamesCount: totalGames }
  }

  // Only keep deaths from games with match_index < maxGames
  const filteredDeaths = deaths.filter(death =>
    death.match_index !== undefined && death.match_index < maxGames
  )

  return {
    deaths: filteredDeaths,
    gamesCount: maxGames
  }
}

function filterDeathsByPhase(deaths: XRayData['deaths'], phase: string): XRayData['deaths'] {
  if (phase === 'all') return deaths

  return deaths.filter(death => {
    const minutes = death.timestamp / 60000
    if (phase === 'early') return minutes < 15
    if (phase === 'mid') return minutes >= 15 && minutes < 25
    if (phase === 'late') return minutes >= 25
    return true
  })
}

function calculatePhasePercentages(deaths: XRayData['deaths']) {
  if (deaths.length === 0) return { early: 0, mid: 0, late: 0 }

  const early = deaths.filter(d => d.timestamp / 60000 < 15).length
  const mid = deaths.filter(d => {
    const min = d.timestamp / 60000
    return min >= 15 && min < 25
  }).length
  const late = deaths.filter(d => d.timestamp / 60000 >= 25).length

  return {
    early: Math.round((early / deaths.length) * 100),
    mid: Math.round((mid / deaths.length) * 100),
    late: Math.round((late / deaths.length) * 100)
  }
}
