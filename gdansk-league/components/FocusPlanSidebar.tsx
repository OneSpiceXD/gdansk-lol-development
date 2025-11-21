'use client'

import { useState } from 'react'

interface FocusItem {
  id: string
  title: string
  context: string
  metricName: string
  gap: number // The difference to target
  targetValue: number
  shadowPlayer?: ShadowPlayer // Matched player who excels at this metric
  mode: 'fix' | 'push' // Whether this is fixing a weakness or pushing a strength
  playerValue: number // The player's current value for this metric
}

interface ShadowPlayer {
  name: string
  rank: string
  tier: string
  profileIcon: number
  metricValue: number // Their value for the focus metric
  sharedChampions: string[]
  isLive?: boolean
}

interface MetricData {
  id: string
  name: string
  value: number
  polishAverage: number
  percentile?: number
}

interface FocusPlanSidebarProps {
  targetRank: string // e.g., "Platinum"
  weakMetrics: MetricData[] // Metrics below average (for backwards compat)
  allMetrics?: MetricData[] // All metrics for "next rank" targets
  role: string
  totalMatchesAnalyzed?: number
  horizontal?: boolean // If true, render in horizontal layout for bottom section
  hideDuoCard?: boolean // If true, don't render the duo card (for separate rendering)
  duoCardOnly?: boolean // If true, only render the duo card
}

// Duo partner interface
interface DuoPartner {
  name: string
  rank: string
  tier: string
  profileIcon: number
  role: string
  strongMetric: string // What they're good at
  strongMetricValue: number
  sharedChampions: string[]
  isLive?: boolean
  whyComplement: string // Explanation of why they complement user
}

// Role synergy mapping
const ROLE_SYNERGY: Record<string, string[]> = {
  adc: ['support'],
  support: ['adc'],
  jungle: ['top', 'mid'],
  top: ['jungle'],
  mid: ['jungle'],
}

// Mock duo partners by user's role (suggests complementary role)
const MOCK_DUO_PARTNERS: Record<string, DuoPartner[]> = {
  adc: [
    { name: 'VisionQueen_GDA', rank: 'III', tier: 'DIAMOND', profileIcon: 5891, role: 'Support', strongMetric: 'Vision score', strongMetricValue: 2.1, sharedChampions: ['Lulu', 'Nami', 'Thresh'], isLive: false, whyComplement: 'Strong vision control complements your damage focus' },
    { name: 'PeelMaster_WAW', rank: 'II', tier: 'DIAMOND', profileIcon: 4567, role: 'Support', strongMetric: 'Kill participation', strongMetricValue: 78, sharedChampions: ['Nautilus', 'Leona', 'Braum'], isLive: true, whyComplement: 'High KP means they\'ll always be there for fights' },
  ],
  support: [
    { name: 'CSKing_Krakow', rank: 'III', tier: 'DIAMOND', profileIcon: 4352, role: 'ADC', strongMetric: 'CS/min', strongMetricValue: 8.2, sharedChampions: ['Jinx', 'Kaisa', 'Caitlyn'], isLive: false, whyComplement: 'Excellent farming means more gold for your lane' },
    { name: 'CarryKing_WAW', rank: 'I', tier: 'DIAMOND', profileIcon: 5012, role: 'ADC', strongMetric: 'Damage share', strongMetricValue: 28.5, sharedChampions: ['Draven', 'Samira', 'Lucian'], isLive: true, whyComplement: 'High damage output to capitalize on your setups' },
  ],
  jungle: [
    { name: 'SoloKill_POZ', rank: 'II', tier: 'DIAMOND', profileIcon: 4891, role: 'Top', strongMetric: 'Solo kills', strongMetricValue: 2.3, sharedChampions: ['Darius', 'Renekton', 'Fiora'], isLive: false, whyComplement: 'Creates pressure top side for your ganks' },
    { name: 'RoamKing_GDA', rank: 'IV', tier: 'DIAMOND', profileIcon: 5234, role: 'Mid', strongMetric: 'Roaming impact', strongMetricValue: 85, sharedChampions: ['Ahri', 'Syndra', 'Viktor'], isLive: false, whyComplement: 'High roam impact for coordinated plays' },
  ],
  top: [
    { name: 'ObjectiveJG_WRO', rank: 'I', tier: 'EMERALD', profileIcon: 4123, role: 'Jungle', strongMetric: 'Objective control', strongMetricValue: 72, sharedChampions: ['Lee Sin', 'Viego', 'Graves'], isLive: true, whyComplement: 'Strong objective control for Herald plays' },
  ],
  mid: [
    { name: 'GankMachine_KRK', rank: 'III', tier: 'DIAMOND', profileIcon: 5678, role: 'Jungle', strongMetric: 'Early game impact', strongMetricValue: 68, sharedChampions: ['Elise', 'Nidalee', 'Rek\'Sai'], isLive: false, whyComplement: 'Early pressure to help you snowball lane' },
  ],
}

