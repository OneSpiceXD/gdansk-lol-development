import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { getTierFromPercentile, calculatePointContribution } from '@/lib/tierCalculator'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

interface RoleMetric {
  id: string
  name: string
  value: number
  percentile: number
  polishAverage: number
  euwAverage: number
  tier: string
  tierColor: string
  pointContribution: number
  badge: {
    text: string
    bg: string
    label: string
  }
}

/**
 * GET /api/player/[summoner_name]/role-stats
 *
 * Query parameters:
 * - role: Role to filter by (Top, Jungle, Mid, ADC, Support, All Roles)
 * - games: Number of games to analyze (10, 20, 50)
 *
 * Returns role-specific metrics with percentiles and benchmarks
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ summoner_name: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role') || 'All Roles'
    const gamesCount = parseInt(searchParams.get('games') || '10', 10)

    // Await params (Next.js 16 requirement)
    const { summoner_name } = await params
    const summonerName = decodeURIComponent(summoner_name)

    // Try to get player ID from database
    let playerResult
    let useMockData = false

    try {
      playerResult = await pool.query(
        'SELECT id, tier FROM players WHERE LOWER(summoner_name) = LOWER($1)',
        [summonerName]
      )

      if (playerResult.rows.length === 0) {
        // Player not found in DB, use mock data
        useMockData = true
      }
    } catch (dbError) {
      // Database connection failed, use mock data
      console.log('Database not available, using mock data')
      useMockData = true
    }

    // If we need to use mock data, return it immediately
    if (useMockData) {
      const mockMetrics = getMockMetricsForRole(role)
      return NextResponse.json({
        role,
        gamesAnalyzed: 20,
        metrics: mockMetrics,
        sideStats: {
          blue: { winrate: 54.5, kda: 3.65, games: 11 },
          red: { winrate: 44.4, kda: 3.15, games: 9 },
        },
        phaseStats: {
          early: { kda: 3.8, winrate: 55, games: 8 },
          mid: { kda: 3.4, winrate: 50, games: 8 },
          late: { kda: 2.9, winrate: 45, games: 4 },
        },
        currentTier: 'GOLD',
        currentRank: 'II',
        isMockData: true,
      })
    }

    const player = playerResult!.rows[0]
    const playerId = player.id
    const playerTier = player.tier
    const playerRank = player.rank

    // Map frontend role names to database role names
    const dbRole = mapRoleToDb(role)

    // Get match stats for the specified role and game count
    let query = `
      SELECT *
      FROM match_stats
      WHERE player_id = $1
    `
    const queryParams: any[] = [playerId]

    if (dbRole !== 'ALL') {
      query += ` AND role = $2`
      queryParams.push(dbRole)
    }

    query += ` ORDER BY recorded_at DESC LIMIT $${queryParams.length + 1}`
    queryParams.push(gamesCount)

    const matchesResult = await pool.query(query, queryParams)

    if (matchesResult.rows.length === 0) {
      // Return mock data for visual testing
      const mockMetrics = getMockMetricsForRole(role)
      return NextResponse.json({
        role,
        gamesAnalyzed: 20,
        metrics: mockMetrics,
        sideStats: {
          blue: { winrate: 54.5, kda: 3.65, games: 11 },
          red: { winrate: 44.4, kda: 3.15, games: 9 },
        },
        phaseStats: {
          early: { kda: 3.8, winrate: 55, games: 8 },
          mid: { kda: 3.4, winrate: 50, games: 8 },
          late: { kda: 2.9, winrate: 45, games: 4 },
        },
        isMockData: true,
      })
    }

    // Calculate aggregated metrics based on role
    const metrics = await calculateRoleMetrics(
      matchesResult.rows,
      role,
      playerTier
    )

    // Calculate side statistics (blue vs red)
    const sideStats = calculateSideStats(matchesResult.rows)

    // Calculate phase statistics (early, mid, late)
    const phaseStats = calculatePhaseStats(matchesResult.rows)

    return NextResponse.json({
      role,
      gamesAnalyzed: matchesResult.rows.length,
      metrics,
      sideStats,
      phaseStats,
      currentTier: playerTier,
      currentRank: playerRank,
    })
  } catch (error) {
    console.error('Error fetching role stats:', error)

    // Fallback to mock data on any error
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role') || 'All Roles'
    const mockMetrics = getMockMetricsForRole(role)

    return NextResponse.json({
      role,
      gamesAnalyzed: 20,
      metrics: mockMetrics,
      sideStats: {
        blue: { winrate: 54.5, kda: 3.65, games: 11 },
        red: { winrate: 44.4, kda: 3.15, games: 9 },
      },
      phaseStats: {
        early: { kda: 3.8, winrate: 55, games: 8 },
        mid: { kda: 3.4, winrate: 50, games: 8 },
        late: { kda: 2.9, winrate: 45, games: 4 },
      },
      currentTier: 'GOLD',
      currentRank: 'II',
      isMockData: true,
    })
  }
}

/**
 * Map frontend role names to database role names
 */
