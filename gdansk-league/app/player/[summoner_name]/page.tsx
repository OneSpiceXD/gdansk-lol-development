'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import RadarChart from '@/components/RadarChart'
import ComparisonMetric from '@/components/ComparisonMetric'
import LockedFeatureCard from '@/components/LockedFeatureCard'
import { Target, TrendingUp, Dna } from 'lucide-react'

interface Champion {
  id: number
  name: string
  image_url: string
}

interface LPHistoryPoint {
  lp: number
  recorded_at: string
}

interface Player {
  id: string
  summoner_name: string
  tier: string
  rank_division: string
  lp: number
  wins: number
  losses: number
  winrate: number
  main_role: string
  top_champion_1: Champion | null
  top_champion_2: Champion | null
  top_champion_3: Champion | null
  top_champion_1_points: number
  top_champion_2_points: number
  top_champion_3_points: number
  lp_change_7d: number | null
  created_at: string
  city: string | null
  region: string | null
  profile_icon_id: number
  lp_history: LPHistoryPoint[]
}

interface Match {
  champion: Champion
  result: 'win' | 'loss'
  kda: string
  kdaRatio: number
  cs: number
  csPerMin: number
  duration: string
  lpChange: number
  timeAgo: string
  killParticipation: number
  visionScore: number
  damageDealt: number
  championLevel: number
  items: number[] // Item IDs (6 items + trinket)
  runes: { keystone: number; secondary: number } // Rune IDs
  summonerSpells: [number, number] // Summoner spell IDs
  enemyChampions: number[] // Enemy champion IDs (5 champions)
  timestamp: Date // For date grouping
  damagePerMinute: number // For daily stats
  goldPerMinute: number // For daily stats
  averageRank: string // Average rank of the match (e.g., "Emerald 2")
}