// Get a duo partner based on user's role (deterministic - always first match)
function getDuoPartner(userRole: string): DuoPartner | undefined {
  const roleLower = userRole.toLowerCase()
  let partners = MOCK_DUO_PARTNERS[roleLower]

  // Fallback to ADC partners if role is 'all' or not found
  if (!partners || partners.length === 0) {
    partners = MOCK_DUO_PARTNERS['adc']
  }

  if (!partners || partners.length === 0) return undefined
  return partners[0] // Always return first to avoid re-render changes
}

// Mock shadow players database - matched by metric they excel at
const MOCK_SHADOW_PLAYERS: Record<string, ShadowPlayer[]> = {
  vision_score: [
    { name: 'WarszawaVision', rank: 'IV', tier: 'DIAMOND', profileIcon: 5373, metricValue: 1.9, sharedChampions: ['Jinx', 'Caitlyn', 'Ashe'], isLive: true },
    { name: 'WardMaster_PL', rank: 'II', tier: 'DIAMOND', profileIcon: 4568, metricValue: 1.8, sharedChampions: ['Ezreal', 'Vayne'], isLive: false },
  ],
  vision_score_per_minute: [
    { name: 'WarszawaVision', rank: 'IV', tier: 'DIAMOND', profileIcon: 5373, metricValue: 1.9, sharedChampions: ['Jinx', 'Caitlyn', 'Ashe'], isLive: true },
  ],
  cs_per_minute: [
    { name: 'CSKing_Krakow', rank: 'III', tier: 'DIAMOND', profileIcon: 4352, metricValue: 8.2, sharedChampions: ['Jinx', 'Aphelios', 'Kaisa', 'Caitlyn'], isLive: false },
    { name: 'FarmGod_PL', rank: 'I', tier: 'EMERALD', profileIcon: 5124, metricValue: 7.8, sharedChampions: ['Vayne', 'Draven'], isLive: false },
  ],
  kill_participation: [
    { name: 'TeamPlayer_GDA', rank: 'II', tier: 'DIAMOND', profileIcon: 4891, metricValue: 72, sharedChampions: ['Jinx', 'Samira', 'Lucian'], isLive: false },
  ],
  damage_share: [
    { name: 'CarryKing_WAW', rank: 'I', tier: 'DIAMOND', profileIcon: 5012, metricValue: 28.5, sharedChampions: ['Jinx', 'Draven', 'Samira'], isLive: true },
  ],
  damage_per_minute: [
    { name: 'DPM_Monster', rank: 'III', tier: 'DIAMOND', profileIcon: 4765, metricValue: 820, sharedChampions: ['Jinx', 'Kaisa', 'Aphelios'], isLive: false },
  ],
  kda: [
    { name: 'SafePlay_PL', rank: 'II', tier: 'DIAMOND', profileIcon: 4234, metricValue: 4.2, sharedChampions: ['Ezreal', 'Caitlyn', 'Ashe'], isLive: false },
  ],
  objective_control: [
    { name: 'ObjFocus_POZ', rank: 'IV', tier: 'DIAMOND', profileIcon: 5432, metricValue: 65, sharedChampions: ['Jinx', 'Vayne'], isLive: false },
  ],
  gold_efficiency: [
    { name: 'GoldMaster_WRO', rank: 'I', tier: 'EMERALD', profileIcon: 4123, metricValue: 98, sharedChampions: ['Caitlyn', 'Ashe'], isLive: false },
  ],
  // Additional metrics for full coverage
  solo_kills: [
    { name: 'LaneKing_WAW', rank: 'II', tier: 'DIAMOND', profileIcon: 4891, metricValue: 2.8, sharedChampions: ['Fiora', 'Irelia', 'Riven'], isLive: false },
  ],
  objective_damage: [
    { name: 'TowerShred_KRK', rank: 'III', tier: 'DIAMOND', profileIcon: 5234, metricValue: 4200, sharedChampions: ['Jinx', 'Tristana', 'Ziggs'], isLive: false },
  ],
  positioning_score: [
    { name: 'Untouchable_PL', rank: 'I', tier: 'DIAMOND', profileIcon: 4567, metricValue: 85, sharedChampions: ['Ezreal', 'Caitlyn', 'Kai\'Sa'], isLive: false },
  ],
  death_efficiency: [
    { name: 'WorthyDeath_GDA', rank: 'II', tier: 'EMERALD', profileIcon: 5124, metricValue: 92, sharedChampions: ['Thresh', 'Nautilus', 'Leona'], isLive: true },
  ],
  crowd_control_score: [
    { name: 'CC_Master_POZ', rank: 'I', tier: 'DIAMOND', profileIcon: 4765, metricValue: 45, sharedChampions: ['Leona', 'Nautilus', 'Rakan'], isLive: false },
  ],
  roaming_impact: [
    { name: 'RoamKing_GDA', rank: 'IV', tier: 'DIAMOND', profileIcon: 5234, metricValue: 88, sharedChampions: ['Ahri', 'Syndra', 'Viktor'], isLive: false },
  ],
  jungle_proximity: [
    { name: 'PathMaster_WRO', rank: 'II', tier: 'DIAMOND', profileIcon: 4352, metricValue: 78, sharedChampions: ['Lee Sin', 'Viego', 'Graves'], isLive: false },
  ],
  early_game_impact: [
    { name: 'EarlyDominator_KRK', rank: 'I', tier: 'DIAMOND', profileIcon: 5012, metricValue: 72, sharedChampions: ['Elise', 'Rek\'Sai', 'Nidalee'], isLive: true },
  ],
  early_game_dominance: [
    { name: 'LaneBully_WAW', rank: 'III', tier: 'DIAMOND', profileIcon: 4568, metricValue: 68, sharedChampions: ['Darius', 'Renekton', 'Garen'], isLive: false },
  ],
  durability_score: [
    { name: 'IronWill_GDA', rank: 'II', tier: 'EMERALD', profileIcon: 5373, metricValue: 82, sharedChampions: ['Ornn', 'Malphite', 'Sion'], isLive: false },
  ],
  split_push_pressure: [
    { name: 'SplitPush_POZ', rank: 'I', tier: 'DIAMOND', profileIcon: 4234, metricValue: 76, sharedChampions: ['Fiora', 'Tryndamere', 'Jax'], isLive: false },
  ],
}