function mapRoleToDb(role: string): string {
  const roleMap: { [key: string]: string } = {
    'All Roles': 'ALL',
    'Top': 'TOP',
    'Jungle': 'JUNGLE',
    'Mid': 'MID',
    'ADC': 'ADC',
    'Support': 'SUPPORT',
  }
  return roleMap[role] || 'ALL'
}

/**
 * Calculate aggregated metrics for a role
 */
async function calculateRoleMetrics(
  matches: any[],
  role: string,
  playerTier: string
): Promise<RoleMetric[]> {
  if (matches.length === 0) {
    return []
  }

  const metrics: RoleMetric[] = []

  // Define metrics based on role
  const metricDefinitions = getMetricDefinitionsForRole(role)

  for (const metricDef of metricDefinitions) {
    // Calculate average value across matches
    const values = matches
      .map((m) => m[metricDef.dbField])
      .filter((v) => v !== null && v !== undefined)

    if (values.length === 0) {
      continue
    }

    const avgValue = values.reduce((sum, v) => sum + parseFloat(v), 0) / values.length

    // Get percentile and benchmarks
    const percentileData = await getPercentileData(
      metricDef.dbField,
      role,
      playerTier,
      avgValue
    )

    // Calculate tier information
    const tierInfo = getTierFromPercentile(percentileData.percentile)
    const points = calculatePointContribution(percentileData.percentile)

    metrics.push({
      id: metricDef.id,
      name: metricDef.name,
      value: parseFloat(avgValue.toFixed(metricDef.decimals || 1)),
      percentile: percentileData.percentile,
      polishAverage: percentileData.polishAverage,
      euwAverage: percentileData.euwAverage,
      tier: tierInfo.name,
      tierColor: tierInfo.color,
      pointContribution: points,
      badge: getPercentileBadge(percentileData.percentile),
    })
  }

  return metrics
}

/**
 * Get metric definitions for a specific role
 */