export default function PlayerPage() {
  const params = useParams()
  const router = useRouter()
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedTimeframe, setSelectedTimeframe] = useState<number>(10)
  const [roleStats, setRoleStats] = useState<any[]>([])
  const [selectedServer, setSelectedServer] = useState<'PL' | 'EUW' | 'EUNE'>('EUW')
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'champions'>('overview')
  const [xrayScore, setXrayScore] = useState<number>(753)
  const [xrayScoreTrend, setXrayScoreTrend] = useState<number>(47)

  const summonerName = params.summoner_name as string

  useEffect(() => {
    async function fetchPlayer() {
      try {
        const res = await fetch(`/api/player/${summonerName}`)
        if (res.status === 404) {
          setError(true)
          setLoading(false)
          return
        }
        const data = await res.json()
        setPlayer(data)
        // Set default role to player's main role
        if (data.main_role) {
          // Capitalize first letter and rename UTILITY to Support
          const formattedRole = data.main_role === 'UTILITY'
            ? 'Support'
            : data.main_role.charAt(0).toUpperCase() + data.main_role.slice(1).toLowerCase()
          setSelectedRole(formattedRole)
        }
      } catch (err) {
        console.error('Error fetching player:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayer()
  }, [summonerName])

  // Update role stats when role or timeframe changes
  useEffect(() => {
    async function fetchRoleStats() {
      if (selectedRole) {
        try {
          // Map role names to API format
          const roleMapping: Record<string, string> = {
            'Top': 'TOP',
            'Jungle': 'JUNGLE',
            'Mid': 'MID',
            'ADC': 'ADC',
            'Support': 'SUPPORT',
            'All Roles': 'all'
          }
          const apiRole = roleMapping[selectedRole] || 'all'

          const res = await fetch(`/api/player/${summonerName}/role-stats?role=${apiRole}&games=${selectedTimeframe}`)
          const data = await res.json()

          if (!data.error && data.metrics) {
            setRoleStats(data.metrics)

            // Calculate X-RAY Score from metrics with percentiles
            const validMetrics = data.metrics.filter((m: any) => m.percentile !== undefined)
            if (validMetrics.length > 0) {
              // Calculate raw score (sum of point contributions)
              const rawScore = validMetrics.reduce((sum: number, metric: any) => {
                return sum + (metric.pointContribution || 0)
              }, 0)
              // Normalize to 1000 scale (assuming max of 1200 for 6 metrics)
              const normalizedScore = Math.round((rawScore / 1200) * 1000)
              setXrayScore(normalizedScore)
            }
          } else {
            // Fallback to mock data
            const stats = getMockRoleStats(selectedRole)
            setRoleStats(stats)
          }
        } catch (error) {
          console.error('Error fetching role stats:', error)
          // Fallback to mock data
          const stats = getMockRoleStats(selectedRole)
          setRoleStats(stats)
        }
      }
    }

    fetchRoleStats()
  }, [selectedRole, selectedTimeframe, summonerName])

  // Memoize activity heatmap to prevent regeneration when filters change
  const [activityHeatmapMemo] = useState(() => {
    const heatmapFunc = () => {
      // This will be called on mount and stored
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const today = new Date()
      const startDate = new Date(today)
      startDate.setDate(today.getDate() - 89)
      const startDayOfWeek = startDate.getDay()
      const months: { name: string; span: number }[] = []
      let currentMonth = startDate.getMonth()
      let monthSpan = 1
      const activityData: { date: Date; wins: number; losses: number; games: number }[] = []

      for (let i = 0; i < 90; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)

        if (i > 0 && date.getMonth() !== currentMonth) {
          months.push({
            name: new Date(date.getFullYear(), currentMonth, 1).toLocaleString('default', { month: 'short' }),
            span: monthSpan
          })
          currentMonth = date.getMonth()
          monthSpan = 1
        } else {
          monthSpan++
        }

        const hasGames = Math.random() > 0.7
        if (hasGames) {
          const wins = Math.floor(Math.random() * 5)
          const losses = Math.floor(Math.random() * 4)
          activityData.push({ date, wins, losses, games: wins + losses })
        } else {
          activityData.push({ date, wins: 0, losses: 0, games: 0 })
        }
      }

      months.push({
        name: new Date(startDate.getFullYear(), currentMonth, 1).toLocaleString('default', { month: 'short' }),
        span: monthSpan
      })

      return { days, activityData, startDayOfWeek, months }
    }
    return heatmapFunc()
  })

  const getTierIcon = (tier: string) => {
    const tierLower = tier?.toLowerCase() || 'iron'
    return `/ranks/${tierLower}.png`
  }

  const getTierColor = (tier: string) => {
    const tierLower = tier?.toLowerCase()
    const colors: { [key: string]: string } = {
      'challenger': 'text-yellow-400',
      'grandmaster': 'text-red-400',
      'master': 'text-purple-400',
      'diamond': 'text-blue-400',
      'emerald': 'text-emerald-400',
      'platinum': 'text-cyan-400',
      'gold': 'text-yellow-500',
      'silver': 'text-gray-400',
      'bronze': 'text-orange-700',
      'iron': 'text-gray-500'
    }
    return colors[tierLower] || 'text-gray-400'
  }

  // Helper function to format percentiles and handle negative stats
  const formatPercentile = (percentile: number, statName: string) => {
    const negativeStats = ['deaths', 'solo_deaths', 'deaths_early']
    const isNegativeStat = negativeStats.some(neg => statName.toLowerCase().includes(neg))

    // Invert percentile for negative stats (lower is better)
    const displayPercentile = isNegativeStat ? 100 - percentile : percentile

    // Round to nearest 20% for vagueness
    const roundedPercentile = Math.round(displayPercentile / 20) * 20

    // Get badge styling based on performance
    const getBadgeStyle = () => {
      if (roundedPercentile <= 20) {
        return {
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/15',
          label: `Top ${roundedPercentile}%`
        }
      } else if (roundedPercentile <= 40) {
        return {
          text: 'text-cyan-400',
          bg: 'bg-cyan-500/15',
          label: `Top ${roundedPercentile}%`
        }
      } else if (roundedPercentile <= 60) {
        return {
          text: 'text-yellow-400',
          bg: 'bg-yellow-500/15',
          label: `Top ${roundedPercentile}%`
        }
      } else if (roundedPercentile <= 80) {
        return {
          text: 'text-gray-400',
          bg: 'bg-gray-500/15',
          label: 'Average'
        }
      } else {
        return {
          text: 'text-gray-400',
          bg: 'bg-gray-500/15',
          label: 'Below Average'
        }
      }
    }

    return getBadgeStyle()
  }

  // Mock role-specific stats (matches API structure)
  const getMockRoleStats = (role: string) => {
    const mockData: { [key: string]: any[] } = {
      'ADC': [
        { id: 'damage_per_minute', name: 'Damage per Minute', value: 954.2, percentile: 12, polishAverage: 820.5, euwAverage: 875.3, euneAverage: 850.2 },
        { id: 'cs_per_minute', name: 'CS/Min', value: 7.8, percentile: 22, polishAverage: 7.1, euwAverage: 7.3, euneAverage: 7.2 },
        { id: 'damage_share', name: 'Damage Share %', value: 32.5, percentile: 18, polishAverage: 28.3, euwAverage: 29.8, euneAverage: 29.0 },
        { id: 'gold_efficiency', name: 'Gold Efficiency', value: 1.24, percentile: 35, polishAverage: 1.15, euwAverage: 1.18, euneAverage: 1.16 },
        { id: 'positioning_score', name: 'Positioning Score', value: 8420, percentile: 28, polishAverage: 7200, euwAverage: 7600, euneAverage: 7400 },
        { id: 'objective_damage', name: 'Objective Damage', value: 9250, percentile: 15, polishAverage: 7800, euwAverage: 8200, euneAverage: 8000 },
      ],
      'Support': [
        { id: 'vision_score_per_minute', name: 'Vision Score/Min', value: 2.15, percentile: 8, polishAverage: 1.75, euwAverage: 1.85, euneAverage: 1.80 },
        { id: 'kill_participation', name: 'Kill Participation %', value: 72.3, percentile: 25, polishAverage: 65.5, euwAverage: 67.2, euneAverage: 66.5 },
        { id: 'crowd_control_score', name: 'Crowd Control Score', value: 45.8, percentile: 18, polishAverage: 38.2, euwAverage: 40.5, euneAverage: 39.5 },
        { id: 'roaming_impact', name: 'Roaming Impact', value: 3.2, percentile: 32, polishAverage: 2.1, euwAverage: 2.4, euneAverage: 2.3 },
        { id: 'gold_efficiency', name: 'Gold Efficiency', value: 0.92, percentile: 45, polishAverage: 0.85, euwAverage: 0.88, euneAverage: 0.86 },
        { id: 'death_efficiency', name: 'Death Efficiency', value: 5.2, percentile: 22, polishAverage: 4.1, euwAverage: 4.5, euneAverage: 4.3 },
      ],
      'Jungle': [
        { id: 'cs_per_minute', name: 'CS/Min', value: 5.2, percentile: 38, polishAverage: 4.8, euwAverage: 5.0, euneAverage: 4.9 },
        { id: 'kill_participation', name: 'Kill Participation %', value: 68.5, percentile: 28, polishAverage: 62.3, euwAverage: 64.8, euneAverage: 63.5 },
        { id: 'objective_control', name: 'Objective Control', value: 3.2, percentile: 15, polishAverage: 2.5, euwAverage: 2.7, euneAverage: 2.6 },
        { id: 'early_game_impact', name: 'Early Game Impact', value: 4.1, percentile: 25, polishAverage: 3.1, euwAverage: 3.3, euneAverage: 3.2 },
        { id: 'vision_score', name: 'Vision Score', value: 42.5, percentile: 32, polishAverage: 36.8, euwAverage: 38.5, euneAverage: 37.5 },
        { id: 'jungle_proximity', name: 'Jungle Proximity', value: 65.2, percentile: 42, polishAverage: 58.0, euwAverage: 60.0, euneAverage: 59.0 },
      ],
      'Mid': [
        { id: 'damage_per_minute', name: 'Damage per Minute', value: 1125.3, percentile: 18, polishAverage: 985.2, euwAverage: 1020.5, euneAverage: 1000.0 },
        { id: 'cs_per_minute', name: 'CS/Min', value: 7.9, percentile: 28, polishAverage: 7.2, euwAverage: 7.4, euneAverage: 7.3 },
        { id: 'roaming_impact', name: 'Roaming Impact', value: 2.3, percentile: 35, polishAverage: 1.6, euwAverage: 1.8, euneAverage: 1.7 },
        { id: 'kill_participation', name: 'Kill Participation %', value: 64.2, percentile: 32, polishAverage: 58.5, euwAverage: 60.2, euneAverage: 59.5 },
        { id: 'solo_kills', name: 'Solo Kills', value: 1.8, percentile: 22, polishAverage: 1.2, euwAverage: 1.4, euneAverage: 1.3 },
        { id: 'vision_score', name: 'Vision Score', value: 28.5, percentile: 38, polishAverage: 23.8, euwAverage: 25.2, euneAverage: 24.5 },
      ],
      'Top': [
        { id: 'cs_per_minute', name: 'CS/Min', value: 7.2, percentile: 35, polishAverage: 6.6, euwAverage: 6.8, euneAverage: 6.7 },
        { id: 'damage_per_minute', name: 'Damage per Minute', value: 1050.5, percentile: 28, polishAverage: 920.3, euwAverage: 960.8, euneAverage: 940.0 },
        { id: 'solo_kills', name: 'Solo Kills', value: 2.1, percentile: 18, polishAverage: 1.4, euwAverage: 1.6, euneAverage: 1.5 },
        { id: 'early_game_dominance', name: 'Early Game Dominance', value: 2.45, percentile: 22, polishAverage: 1.85, euwAverage: 2.05, euneAverage: 1.95 },
        { id: 'durability_score', name: 'Durability Score', value: 16200, percentile: 32, polishAverage: 13500, euwAverage: 14200, euneAverage: 13800 },
        { id: 'split_push_pressure', name: 'Split Push Pressure', value: 11.8, percentile: 25, polishAverage: 9.2, euwAverage: 9.8, euneAverage: 9.5 },
      ],
      'All Roles': [
        { id: 'kda', name: 'KDA', value: 3.42, percentile: 28, polishAverage: 2.85, euwAverage: 3.05, euneAverage: 2.95 },
        { id: 'cs_per_minute', name: 'CS/Min', value: 6.8, percentile: 35, polishAverage: 6.2, euwAverage: 6.4, euneAverage: 6.3 },
        { id: 'kill_participation', name: 'Kill Participation %', value: 62.5, percentile: 32, polishAverage: 56.8, euwAverage: 58.5, euneAverage: 57.5 },
        { id: 'vision_score', name: 'Vision Score', value: 32.5, percentile: 28, polishAverage: 28.2, euwAverage: 29.5, euneAverage: 28.8 },
        { id: 'damage_share', name: 'Damage Share %', value: 24.8, percentile: 38, polishAverage: 21.5, euwAverage: 22.8, euneAverage: 22.0 },
        { id: 'objective_control', name: 'Objective Participation', value: 2.1, percentile: 42, polishAverage: 1.6, euwAverage: 1.7, euneAverage: 1.65 },
      ],
    }

    return mockData[role] || mockData['All Roles']
  }

  // Mock playstyle data for locked preview
  const getMockPlaystyle = (role: string) => {
    const playstyles: { [key: string]: string } = {
      'ADC': 'Aggressive laner with high damage output',
      'Support': 'Vision-focused team enabler',
      'Jungle': 'Objective-focused early game aggressor',
      'Mid': 'Roaming playmaker with lane priority',
      'Top': 'Split-push focused duelist',
      'All Roles': 'Balanced playstyle across all roles'
    }
    return playstyles[role] || playstyles['All Roles']
  }

  // Mock skill focus suggestions for locked preview
  const getMockSkillFocus = (role: string) => {
    const skillFocus: { [key: string]: { skill: string; description: string }[] } = {
      'ADC': [
        { skill: 'Positioning', description: 'Work on staying safer in teamfights' },
        { skill: 'CS/Min', description: 'Focus on improving early game farming' }
      ],
      'Support': [
        { skill: 'Vision Control', description: 'Already excellent, keep it up!' },
        { skill: 'Roaming', description: 'Increase mid lane presence' }
      ],
      'Jungle': [
        { skill: 'Objective Control', description: 'Secure more dragons and barons' },
        { skill: 'Gank Success', description: 'Improve pre-6 gank efficiency' }
      ],
      'Mid': [
        { skill: 'Roaming', description: 'Good roams, increase frequency' },
        { skill: 'CS/Min', description: 'Don\'t sacrifice farm for roams' }
      ],
      'Top': [
        { skill: 'Solo Kills', description: 'Capitalize on lane advantages' },
        { skill: 'TP Usage', description: 'Better teleport timing for objectives' }
      ],
      'All Roles': [
        { skill: 'Vision', description: 'Increase ward placement' },
        { skill: 'CS/Min', description: 'Improve farming consistency' }
      ]
    }
    return skillFocus[role] || skillFocus['All Roles']
  }

  // Generate activity heatmap (90 days, Mobalytics style)
  const getActivityHeatmap = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 89) // 90 days ago

    // Calculate which day of week to start
    const startDayOfWeek = startDate.getDay()

    // Generate months headers - FIXED
    const months: { name: string; span: number }[] = []
    let currentMonth = startDate.getMonth()
    let monthSpan = 1 // Start at 1 to include the first day

    const activityData: { date: Date; wins: number; losses: number; games: number }[] = []

    // Add first month to array immediately
    const firstMonthName = startDate.toLocaleString('default', { month: 'short' })

    // Generate 90 days of data
    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      // Track months for header
      if (i > 0 && date.getMonth() !== currentMonth) {
        // Save previous month
        months.push({
          name: new Date(date.getFullYear(), currentMonth, 1).toLocaleString('default', { month: 'short' }),
          span: monthSpan
        })
        currentMonth = date.getMonth()
        monthSpan = 1
      } else if (i > 0) {
        monthSpan++
      }

      // Generate random game data
      const hasGames = Math.random() > 0.7
      if (hasGames) {
        const wins = Math.floor(Math.random() * 5)
        const losses = Math.floor(Math.random() * 4)
        activityData.push({ date, wins, losses, games: wins + losses })
      } else {
        activityData.push({ date, wins: 0, losses: 0, games: 0 })
      }
    }

    // Add last month
    const lastDate = new Date(startDate)
    lastDate.setDate(startDate.getDate() + 89)
    months.push({
      name: lastDate.toLocaleString('default', { month: 'short' }),
      span: monthSpan
    })

    return { days, activityData, startDayOfWeek, months }
  }

  const getActivityColor = (data: { wins: number; losses: number; games: number }) => {
    if (data.games === 0) return 'bg-[#1a1f2e]'

    const winrate = data.wins / data.games

    // Bad days (< 40% winrate)
    if (winrate < 0.4) {
      if (data.games >= 7) return 'bg-red-500'
      if (data.games >= 3) return 'bg-red-600'
      return 'bg-red-700'
    }

    // Neutral days (40-60% winrate)
    if (winrate < 0.6) {
      if (data.games >= 7) return 'bg-gray-400'
      if (data.games >= 3) return 'bg-gray-500'
      return 'bg-gray-600'
    }

    // Good days (>= 60% winrate)
    if (data.games >= 7) return 'bg-emerald-400'
    if (data.games >= 3) return 'bg-emerald-500'
    return 'bg-emerald-600'
  }

  // Helper function to group matches by date and calculate daily stats
  const groupMatchesByDate = (matches: Match[]) => {
    const groups: { [key: string]: Match[] } = {}

    matches.forEach(match => {
      const dateKey = match.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(match)
    })

    return Object.entries(groups).map(([date, dateMatches]) => {
      const wins = dateMatches.filter(m => m.result === 'win').length
      const losses = dateMatches.filter(m => m.result === 'loss').length
      const avgDPM = dateMatches.reduce((sum, m) => sum + m.damagePerMinute, 0) / dateMatches.length
      const avgKDA = dateMatches.reduce((sum, m) => sum + m.kdaRatio, 0) / dateMatches.length
      const avgGPM = dateMatches.reduce((sum, m) => sum + m.goldPerMinute, 0) / dateMatches.length

      return {
        date,
        matches: dateMatches,
        stats: {
          wins,
          losses,
          avgDPM: Math.round(avgDPM * 10) / 10,
          avgKDA: Math.round(avgKDA * 100) / 100,
          avgGPM: Math.round(avgGPM * 10) / 10
        }
      }
    })
  }

  // Mock recent matches data with more detail
  const generateMockMatches = (): Match[] => {
    if (!player) return []

    const champions = [player.top_champion_1, player.top_champion_2, player.top_champion_3].filter(c => c !== null && c !== undefined) as Champion[]

    // If no champions available, return empty array
    if (champions.length === 0) return []

    const matches: Match[] = []
    const now = new Date()

    // Common item IDs (using placeholders - these would be actual item IDs from Riot API)
    const commonItems = [
      [3153, 3006, 3031, 3036, 3046, 3033, 3340], // ADC build
      [3078, 3068, 3143, 3053, 3074, 3071, 3364], // Bruiser build
      [3020, 3157, 3135, 3165, 3916, 3089, 3340], // Mage build
    ]

    // Summoner spell IDs (Flash=4, Teleport=12, Ignite=14, etc.)
    const summonerSpellSets = [[4, 14], [4, 12], [4, 11], [4, 6]] as [number, number][]

    // Common enemy champion IDs (placeholder)
    const enemyChampionPool = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

    // Generate 8 realistic matches with varying timestamps and ranks
    const matchResults = [
      { result: 'win' as const, kda: '5/2/10', cs: 241, duration: '22m 10s', lpChange: 18, hoursAgo: 1, rank: 'Emerald 2' },
      { result: 'win' as const, kda: '7/4/5', cs: 712, duration: '19m 53s', lpChange: 17, hoursAgo: 2, rank: 'Emerald 3' },
      { result: 'loss' as const, kda: '5/7/6', cs: 257, duration: '30m 28s', lpChange: -17, hoursAgo: 3, rank: 'Emerald 2' },
      { result: 'win' as const, kda: '9/7/8', cs: 599, duration: '32m 51s', lpChange: 19, hoursAgo: 5, rank: 'Emerald 1' },
      { result: 'loss' as const, kda: '1/8/6', cs: 219, duration: '34m 40s', lpChange: -16, hoursAgo: 6, rank: 'Emerald 2' },
      { result: 'win' as const, kda: '5/5/22', cs: 717, duration: '42m 41s', lpChange: 20, hoursAgo: 26, rank: 'Emerald 3' },
      { result: 'loss' as const, kda: '2/6/8', cs: 185, duration: '28m 15s', lpChange: -15, hoursAgo: 27, rank: 'Emerald 2' },
      { result: 'win' as const, kda: '6/3/11', cs: 228, duration: '31m 22s', lpChange: 18, hoursAgo: 28, rank: 'Emerald 1' },
    ]

    matchResults.forEach((matchData, index) => {
      const champion = champions[index % champions.length]
      const [kills, deaths, assists] = matchData.kda.split('/').map(Number)
      const kdaRatio = deaths === 0 ? kills + assists : (kills + assists) / deaths
      const durationParts = matchData.duration.match(/(\d+)m/)
      const durationMins = durationParts ? parseInt(durationParts[1]) : 30
      const csPerMin = matchData.cs / durationMins
      const damageDealt = 15000 + Math.random() * 10000
      const goldEarned = 12000 + Math.random() * 8000

      // Create timestamp (hours ago)
      const timestamp = new Date(now.getTime() - (matchData.hoursAgo * 60 * 60 * 1000))

      // Select random items, runes, and enemy champions
      const itemSet = commonItems[index % commonItems.length]
      const enemyChamps = enemyChampionPool.slice(index * 5, index * 5 + 5)

      matches.push({
        champion,
        result: matchData.result,
        kda: matchData.kda,
        kdaRatio,
        cs: matchData.cs,
        csPerMin,
        duration: matchData.duration,
        lpChange: matchData.lpChange,
        timeAgo: matchData.hoursAgo < 24 ? `${matchData.hoursAgo}h ago` : `${Math.floor(matchData.hoursAgo / 24)}d ago`,
        killParticipation: 55 + Math.random() * 15,
        visionScore: 30 + Math.random() * 30,
        damageDealt,
        championLevel: 12 + Math.floor(Math.random() * 7), // Level 12-18
        items: itemSet,
        runes: {
          keystone: 8000 + Math.floor(Math.random() * 100), // Mock rune IDs
          secondary: 8100 + Math.floor(Math.random() * 100)
        },
        summonerSpells: summonerSpellSets[index % summonerSpellSets.length],
        enemyChampions: enemyChamps,
        timestamp,
        damagePerMinute: damageDealt / durationMins,
        goldPerMinute: goldEarned / durationMins,
        averageRank: matchData.rank
      })
    })

    return matches
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading player data...</div>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Player Not Found</h1>
          <p className="text-gray-400 mb-6">
            Could not find player: {decodeURIComponent(summonerName)}
          </p>
          <button
            onClick={() => router.push('/leaderboard')}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Leaderboard
          </button>
        </div>
      </div>
    )
  }

  const { days, activityData, startDayOfWeek, months } = activityHeatmapMemo

  const totalGames = player.wins + player.losses
  const mockMatches = generateMockMatches()
  const groupedMatches = groupMatchesByDate(mockMatches)

  // Calculate win streak
  let currentStreak = 0
  for (const match of mockMatches) {
    if (match.result === 'win') currentStreak++
    else break
  }

  // Calculate total games and hours from activity data
  const totalGamesPlayed = activityData.reduce((sum, day) => sum + day.games, 0)
  const totalHoursPlayed = Math.floor(totalGamesPlayed * 0.5)

  // X-RAY Score (fetched from API)
  const maxScore = 1000
  const scorePercentile = 12 // Top 12% Polish

  return (
    <div className="grid grid-cols-[320px_1fr] gap-6">
            {/* Left Sidebar */}
            <div className="space-y-4">
            {/* Rank Card */}
            <div className="bg-[#0f1420] rounded-lg p-6 border border-[#1e2836]">
              <div className="text-sm text-gray-400 mb-3">Ranked Solo</div>

              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-20 h-20">
                  <Image
                    src={getTierIcon(player.tier)}
                    alt={player.tier}
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className={`text-xl font-bold ${getTierColor(player.tier)}`}>
                    {player.tier} {player.rank_division}
                  </div>
                  <div className="text-lg font-bold mt-1">{player.lp} LP</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-t border-[#1e2836]">
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">WIN RATE</div>
                  <div className="text-sm text-gray-400 mb-1">
                    {player.wins}W {player.losses}L
                  </div>
                  <div className={`text-lg font-bold ${player.winrate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                    {player.winrate.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center border-l border-[#1e2836] pl-4">
                  <div className="text-xs text-gray-400 mb-1">PEAK RANK</div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="relative w-8 h-8">
                      <Image
                        src={getTierIcon(player.tier)}
                        alt={player.tier}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className={`text-sm font-bold ${getTierColor(player.tier)}`}>
                      {player.tier} {player.rank_division}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Season 3 2025</div>
                </div>
              </div>
            </div>

            {/* X-Ray Score - NEW */}
            <div className="bg-gradient-to-br from-cyan-900/40 to-purple-900/40 rounded-lg p-6 border border-cyan-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-300">X-RAY SCORE</div>
              </div>

              <div className="flex items-end gap-2 mb-2">
                <div className="text-4xl font-bold text-cyan-400">{xrayScore}</div>
                <div className="text-lg text-gray-400 mb-1">/ {maxScore}</div>
                {xrayScoreTrend > 0 && (
                  <div className="text-sm text-green-400 mb-1">+{xrayScoreTrend} ↗</div>
                )}
              </div>

              {/* Score bar */}
              <div className="w-full bg-[#1a1f2e] rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${(xrayScore / maxScore) * 100}%` }}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>🔒</span>
                <span>Connect to see your exact Polish ranking</span>
              </div>
            </div>

            {/* Best Play Time */}
            <div className="bg-[#0f1420] rounded-lg p-4 border border-[#1e2836]">
              <div className="text-xs text-gray-400 mb-2">BEST PLAY TIME</div>
              <div className="text-lg font-bold text-purple-400">Tuesday/Wednesday</div>
              <div className="text-sm text-gray-400">18:00 - 23:00</div>
            </div>

            {/* Activity Heatmap */}
            <div className="bg-[#0f1420] rounded-lg p-4 border border-[#1e2836]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-400">RECENT ACTIVITY</div>
                <div className="text-[10px] text-gray-500">Last 90 Days</div>
              </div>

              {/* Months header */}
              <div className="flex gap-0.5 mb-1 ml-6">
                {months.map((month, index) => (
                  <div
                    key={index}
                    className="text-[9px] text-gray-500"
                    style={{ width: `${(month.span / 90) * 100}%` }}
                  >
                    {month.name}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="flex gap-1">
                {/* Day labels */}
                <div className="flex flex-col gap-0.5 justify-around pr-1">
                  <div className="text-[9px] text-gray-500 h-2.5">Sun</div>
                  <div className="text-[9px] text-gray-500 h-2.5">Mon</div>
                  <div className="text-[9px] text-gray-500 h-2.5">Tue</div>
                  <div className="text-[9px] text-gray-500 h-2.5">Wed</div>
                  <div className="text-[9px] text-gray-500 h-2.5">Thu</div>
                  <div className="text-[9px] text-gray-500 h-2.5">Fri</div>
                  <div className="text-[9px] text-gray-500 h-2.5">Sat</div>
                </div>

                {/* Activity grid */}
                <div className="flex-1 grid grid-flow-col gap-0.5" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}>
                  {/* Empty cells for alignment */}
                  {Array.from({ length: startDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-2.5 w-2.5" />
                  ))}

                  {/* Activity cells */}
                  {activityData.map((data, index) => (
                    <div
                      key={index}
                      className={`h-2.5 w-2.5 rounded-sm ${getActivityColor(data)} transition-all hover:ring-1 hover:ring-cyan-400 cursor-pointer`}
                      title={`${data.date.toLocaleDateString()}\n${data.games} games: ${data.wins}W ${data.losses}L`}
                    />
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-3 text-[9px] text-gray-500 flex items-center justify-between">
                <div>{totalGamesPlayed} games</div>
                <div className="flex items-center gap-1">
                  <span>bad</span>
                  <div className="flex gap-0.5">
                    <div className="w-2 h-2 bg-red-700 rounded-sm" />
                    <div className="w-2 h-2 bg-gray-600 rounded-sm" />
                    <div className="w-2 h-2 bg-emerald-600 rounded-sm" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-sm" />
                  </div>
                  <span>good</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-4">
            {/* Performance Stats - Radar Chart + Comparison Metrics */}
            <div className="bg-[#0f1420] rounded-lg p-6 border border-[#1e2836]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Primary role overview</h2>

                <div className="flex items-center gap-3">
                  {/* Timeframe Selector */}
                  <div className="flex items-center gap-1 bg-[#151b28] rounded-lg p-1 border border-[#1e2836]">
                    {[10, 20, 50].map((num) => (
                      <button
                        key={num}
                        onClick={() => setSelectedTimeframe(num)}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-all outline-none ${
                          selectedTimeframe === num
                            ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/50'
                            : 'text-gray-400 hover:text-white border border-transparent'
                        }`}
                      >
                        Last {num} Games
                      </button>
                    ))}
                  </div>

                  {/* Role Selector */}
                  <div className="relative">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="appearance-none bg-[#151b28] text-white px-4 py-2 pr-8 rounded-lg border border-[#1e2836] hover:border-cyan-500/50 transition-colors cursor-pointer text-sm font-medium"
                    >
                      <option value="All Roles">All Roles</option>
                      <option value="Top">Top</option>
                      <option value="Jungle">Jungle</option>
                      <option value="Mid">Mid</option>
                      <option value="ADC">ADC</option>
                      <option value="Support">Support</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                      ▼
                    </div>
                  </div>

                  {/* Refresh icon */}
                  <button className="p-2 bg-[#151b28] rounded-lg border border-[#1e2836] hover:border-cyan-500/50 transition-colors text-gray-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Server Selector */}
              <div className="mb-4">
                <div className="flex items-center gap-2 bg-[#151b28] rounded-lg p-1 border border-[#1e2836] w-fit">
                  <span className="text-xs text-gray-400 ml-2">Compare with:</span>
                  {(['PL', 'EUW', 'EUNE'] as const).map((server) => (
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

              {roleStats.length > 0 ? (
                <div className="flex gap-6">
                  {/* Left: Radar Chart (bigger) */}
                  <div className="flex-1">
                    <RadarChart
                      data={roleStats}
                      server={selectedServer}
                      className="h-[550px]"
                    />
                  </div>

                  {/* Right: Top 3 Comparison Metrics (stacked vertically) */}
                  <div className="w-80 flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Key metrics breakdown</h3>
                    <div className="space-y-4 flex-1">
                      {roleStats.slice(0, 3).map((stat) => {
                        const serverAvg = selectedServer === 'PL'
                          ? stat.polishAverage
                          : selectedServer === 'EUW'
                            ? stat.euwAverage
                            : stat.euneAverage

                        // Determine unit based on stat name
                        let unit = ''
                        if (stat.name.includes('%')) unit = '%'
                        else if (stat.name.includes('/Min') || stat.name.includes('per Minute')) unit = ''

                        return (
                          <ComparisonMetric
                            key={stat.id}
                            name={stat.name}
                            playerValue={stat.value}
                            serverValue={serverAvg}
                            server={selectedServer}
                            unit={unit}
                          />
                        )
                      })}
                    </div>

                    {/* CTA Button */}
                    <button className="mt-4 w-full py-3 px-4 rounded-lg transition-all group relative overflow-hidden border border-purple-500/30 hover:border-purple-500/50">
                      <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded blur-sm group-hover:blur-md transition-all"></span>
                      <span className="relative flex items-center justify-center gap-2">
                        <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent bg-[length:200%_100%] animate-shimmer font-bold tracking-wide">
                          See your full X-Ray
                        </span>
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  Loading stats...
                </div>
              )}
            </div>

            {/* Player DNA - Locked Feature */}
            <div className="grid grid-cols-2 gap-4">
              <LockedFeatureCard
                title="Player DNA"
                description="Understand your unique approach to the game"
                icon={<Dna className="w-5 h-5" />}
                previewContent={
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#00D4FF] rounded-full" />
                      <span className="text-sm text-gray-300">{getMockPlaystyle(selectedRole)}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 bg-[#00D4FF]/20 rounded-full w-full" />
                      <div className="h-2 bg-[#00D4FF]/20 rounded-full w-3/4" />
                      <div className="h-2 bg-[#00D4FF]/20 rounded-full w-1/2" />
                    </div>
                  </div>
                }
              />

              <LockedFeatureCard
                title="Skill to focus"
                description="Data-driven recommendations for improvement"
                icon={<TrendingUp className="w-5 h-5" />}
                previewContent={
                  <div className="space-y-3">
                    {getMockSkillFocus(selectedRole).map((focus, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="text-sm font-semibold text-white">{focus.skill}</div>
                        <div className="text-xs text-gray-400">{focus.description}</div>
                      </div>
                    ))}
                  </div>
                }
              />
            </div>

            {/* CHAMPION SHOWCASE */}
            <div className="bg-[#0f1420] rounded-lg p-6 border border-[#1e2836]">
              <h3 className="text-lg font-bold mb-4">TOP CHAMPIONS</h3>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { champ: player.top_champion_1, points: player.top_champion_1_points },
                  { champ: player.top_champion_2, points: player.top_champion_2_points },
                  { champ: player.top_champion_3, points: player.top_champion_3_points }
                ].map((item, index) => item.champ && (
                  <div key={index} className="bg-[#151b28] rounded-lg p-4 border border-[#1e2836] hover:border-cyan-500/50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-cyan-500/30">
                        <Image
                          src={item.champ.image_url}
                          alt={item.champ.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg">{item.champ.name}</div>
                        <div className="text-sm text-cyan-400">{item.points} games</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <div className="text-gray-400">Winrate</div>
                        <div className={`font-bold ${player.winrate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                          {player.winrate.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Games</div>
                        <div className="font-bold">{Math.floor(totalGames / 3)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">KDA</div>
                        <div className="font-bold text-yellow-400">3.2</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MATCH HISTORY - Tracker.gg Style */}
            <div className="bg-[#0f1420] rounded-lg p-6 border border-[#1e2836]">
              <h3 className="text-lg font-bold mb-4">RECENT MATCHES</h3>

              <div className="space-y-6">
                {groupedMatches.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    {/* Date Header with Stats */}
                    <div className="flex items-center gap-4 mb-3 pb-2 border-b border-[#1e2836]">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{group.date}</span>
                        <span className="px-2 py-0.5 bg-[#1e2836] rounded text-xs font-bold text-gray-400">
                          {group.matches.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">
                          <span className="text-green-400 font-bold">{group.stats.wins} W</span> /{' '}
                          <span className="text-red-400 font-bold">{group.stats.losses} L</span>
                        </span>
                        <span className="text-gray-400">
                          Winrate <span className={`font-bold ${
                            (group.stats.wins / (group.stats.wins + group.stats.losses)) >= 0.5
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}>
                            {Math.round((group.stats.wins / (group.stats.wins + group.stats.losses)) * 100)}%
                          </span>
                        </span>
                        <span className="text-gray-400">
                          Total Time <span className="text-white font-bold">{Math.round(group.matches.length * 0.5)}h</span>
                        </span>
                      </div>
                    </div>

                    {/* Matches */}
                    <div className="space-y-2">
                      {group.matches.map((match, matchIndex) => (
                        <div
                          key={matchIndex}
                          className={`relative flex items-center gap-4 px-4 py-4 rounded border-l-[4px] transition-colors hover:bg-[#151b28] ${
                            match.result === 'win'
                              ? 'border-green-500 bg-[#0a1410]'
                              : 'border-red-500 bg-[#140a0a]'
                          }`}
                        >
                          {/* Left: Time + Mode + LP */}
                          <div className="flex items-center gap-3">
                            <div className="w-20 text-xs text-gray-400">
                              <div className="font-medium">{match.timeAgo}</div>
                              <div className="font-semibold text-white text-sm">Ranked Solo</div>
                            </div>

                            {/* LP Gains */}
                            <div className="text-center">
                              <div className="text-sm text-gray-400 mb-1">LP</div>
                              <div className={`text-lg font-bold ${
                                match.lpChange > 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {match.lpChange > 0 ? '+' : ''}{match.lpChange}
                              </div>
                            </div>
                          </div>

                          {/* Champion Portrait with Level */}
                          <div className="relative">
                            <div className="w-16 h-16 rounded overflow-hidden border-2 border-[#1e2836]">
                              <Image
                                src={match.champion.image_url}
                                alt={match.champion.name}
                                width={64}
                                height={64}
                                className="object-cover"
                              />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-[#0f1420] border border-[#1e2836] rounded px-1.5 text-xs font-bold leading-none py-1">
                              {match.championLevel}
                            </div>
                          </div>

                          {/* Spells + Runes */}
                          <div className="flex gap-1">
                            <div className="flex flex-col gap-1">
                              {match.summonerSpells.map((spell, i) => (
                                <div key={i} className="w-7 h-7 bg-[#1e2836] rounded overflow-hidden">
                                  <Image
                                    src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/SummonerFlash.png`}
                                    alt="Spell"
                                    width={28}
                                    height={28}
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="w-7 h-7 bg-[#1e2836] rounded overflow-hidden">
                                <Image
                                  src={`https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png`}
                                  alt="Rune"
                                  width={28}
                                  height={28}
                                  className="object-cover"
                                />
                              </div>
                              <div className="w-7 h-7 bg-[#1e2836] rounded overflow-hidden">
                                <Image
                                  src={`https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/DomPerkBonuses/Domination.png`}
                                  alt="Rune"
                                  width={28}
                                  height={28}
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Items - Two Rows */}
                          <div className="flex flex-col gap-1">
                            <div className="flex gap-1">
                              {match.items.slice(0, 4).map((item, i) => (
                                <div key={i} className="w-8 h-8 bg-[#1e2836] rounded overflow-hidden border border-[#2a3142]">
                                  <Image
                                    src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/${item}.png`}
                                    alt="Item"
                                    width={32}
                                    height={32}
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-1">
                              {match.items.slice(4, 7).map((item, i) => (
                                <div key={i} className={`w-8 h-8 bg-[#1e2836] rounded overflow-hidden border border-[#2a3142] ${i === 2 ? 'ml-1' : ''}`}>
                                  <Image
                                    src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/${item}.png`}
                                    alt="Item"
                                    width={32}
                                    height={32}
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Match Duration */}
                          <div className="text-center px-3">
                            <div className="text-sm text-gray-400 mb-1">Duration</div>
                            <div className="text-base font-semibold text-gray-300">{match.duration}</div>
                          </div>

                          {/* Average Rank */}
                          <div className="text-center px-3">
                            <div className="text-sm text-gray-400 mb-1">Avg Rank</div>
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="relative w-5 h-5">
                                <Image
                                  src={getTierIcon(match.averageRank.split(' ')[0])}
                                  alt={match.averageRank}
                                  width={20}
                                  height={20}
                                  className="object-contain"
                                />
                              </div>
                              <span className="text-base font-semibold text-emerald-400">{match.averageRank}</span>
                            </div>
                          </div>

                          {/* Stats: KDA, CS, KP */}
                          <div className="ml-auto flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-sm text-gray-400 mb-1">KDA</div>
                              <div className="flex items-center gap-2">
                                <span className="text-base font-semibold text-gray-300">{match.kda}</span>
                                <span className={`text-sm font-bold ${
                                  match.kdaRatio >= 4 ? 'text-yellow-400' :
                                  match.kdaRatio >= 3 ? 'text-green-400' :
                                  match.kdaRatio >= 2 ? 'text-cyan-400' : 'text-gray-400'
                                }`}>
                                  {match.kdaRatio.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-sm text-gray-400 mb-1">CS/min</div>
                              <div className="text-base font-semibold text-gray-300">{match.csPerMin.toFixed(1)}</div>
                            </div>

                            <div className="text-center">
                              <div className="text-sm text-gray-400 mb-1">KP</div>
                              <div className="text-base font-semibold text-purple-400">{Math.round(match.killParticipation)}%</div>
                            </div>
                          </div>

                          {/* Teams */}
                          <div className="flex flex-col gap-1">
                            {/* Team Champions - Blue Line */}
                            <div className="flex items-center gap-1 pl-2 border-l-2 border-cyan-500/50">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="w-7 h-7 rounded-full overflow-hidden border border-cyan-500/30">
                                  <Image
                                    src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Ahri.png`}
                                    alt="Ally"
                                    width={28}
                                    height={28}
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Enemy Champions - Red Line */}
                            <div className="flex items-center gap-1 pl-2 border-l-2 border-red-500/50">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="w-7 h-7 rounded-full overflow-hidden border border-red-500/30">
                                  <Image
                                    src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Aatrox.png`}
                                    alt="Enemy"
                                    width={28}
                                    height={28}
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* View all matches link */}
              <button className="w-full mt-4 py-3 bg-[#151b28] hover:bg-[#1a2030] rounded-lg border border-[#1e2836] hover:border-cyan-500/50 transition-colors text-sm text-gray-400 hover:text-cyan-400">
                View all matches →
              </button>
            </div>
          </div>
    </div>
  )
}