// Get a shadow player who excels at a specific metric (deterministic - always first match)
function getShadowForMetric(metricId: string): ShadowPlayer | undefined {
  const players = MOCK_SHADOW_PLAYERS[metricId]
  if (!players || players.length === 0) return undefined
  return players[0] // Always return first to avoid re-render changes
}

// Format metric values for display
function formatMetricValue(value: number, metricId: string): string {
  if (metricId.includes('kda')) return value.toFixed(2)
  if (value >= 100) return value.toFixed(0)
  if (value >= 10) return value.toFixed(1)
  return value.toFixed(2)
}

// Advice templates for improving metrics
const IMPROVEMENT_ADVICE: Record<string, string> = {
  vision_score: 'Buy control wards on every back.',
  vision_score_per_minute: 'Swap to sweeper after first item.',
  cs_per_minute: 'Catch side waves mid-game.',
  kill_participation: 'Track jungle and join skirmishes.',
  damage_share: 'Position aggressively in fights.',
  damage_per_minute: 'Look for poke before objectives.',
  kda: 'Review deaths - most come from overextending.',
  objective_control: 'Set up vision 1 min before drake.',
  gold_efficiency: 'Optimize item build timing.',
  positioning_score: 'Stay near frontline but safe.',
  solo_kills: 'Trade more aggressively in lane.',
  roaming_impact: 'Roam after cannon waves.',
  crowd_control_score: 'Land more abilities in fights.',
  death_efficiency: 'Trade deaths for objectives only.',
  objective_damage: 'Hit objectives when safe, not just champions.',
  durability_score: 'Build defensive when behind.',
  split_push_pressure: 'Apply side lane pressure before objectives.',
  jungle_proximity: 'Path efficiently between camps.',
  early_game_impact: 'Look for early gank opportunities.',
  early_game_dominance: 'Trade aggressively levels 1-3.'
}