function getMetricDefinitionsForRole(role: string) {
  const definitions: { [key: string]: any[] } = {
    'ADC': [
      { id: 'damage_per_minute', name: 'Damage per Minute', dbField: 'damage_per_minute', decimals: 1 },
      { id: 'cs_per_minute', name: 'CS/Min', dbField: 'cs_per_minute', decimals: 1 },
      { id: 'damage_share', name: 'Damage Share %', dbField: 'damage_share', decimals: 1 },
      { id: 'gold_efficiency', name: 'Gold Efficiency', dbField: 'gold_efficiency', decimals: 2 },
      { id: 'positioning_score', name: 'Positioning Score', dbField: 'positioning_score', decimals: 0 },
      { id: 'objective_damage', name: 'Objective Damage', dbField: 'damage_to_objectives', decimals: 0 },
    ],
    'Support': [
      { id: 'vision_score_per_minute', name: 'Vision Score/Min', dbField: 'vision_score_per_minute', decimals: 2 },
      { id: 'kill_participation', name: 'Kill Participation %', dbField: 'kill_participation', decimals: 1 },
      { id: 'crowd_control_score', name: 'Crowd Control Score', dbField: 'time_ccing_others', decimals: 1 },
      { id: 'roaming_impact', name: 'Roaming Impact', dbField: 'roaming_impact', decimals: 0 },
      { id: 'gold_efficiency', name: 'Gold Efficiency', dbField: 'gold_efficiency', decimals: 2 },
      { id: 'death_efficiency', name: 'Death Efficiency', dbField: 'death_efficiency', decimals: 1 },
    ],
    'Jungle': [
      { id: 'cs_per_minute', name: 'CS/Min', dbField: 'cs_per_minute', decimals: 1 },
      { id: 'kill_participation', name: 'Kill Participation %', dbField: 'kill_participation', decimals: 1 },
      { id: 'objective_control', name: 'Objective Control', dbField: 'objective_control_score', decimals: 0 },
      { id: 'early_game_impact', name: 'Early Game Impact', dbField: 'takedowns_first_15_min', decimals: 0 },
      { id: 'vision_score', name: 'Vision Score', dbField: 'vision_score', decimals: 1 },
      { id: 'jungle_proximity', name: 'Jungle Proximity', dbField: 'jungle_proximity', decimals: 1 },
    ],
    'Mid': [
      { id: 'damage_per_minute', name: 'Damage per Minute', dbField: 'damage_per_minute', decimals: 1 },
      { id: 'cs_per_minute', name: 'CS/Min', dbField: 'cs_per_minute', decimals: 1 },
      { id: 'roaming_impact', name: 'Roaming Impact', dbField: 'roaming_impact', decimals: 0 },
      { id: 'kill_participation', name: 'Kill Participation %', dbField: 'kill_participation', decimals: 1 },
      { id: 'solo_kills', name: 'Solo Kills', dbField: 'solo_kills', decimals: 0 },
      { id: 'vision_score', name: 'Vision Score', dbField: 'vision_score', decimals: 1 },
    ],
    'Top': [
      { id: 'cs_per_minute', name: 'CS/Min', dbField: 'cs_per_minute', decimals: 1 },
      { id: 'damage_per_minute', name: 'Damage per Minute', dbField: 'damage_per_minute', decimals: 1 },
      { id: 'solo_kills', name: 'Solo Kills', dbField: 'solo_kills', decimals: 0 },
      { id: 'early_game_dominance', name: 'Early Game Dominance', dbField: 'early_game_dominance', decimals: 2 },
      { id: 'durability_score', name: 'Durability Score', dbField: 'durability_score', decimals: 0 },
      { id: 'split_push_pressure', name: 'Split Push Pressure', dbField: 'split_push_pressure', decimals: 1 },
    ],
    'All Roles': [
      { id: 'kda', name: 'KDA', dbField: 'kda', decimals: 2 },
      { id: 'cs_per_minute', name: 'CS/Min', dbField: 'cs_per_minute', decimals: 1 },
      { id: 'kill_participation', name: 'Kill Participation %', dbField: 'kill_participation', decimals: 1 },
      { id: 'vision_score', name: 'Vision Score', dbField: 'vision_score', decimals: 1 },
      { id: 'damage_share', name: 'Damage Share %', dbField: 'damage_share', decimals: 1 },
      { id: 'objective_control', name: 'Objective Participation', dbField: 'objective_control_score', decimals: 0 },
    ],
  }

  return definitions[role] || definitions['All Roles']
}

/**
 * Get percentile rank and benchmark data for a metric
 */
async function getPercentileData(
  metricName: string,
  role: string,
  playerTier: string,
  value: number
) {
  try {
    const dbRole = mapRoleToDb(role)

    // Get Polish percentile data
    const polishResult = await pool.query(
      `SELECT * FROM role_percentiles
       WHERE role = $1 AND tier = $2 AND region = 'POLISH' AND metric_name = $3`,
      [dbRole, playerTier, metricName]
    )

    // Get EUW percentile data
    const euwResult = await pool.query(
      `SELECT * FROM role_percentiles
       WHERE role = $1 AND tier = $2 AND region = 'EUW' AND metric_name = $3`,
      [dbRole, playerTier, metricName]
    )

    const polishData = polishResult.rows[0]
    const euwData = euwResult.rows[0]

    let percentile = 50 // Default

    if (polishData) {
      // Calculate percentile based on where value falls
      if (value >= parseFloat(polishData.p90)) percentile = 10
      else if (value >= parseFloat(polishData.p80)) percentile = 20
      else if (value >= parseFloat(polishData.p70)) percentile = 30
      else if (value >= parseFloat(polishData.p60)) percentile = 40
      else if (value >= parseFloat(polishData.p50)) percentile = 50
      else if (value >= parseFloat(polishData.p40)) percentile = 60
      else if (value >= parseFloat(polishData.p30)) percentile = 70
      else if (value >= parseFloat(polishData.p20)) percentile = 80
      else if (value >= parseFloat(polishData.p10)) percentile = 90
      else percentile = 95
    }

    return {
      percentile,
      polishAverage: polishData ? parseFloat(polishData.mean_value) : 0,
      euwAverage: euwData ? parseFloat(euwData.mean_value) : 0,
    }
  } catch (error) {
    console.error('Error getting percentile data:', error)
    return {
      percentile: 50,
      polishAverage: 0,
      euwAverage: 0,
    }
  }
}

/**
 * Get percentile badge styling
 */
function getPercentileBadge(percentile: number) {
  const roundedPercentile = Math.round(percentile / 20) * 20

  if (roundedPercentile <= 20) {
    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/15',
      label: `Top ${roundedPercentile}%`,
    }
  } else if (roundedPercentile <= 40) {
    return {
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/15',
      label: `Top ${roundedPercentile}%`,
    }
  } else if (roundedPercentile <= 60) {
    return {
      text: 'text-yellow-400',
      bg: 'bg-yellow-500/15',
      label: `Top ${roundedPercentile}%`,
    }
  } else if (roundedPercentile <= 80) {
    return {
      text: 'text-gray-400',
      bg: 'bg-gray-500/15',
      label: 'Average',
    }
  } else {
    return {
      text: 'text-gray-400',
      bg: 'bg-gray-500/15',
      label: 'Below Average',
    }
  }
}

/**
 * Add tier information to a metric
 */
function addTierInfo(metric: Partial<RoleMetric>): RoleMetric {
  const tierInfo = getTierFromPercentile(metric.percentile!)
  const points = calculatePointContribution(metric.percentile!)

  return {
    ...metric,
    tier: tierInfo.name,
    tierColor: tierInfo.color,
    pointContribution: points,
  } as RoleMetric
}

/**
 * Get mock metrics for visual testing
 */