// Generate focus items - always returns exactly 2 items: fix weakness + push strength
function generateFocusItems(
  weakMetrics: MetricData[],
  allMetrics: MetricData[] | undefined,
  role: string,
  targetRank: string
): FocusItem[] {
  const items: FocusItem[] = []
  const usedMetricIds = new Set<string>()

  // Helper to create a focus item
  const createItem = (metric: MetricData, mode: 'fix' | 'push'): FocusItem => {
    const gap = metric.polishAverage - metric.value
    // For next rank, target is 10% above current average
    const nextRankTarget = metric.polishAverage * 1.1
    const targetValue = mode === 'fix' ? metric.polishAverage : nextRankTarget

    let context: string
    if (mode === 'fix') {
      // Below average - show gap to average
      if (metric.id === 'cs_per_minute') {
        context = `You miss ~${Math.round(Math.abs(gap) * 15)} CS per game vs PL avg.`
      } else if (metric.id.includes('percent') || metric.id === 'kill_participation' || metric.id === 'damage_share') {
        context = `${formatMetricValue(Math.abs(gap), metric.id)}% below PL avg.`
      } else {
        context = `${formatMetricValue(Math.abs(gap), metric.id)} behind PL avg.`
      }
    } else {
      // Already good - show path to next rank
      const improvementNeeded = ((nextRankTarget - metric.value) / metric.value * 100).toFixed(0)
      context = `+${improvementNeeded}% to reach ${targetRank} level.`
    }

    // Get a shadow player who excels at this metric
    const shadowPlayer = getShadowForMetric(metric.id)

    return {
      id: metric.id,
      title: mode === 'fix'
        ? `Fix: ${metric.name} → ${formatMetricValue(targetValue, metric.id)}`
        : `Push: ${metric.name} → ${formatMetricValue(targetValue, metric.id)}`,
      context,
      metricName: metric.name,
      gap: Math.abs(gap),
      targetValue,
      shadowPlayer,
      mode,
      playerValue: metric.value
    }
  }

  // Slot 1: Fix the weakest metric (below average)
  if (weakMetrics.length > 0) {
    const weakest = weakMetrics[0]
    items.push(createItem(weakest, 'fix'))
    usedMetricIds.add(weakest.id)
  }

  // Slot 2: Push the strongest metric (above average or best percentile)
  if (allMetrics && allMetrics.length > 0) {
    // Find strongest metrics (highest above average, excluding used ones)
    const strongMetrics = [...allMetrics]
      .filter(m => !usedMetricIds.has(m.id))
      .filter(m => m.value >= m.polishAverage) // Only metrics where player is at or above average
      .sort((a, b) => {
        // Sort by how much above average (percentage)
        const aAbove = (a.value - a.polishAverage) / a.polishAverage
        const bAbove = (b.value - b.polishAverage) / b.polishAverage
        return bAbove - aAbove
      })

    if (strongMetrics.length > 0) {
      items.push(createItem(strongMetrics[0], 'push'))
      usedMetricIds.add(strongMetrics[0].id)
    }
  }

  // If we still don't have 2 items, fill with whatever we can
  if (items.length < 2 && allMetrics && allMetrics.length > 0) {
    const remaining = [...allMetrics]
      .filter(m => !usedMetricIds.has(m.id))
      .sort((a, b) => {
        // Sort by percentile or improvement potential
        const aRoom = (a.polishAverage * 1.1 - a.value) / a.value
        const bRoom = (b.polishAverage * 1.1 - b.value) / b.value
        return bRoom - aRoom
      })

    for (const metric of remaining) {
      if (items.length >= 2) break
      const isWeak = metric.value < metric.polishAverage
      items.push(createItem(metric, isWeak ? 'fix' : 'push'))
      usedMetricIds.add(metric.id)
    }
  }

  // If we only have fix items (no push), add another fix from weak metrics
  if (items.length < 2 && weakMetrics.length > 1) {
    const secondWeak = weakMetrics.find(m => !usedMetricIds.has(m.id))
    if (secondWeak) {
      items.push(createItem(secondWeak, 'fix'))
    }
  }

  return items
}

// Role options for duo queue
const ROLE_OPTIONS = [
  { id: 'top', label: 'Top', icon: '🛡️' },
  { id: 'jungle', label: 'Jungle', icon: '🌲' },
  { id: 'mid', label: 'Mid', icon: '⚡' },
  { id: 'adc', label: 'ADC', icon: '🎯' },
  { id: 'support', label: 'Support', icon: '💚' },
]