function getMockMetricsForRole(role: string): RoleMetric[] {
  const mockData: { [key: string]: Partial<RoleMetric>[] } = {
    'ADC': [
      { id: 'damage_per_minute', name: 'Damage per Minute', value: 954.2, percentile: 12, polishAverage: 820.5, euwAverage: 875.3, badge: getPercentileBadge(12) },
      { id: 'cs_per_minute', name: 'CS/Min', value: 7.8, percentile: 22, polishAverage: 7.1, euwAverage: 7.3, badge: getPercentileBadge(22) },
      { id: 'damage_share', name: 'Damage Share %', value: 32.5, percentile: 18, polishAverage: 28.3, euwAverage: 29.8, badge: getPercentileBadge(18) },
      { id: 'gold_efficiency', name: 'Gold Efficiency', value: 1.24, percentile: 35, polishAverage: 1.15, euwAverage: 1.18, badge: getPercentileBadge(35) },
      { id: 'positioning_score', name: 'Positioning Score', value: 8420, percentile: 28, polishAverage: 7200, euwAverage: 7600, badge: getPercentileBadge(28) },
      { id: 'objective_damage', name: 'Objective Damage', value: 9250, percentile: 15, polishAverage: 7800, euwAverage: 8200, badge: getPercentileBadge(15) },
    ],
    'Support': [
      { id: 'vision_score_per_minute', name: 'Vision Score/Min', value: 2.15, percentile: 8, polishAverage: 1.75, euwAverage: 1.85, badge: getPercentileBadge(8) },
      { id: 'kill_participation', name: 'Kill Participation %', value: 72.3, percentile: 25, polishAverage: 65.5, euwAverage: 67.2, badge: getPercentileBadge(25) },
      { id: 'crowd_control_score', name: 'Crowd Control Score', value: 45.8, percentile: 18, polishAverage: 38.2, euwAverage: 40.5, badge: getPercentileBadge(18) },
      { id: 'roaming_impact', name: 'Roaming Impact', value: 3, percentile: 32, polishAverage: 2.1, euwAverage: 2.4, badge: getPercentileBadge(32) },
      { id: 'gold_efficiency', name: 'Gold Efficiency', value: 0.92, percentile: 45, polishAverage: 0.85, euwAverage: 0.88, badge: getPercentileBadge(45) },
      { id: 'death_efficiency', name: 'Death Efficiency', value: 5.2, percentile: 22, polishAverage: 4.1, euwAverage: 4.5, badge: getPercentileBadge(22) },
    ],
    'Jungle': [
      { id: 'cs_per_minute', name: 'CS/Min', value: 5.2, percentile: 38, polishAverage: 4.8, euwAverage: 5.0, badge: getPercentileBadge(38) },
      { id: 'kill_participation', name: 'Kill Participation %', value: 68.5, percentile: 28, polishAverage: 62.3, euwAverage: 64.8, badge: getPercentileBadge(28) },
      { id: 'objective_control', name: 'Objective Control', value: 3.2, percentile: 15, polishAverage: 2.5, euwAverage: 2.7, badge: getPercentileBadge(15) },
      { id: 'early_game_impact', name: 'Early Game Impact', value: 4, percentile: 25, polishAverage: 3.1, euwAverage: 3.3, badge: getPercentileBadge(25) },
      { id: 'vision_score', name: 'Vision Score', value: 42.5, percentile: 32, polishAverage: 36.8, euwAverage: 38.5, badge: getPercentileBadge(32) },
      { id: 'jungle_proximity', name: 'Jungle Proximity', value: 65, percentile: 42, polishAverage: 58, euwAverage: 60, badge: getPercentileBadge(42) },
    ],
    'Mid': [
      { id: 'damage_per_minute', name: 'Damage per Minute', value: 1125.3, percentile: 18, polishAverage: 985.2, euwAverage: 1020.5, badge: getPercentileBadge(18) },
      { id: 'cs_per_minute', name: 'CS/Min', value: 7.9, percentile: 28, polishAverage: 7.2, euwAverage: 7.4, badge: getPercentileBadge(28) },
      { id: 'roaming_impact', name: 'Roaming Impact', value: 2, percentile: 35, polishAverage: 1.6, euwAverage: 1.8, badge: getPercentileBadge(35) },
      { id: 'kill_participation', name: 'Kill Participation %', value: 64.2, percentile: 32, polishAverage: 58.5, euwAverage: 60.2, badge: getPercentileBadge(32) },
      { id: 'solo_kills', name: 'Solo Kills', value: 1.8, percentile: 22, polishAverage: 1.2, euwAverage: 1.4, badge: getPercentileBadge(22) },
      { id: 'vision_score', name: 'Vision Score', value: 28.5, percentile: 38, polishAverage: 23.8, euwAverage: 25.2, badge: getPercentileBadge(38) },
    ],
    'Top': [
      { id: 'cs_per_minute', name: 'CS/Min', value: 7.2, percentile: 35, polishAverage: 6.6, euwAverage: 6.8, badge: getPercentileBadge(35) },
      { id: 'damage_per_minute', name: 'Damage per Minute', value: 1050.5, percentile: 28, polishAverage: 920.3, euwAverage: 960.8, badge: getPercentileBadge(28) },
      { id: 'solo_kills', name: 'Solo Kills', value: 2.1, percentile: 18, polishAverage: 1.4, euwAverage: 1.6, badge: getPercentileBadge(18) },
      { id: 'early_game_dominance', name: 'Early Game Dominance', value: 2.45, percentile: 22, polishAverage: 1.85, euwAverage: 2.05, badge: getPercentileBadge(22) },
      { id: 'durability_score', name: 'Durability Score', value: 16200, percentile: 32, polishAverage: 13500, euwAverage: 14200, badge: getPercentileBadge(32) },
      { id: 'split_push_pressure', name: 'Split Push Pressure', value: 11.8, percentile: 25, polishAverage: 9.2, euwAverage: 9.8, badge: getPercentileBadge(25) },
    ],
    'All Roles': [
      { id: 'kda', name: 'KDA', value: 3.42, percentile: 28, polishAverage: 2.85, euwAverage: 3.05, badge: getPercentileBadge(28) },
      { id: 'cs_per_minute', name: 'CS/Min', value: 5.4, percentile: 72, polishAverage: 6.2, euwAverage: 6.4, badge: getPercentileBadge(72) },
      { id: 'kill_participation', name: 'Kill Participation %', value: 62.5, percentile: 32, polishAverage: 56.8, euwAverage: 58.5, badge: getPercentileBadge(32) },
      { id: 'vision_score', name: 'Vision Score', value: 23.8, percentile: 75, polishAverage: 28.2, euwAverage: 29.5, badge: getPercentileBadge(75) },
      { id: 'damage_share', name: 'Damage Share %', value: 24.8, percentile: 38, polishAverage: 21.5, euwAverage: 22.8, badge: getPercentileBadge(38) },
      { id: 'objective_control', name: 'Objective Participation', value: 2, percentile: 42, polishAverage: 1.6, euwAverage: 1.7, badge: getPercentileBadge(42) },
    ],
  }

  const metrics = mockData[role] || mockData['All Roles']
  return metrics.map(m => addTierInfo(m))
}