export default function FocusPlanSidebar({
  targetRank,
  weakMetrics,
  allMetrics,
  role,
  totalMatchesAnalyzed = 85203,
  horizontal = false,
  hideDuoCard = false,
  duoCardOnly = false
}: FocusPlanSidebarProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [showFindOthers, setShowFindOthers] = useState(false)
  const [duoRole, setDuoRole] = useState<string>('')
  const [duoAvailability, setDuoAvailability] = useState<string>('')
  const [duoVoiceChat, setDuoVoiceChat] = useState<boolean | null>(null)
  const [duoSubmitted, setDuoSubmitted] = useState(false)
  const focusItems = generateFocusItems(weakMetrics, allMetrics, role, targetRank)
  const suggestedDuo = getDuoPartner(role)

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(id)) {
      newChecked.delete(id)
    } else {
      newChecked.add(id)
    }
    setCheckedItems(newChecked)
  }

  // Get primary weak metric names for subtitle
  const weakMetricNames = weakMetrics.slice(0, 2).map(m => m.name)

  // Horizontal layout for bottom section
  if (horizontal) {
    // If duoCardOnly, only render the duo card
    if (duoCardOnly) {
      return (
        <>
          {/* Duo Partner Card - Standalone */}
          {suggestedDuo && !showFindOthers ? (
            <div className="h-full p-5 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/5 flex flex-col">
              {/* Card Label */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Duo partner</span>
                </div>
                {suggestedDuo.isLive && (
                  <div className="px-2 py-1 rounded bg-red-500 text-white text-[9px] font-bold flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    LIVE
                  </div>
                )}
              </div>

              {/* Player Header */}
              <div className="flex items-start gap-4 mb-5">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/profileicon/${suggestedDuo.profileIcon}.png`}
                  alt="Profile"
                  className="w-16 h-16 rounded-lg border-2 border-cyan-500/50"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-white truncate mb-1">
                    {suggestedDuo.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src={`/ranks/${suggestedDuo.tier.toLowerCase()}.png`}
                      alt={suggestedDuo.tier}
                      className="w-5 h-5"
                    />
                    <span className="text-base text-cyan-400 font-medium">
                      {suggestedDuo.tier.charAt(0) + suggestedDuo.tier.slice(1).toLowerCase()} {suggestedDuo.rank}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                      {suggestedDuo.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Why duo - reason box */}
              <div className="bg-black/30 rounded-lg p-4 mb-5 border border-cyan-500/10">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Why duo</div>
                <div className="text-sm text-gray-300 mb-2">
                  {suggestedDuo.whyComplement}
                </div>
                <div className="text-sm text-gray-500">
                  <span className="text-cyan-400 font-medium">{suggestedDuo.strongMetric}:</span>{' '}
                  <span className="text-white font-bold">{suggestedDuo.strongMetricValue}</span>
                </div>
              </div>

              {/* Champions they play */}
              <div className="flex-grow">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Plays</div>
                <div className="flex items-center gap-2">
                  {suggestedDuo.sharedChampions.slice(0, 4).map((champ) => (
                    <img
                      key={champ}
                      src={`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/${champ}.png`}
                      alt={champ}
                      className="w-10 h-10 rounded-lg border border-cyan-500/20"
                      title={champ}
                    />
                  ))}
                </div>
              </div>

              {/* Double CTA Buttons */}
              <div className="flex gap-2 mt-4">
                {suggestedDuo.isLive ? (
                  <>
                    <button className="flex-1 text-sm font-bold py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      Watch
                    </button>
                    <button className="flex-1 text-sm font-medium py-3 rounded-lg bg-black/30 hover:bg-black/50 text-gray-300 border border-cyan-500/20 transition-colors">
                      Check profile
                    </button>
                  </>
                ) : (
                  <>
                    <button className="flex-1 text-sm font-bold py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white transition-colors flex items-center justify-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Add friend
                    </button>
                    <button className="flex-1 text-sm font-medium py-3 rounded-lg bg-black/30 hover:bg-black/50 text-gray-300 border border-cyan-500/20 transition-colors">
                      Check profile
                    </button>
                  </>
                )}
              </div>

              {/* Find others link */}
              <button
                onClick={() => setShowFindOthers(true)}
                className="w-full text-xs text-gray-500 hover:text-cyan-400 transition-colors mt-3"
              >
                Not a match? Find other partners →
              </button>
            </div>
          ) : (
            /* Find Others Form Card */
            <div className="h-full p-5 rounded-xl bg-[#0f121d] border border-[#1e2836]">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Find duo partner</span>
              </div>

              {!duoSubmitted ? (
                <>
                  {/* Role Selection */}
                  <div className="mb-4">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Looking for</div>
                    <div className="flex flex-wrap gap-1.5">
                      {ROLE_OPTIONS.map(r => (
                        <button
                          key={r.id}
                          onClick={() => setDuoRole(r.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            duoRole === r.id
                              ? 'bg-cyan-500 text-white'
                              : 'bg-[#151b28] text-gray-400 hover:bg-[#1a1f2e] border border-[#2a3142]'
                          }`}
                        >
                          {r.icon} {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="mb-4">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">When do you play?</div>
                    <div className="flex gap-1.5">
                      {['Evenings', 'Weekends', 'Flexible'].map(time => (
                        <button
                          key={time}
                          onClick={() => setDuoAvailability(time)}
                          className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            duoAvailability === time
                              ? 'bg-cyan-500 text-white'
                              : 'bg-[#151b28] text-gray-400 hover:bg-[#1a1f2e] border border-[#2a3142]'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Voice Chat */}
                  <div className="mb-4">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Voice chat?</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDuoVoiceChat(true)}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          duoVoiceChat === true
                            ? 'bg-cyan-500 text-white'
                            : 'bg-[#151b28] text-gray-400 hover:bg-[#1a1f2e] border border-[#2a3142]'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDuoVoiceChat(false)}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          duoVoiceChat === false
                            ? 'bg-cyan-500 text-white'
                            : 'bg-[#151b28] text-gray-400 hover:bg-[#1a1f2e] border border-[#2a3142]'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      if (duoRole && duoAvailability && duoVoiceChat !== null) {
                        console.log('Duo preferences:', { duoRole, duoAvailability, duoVoiceChat })
                        setDuoSubmitted(true)
                      }
                    }}
                    disabled={!duoRole || !duoAvailability || duoVoiceChat === null}
                    className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
                      duoRole && duoAvailability && duoVoiceChat !== null
                        ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                        : 'bg-[#1a1f2e] text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Find my duo
                  </button>

                  {/* Back to suggestion */}
                  {suggestedDuo && (
                    <button
                      onClick={() => setShowFindOthers(false)}
                      className="w-full mt-3 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
                    >
                      ← Back to suggestion
                    </button>
                  )}
                </>
              ) : (
                /* Success State */
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-sm font-bold text-white mb-1">You're on the list!</div>
                  <div className="text-xs text-gray-400 mb-3">
                    We'll notify you when we find a {ROLE_OPTIONS.find(r => r.id === duoRole)?.label} player in your area.
                  </div>
                  <div className="text-[10px] text-gray-500">
                    12 players looking for {role} partners nearby
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {focusItems.map(item => {
          const shadow = item.shadowPlayer
          const isFixMode = item.mode === 'fix'

          if (!shadow) return null

          return (
            <div
              key={item.id}
              className={`p-4 rounded-lg transition-all flex flex-col ${
                isFixMode
                  ? 'bg-[#0f121d] border border-[#1e2836] hover:border-red-500/30'
                  : 'bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border border-emerald-500/20 hover:border-emerald-500/40'
              }`}
            >
              {/* Card Header with Label */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {isFixMode ? (
                    <>
                      <div className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Fix weakness</span>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Level up</span>
                    </>
                  )}
                </div>
                {shadow.isLive && (
                  <div className="px-2 py-1 rounded bg-red-500 text-white text-[9px] font-bold flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    LIVE
                  </div>
                )}
              </div>

              {/* Player Header */}
              <div className="flex items-start gap-3 mb-4">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/profileicon/${shadow.profileIcon}.png`}
                  alt="Profile"
                  className={`w-14 h-14 rounded-lg border-2 ${isFixMode ? 'border-cyan-500/50' : 'border-emerald-500/50'}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-white truncate mb-0.5">
                    {shadow.name}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <img
                      src={`/ranks/${shadow.tier.toLowerCase()}.png`}
                      alt={shadow.tier}
                      className="w-4 h-4"
                    />
                    <span className={`text-sm font-medium ${isFixMode ? 'text-cyan-400' : 'text-emerald-400'}`}>
                      {shadow.tier.charAt(0) + shadow.tier.slice(1).toLowerCase()} {shadow.rank}
                    </span>
                  </div>
                </div>
              </div>

              {/* Why watch this player - reason box */}
              <div className={`rounded-lg p-3 mb-4 border ${
                isFixMode
                  ? 'bg-[#1a1f2e] border-cyan-500/10'
                  : 'bg-black/20 border-emerald-500/10'
              }`}>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Why watch</div>
                <div className="text-sm text-gray-300">
                  {isFixMode ? (
                    <>
                      Excels at <span className="text-cyan-400 font-semibold">{item.metricName}</span> with{' '}
                      <span className="text-white font-bold">{formatMetricValue(shadow.metricValue, item.id)}</span>
                      {' '}<span className="text-gray-500">(you: {formatMetricValue(item.playerValue, item.id)})</span>
                    </>
                  ) : (
                    <>
                      Push your <span className="text-emerald-400 font-semibold">{item.metricName}</span> higher — they hit{' '}
                      <span className="text-white font-bold">{formatMetricValue(shadow.metricValue, item.id)}</span>
                      {' '}<span className="text-gray-500">(you: {formatMetricValue(item.playerValue, item.id)})</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1.5">
                  {isFixMode
                    ? (IMPROVEMENT_ADVICE[item.id] || 'Study their gameplay to improve.')
                    : 'Study their techniques to reach the next level.'
                  }
                </div>
              </div>

              {/* Shared Champions */}
              <div className="flex-grow">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Plays your champions</div>
                <div className="flex items-center gap-1.5">
                  {shadow.sharedChampions.slice(0, 4).map((champ) => (
                    <img
                      key={champ}
                      src={`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/${champ}.png`}
                      alt={champ}
                      className="w-8 h-8 rounded-lg border border-[#2a3142]"
                      title={champ}
                    />
                  ))}
                </div>
              </div>

              {/* Double CTA Buttons */}
              <div className="flex gap-2 mt-4">
                {shadow.isLive ? (
                  <>
                    <button className="flex-1 text-xs font-bold py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      Watch
                    </button>
                    <button className="flex-1 text-xs font-medium py-2.5 rounded-lg bg-[#1a1f2e] hover:bg-[#252b3d] text-gray-300 border border-[#2a3142] transition-colors">
                      Check profile
                    </button>
                  </>
                ) : (
                  <>
                    <button className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                      isFixMode
                        ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      Notify when live
                    </button>
                    <button className="flex-1 text-xs font-medium py-2.5 rounded-lg bg-[#1a1f2e] hover:bg-[#252b3d] text-gray-300 border border-[#2a3142] transition-colors">
                      Check profile
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}

        {/* Duo Partner Card - Only show if not hidden */}
        {!hideDuoCard && suggestedDuo && !showFindOthers ? (
          <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/5">
            {/* Card Label */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Duo partner</span>
              </div>
              {suggestedDuo.isLive && (
                <div className="px-2 py-1 rounded bg-red-500 text-white text-[9px] font-bold flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  LIVE
                </div>
              )}
            </div>

            {/* Player Header */}
            <div className="flex items-start gap-3 mb-4">
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/profileicon/${suggestedDuo.profileIcon}.png`}
                alt="Profile"
                className="w-14 h-14 rounded-lg border-2 border-cyan-500/50"
              />
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold text-white truncate mb-0.5">
                  {suggestedDuo.name}
                </div>
                <div className="flex items-center gap-1.5">
                  <img
                    src={`/ranks/${suggestedDuo.tier.toLowerCase()}.png`}
                    alt={suggestedDuo.tier}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-cyan-400 font-medium">
                    {suggestedDuo.tier.charAt(0) + suggestedDuo.tier.slice(1).toLowerCase()} {suggestedDuo.rank}
                  </span>
                  <span className="text-xs text-gray-500">• {suggestedDuo.role}</span>
                </div>
              </div>
            </div>

            {/* Why duo - reason box */}
            <div className="bg-black/30 rounded-lg p-3 mb-4 border border-cyan-500/10">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Why duo</div>
              <div className="text-sm text-gray-300 mb-1">
                {suggestedDuo.whyComplement}
              </div>
              <div className="text-xs text-gray-500">
                <span className="text-cyan-400 font-medium">{suggestedDuo.strongMetric}:</span>{' '}
                <span className="text-white font-bold">{suggestedDuo.strongMetricValue}</span>
              </div>
            </div>

            {/* Champions they play */}
            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Plays</div>
              <div className="flex items-center gap-1.5">
                {suggestedDuo.sharedChampions.slice(0, 4).map((champ) => (
                  <img
                    key={champ}
                    src={`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/${champ}.png`}
                    alt={champ}
                    className="w-8 h-8 rounded-lg border border-cyan-500/20"
                    title={champ}
                  />
                ))}
              </div>
            </div>

            {/* Double CTA Buttons */}
            <div className="flex gap-2 mb-3">
              {suggestedDuo.isLive ? (
                <>
                  <button className="flex-1 text-xs font-bold py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    Watch
                  </button>
                  <button className="flex-1 text-xs font-medium py-2.5 rounded-lg bg-black/30 hover:bg-black/50 text-gray-300 border border-cyan-500/20 transition-colors">
                    Check profile
                  </button>
                </>
              ) : (
                <>
                  <button className="flex-1 text-xs font-bold py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white transition-colors flex items-center justify-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Add friend
                  </button>
                  <button className="flex-1 text-xs font-medium py-2.5 rounded-lg bg-black/30 hover:bg-black/50 text-gray-300 border border-cyan-500/20 transition-colors">
                    Check profile
                  </button>
                </>
              )}
            </div>

            {/* Find others link */}
            <button
              onClick={() => setShowFindOthers(true)}
              className="w-full text-xs text-gray-500 hover:text-cyan-400 transition-colors"
            >
              Not a match? Find other partners →
            </button>
          </div>
        ) : !hideDuoCard ? (
          /* Find Others Form Card */
          <div className="p-4 rounded-lg bg-[#151b28] border border-[#1e2836]">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Find duo partner</span>
            </div>

            {!duoSubmitted ? (
              <>
                {/* Role Selection */}
                <div className="mb-4">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Looking for</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ROLE_OPTIONS.map(r => (
                      <button
                        key={r.id}
                        onClick={() => setDuoRole(r.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          duoRole === r.id
                            ? 'bg-cyan-500 text-white'
                            : 'bg-[#0f121d] text-gray-400 hover:bg-[#1a1f2e] border border-[#2a3142]'
                        }`}
                      >
                        {r.icon} {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="mb-4">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">When do you play?</div>
                  <div className="flex gap-1.5">
                    {['Evenings', 'Weekends', 'Flexible'].map(time => (
                      <button
                        key={time}
                        onClick={() => setDuoAvailability(time)}
                        className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          duoAvailability === time
                            ? 'bg-cyan-500 text-white'
                            : 'bg-[#0f121d] text-gray-400 hover:bg-[#1a1f2e] border border-[#2a3142]'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice Chat */}
                <div className="mb-4">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Voice chat?</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDuoVoiceChat(true)}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        duoVoiceChat === true
                          ? 'bg-cyan-500 text-white'
                          : 'bg-[#0f121d] text-gray-400 hover:bg-[#1a1f2e] border border-[#2a3142]'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setDuoVoiceChat(false)}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        duoVoiceChat === false
                          ? 'bg-cyan-500 text-white'
                          : 'bg-[#0f121d] text-gray-400 hover:bg-[#1a1f2e] border border-[#2a3142]'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => {
                    if (duoRole && duoAvailability && duoVoiceChat !== null) {
                      console.log('Duo preferences:', { duoRole, duoAvailability, duoVoiceChat })
                      setDuoSubmitted(true)
                    }
                  }}
                  disabled={!duoRole || !duoAvailability || duoVoiceChat === null}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
                    duoRole && duoAvailability && duoVoiceChat !== null
                      ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                      : 'bg-[#1a1f2e] text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Find my duo
                </button>

                {/* Back to suggestion */}
                {suggestedDuo && (
                  <button
                    onClick={() => setShowFindOthers(false)}
                    className="w-full mt-3 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
                  >
                    ← Back to suggestion
                  </button>
                )}
              </>
            ) : (
              /* Success State */
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-sm font-bold text-white mb-1">You're on the list!</div>
                <div className="text-xs text-gray-400 mb-3">
                  We'll notify you when we find a {ROLE_OPTIONS.find(r => r.id === duoRole)?.label} player in your area.
                </div>
                <div className="text-[10px] text-gray-500">
                  12 players looking for {role} partners nearby
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Empty state */}
        {focusItems.length === 0 && (
          <div className="col-span-2 text-center py-4">
            <div className="text-sm text-gray-400">
              Play more games to get personalized advice.
            </div>
          </div>
        )}
      </div>
    )
  }

  // Original vertical sidebar layout
  return (
    <div
      className="h-full rounded-xl p-5 border border-cyan-500/20 sticky top-6"
      style={{
        background: 'linear-gradient(180deg, rgba(30, 34, 48, 0.8) 0%, rgba(15, 18, 29, 0.9) 100%)'
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">
          Focus plan
        </div>
        <h3 className="text-lg font-bold text-white">
          Road to {targetRank}
        </h3>
        <p className="text-xs text-gray-400 mt-2">
          {weakMetricNames.length > 0 ? (
            <>
              Fix{' '}
              {weakMetricNames.map((name, idx) => (
                <span key={name}>
                  <span className="text-red-400">{name}</span>
                  {idx < weakMetricNames.length - 1 && ', '}
                </span>
              ))}
              {' '}+ push your strengths.
            </>
          ) : (
            <>Push your best metrics to reach {targetRank}.</>
          )}
        </p>
      </div>

      {/* Checklist */}
      <div className="space-y-4">
        {focusItems.map(item => {
          const isChecked = checkedItems.has(item.id)

          return (
            <div
              key={item.id}
              className="flex gap-3 group cursor-pointer"
              onClick={() => toggleItem(item.id)}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all ${
                  isChecked
                    ? 'bg-cyan-500 border-cyan-500'
                    : 'border-white/20 bg-black/50 group-hover:border-cyan-400'
                }`}
              >
                {isChecked && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <div
                  className={`text-sm font-medium transition-colors ${
                    isChecked
                      ? 'text-gray-500 line-through'
                      : 'text-white group-hover:text-cyan-400'
                  }`}
                >
                  {item.title}
                </div>
                <div className="text-[10px] text-gray-500">
                  {item.context}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty state - should rarely happen now */}
      {focusItems.length === 0 && (
        <div className="text-center py-8">
          <div className="text-sm text-gray-400">
            Play more games to get personalized advice.
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-white/5">
        <div className="text-[10px] text-gray-500 text-center">
          Comparisons based on{' '}
          <span className="text-white">{totalMatchesAnalyzed.toLocaleString()}</span>
          {' '}matches in{' '}
          <span className="text-white">Poland (EUNE)</span>.
        </div>
      </div>
    </div>
  )
}