/**
 * Calculate blue vs red side statistics
 */
function calculateSideStats(matches: any[]) {
  const blueMatches = matches.filter((m) => m.team_id === 100)
  const redMatches = matches.filter((m) => m.team_id === 200)

  const calculateStats = (sideMatches: any[]) => {
    if (sideMatches.length === 0) {
      return { winrate: 0, kda: 0, games: 0 }
    }

    const wins = sideMatches.filter((m) => m.win).length
    const winrate = (wins / sideMatches.length) * 100

    const kdas = sideMatches
      .map((m) => m.kda)
      .filter((k) => k !== null && k !== undefined)
    const avgKDA = kdas.length > 0
      ? kdas.reduce((sum, k) => sum + parseFloat(k), 0) / kdas.length
      : 0

    return {
      winrate,
      kda: avgKDA,
      games: sideMatches.length,
    }
  }

  return {
    blue: calculateStats(blueMatches),
    red: calculateStats(redMatches),
  }
}

/**
 * Calculate game phase statistics (early, mid, late)
 * Note: This is based on game duration since we don't have phase-specific data yet
 */
function calculatePhaseStats(matches: any[]) {
  // For now, we'll use game duration as a proxy
  // Early game performance = games < 25 min
  // Mid game = 25-35 min
  // Late game = 35+ min

  const earlyGames = matches.filter((m) => m.game_duration && m.game_duration < 1500) // 25 min
  const midGames = matches.filter((m) => m.game_duration && m.game_duration >= 1500 && m.game_duration < 2100) // 25-35 min
  const lateGames = matches.filter((m) => m.game_duration && m.game_duration >= 2100) // 35+ min

  const calculatePhaseKDA = (phaseMatches: any[]) => {
    if (phaseMatches.length === 0) {
      return { kda: 0, winrate: 0, games: 0 }
    }

    const wins = phaseMatches.filter((m) => m.win).length
    const winrate = (wins / phaseMatches.length) * 100

    const kdas = phaseMatches
      .map((m) => m.kda)
      .filter((k) => k !== null && k !== undefined)
    const avgKDA = kdas.length > 0
      ? kdas.reduce((sum, k) => sum + parseFloat(k), 0) / kdas.length
      : 0

    return {
      kda: avgKDA,
      winrate,
      games: phaseMatches.length,
    }
  }

  // If we don't have enough data spread, use all games with mock distribution
  if (earlyGames.length === 0 && midGames.length === 0 && lateGames.length === 0) {
    const allKDA = matches.length > 0
      ? matches.reduce((sum, m) => sum + (parseFloat(m.kda) || 0), 0) / matches.length
      : 3.0

    return {
      early: { kda: allKDA * 1.1, winrate: 52, games: Math.floor(matches.length * 0.4) },
      mid: { kda: allKDA, winrate: 50, games: Math.floor(matches.length * 0.4) },
      late: { kda: allKDA * 0.9, winrate: 48, games: Math.floor(matches.length * 0.2) },
    }
  }

  return {
    early: calculatePhaseKDA(earlyGames),
    mid: calculatePhaseKDA(midGames),
    late: calculatePhaseKDA(lateGames),
  }
}
