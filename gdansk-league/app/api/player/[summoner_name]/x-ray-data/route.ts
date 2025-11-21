import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ summoner_name: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }
    const db = supabase

    const { summoner_name } = await params
    const { searchParams } = new URL(request.url)
    const games = parseInt(searchParams.get('games') || '20')
    const roleFilter = searchParams.get('role') || null // Optional role filter
    const sideFilter = searchParams.get('side') || null // Optional side filter (blue/red)

    // Get player by summoner name
    const { data: player, error: playerError } = await db
      .from('players')
      .select('puuid, id')
      .eq('summoner_name', summoner_name)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Get match analytics summary for the player (Ranked Solo/Duo only)
    const { data: analytics, error: analyticsError } = await db
      .from('match_analytics_summary')
      .select('*')
      .eq('player_puuid', player.puuid)
      .eq('queue_id', 420)
      .order('created_at', { ascending: false })
      .limit(games)

    if (analyticsError) {
      console.error('Analytics error:', analyticsError)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    if (!analytics || analytics.length === 0) {
      return NextResponse.json({
        deaths: [],
        kills: [],
        assists: [],
        objectives: [],
        buildings: [],
        timeline: [],
        totalGames: 0
      })
    }

    // If role or side filter is specified, get match_stats to filter
    let filteredMatchIds = analytics.map(a => a.match_id)

    if (roleFilter || sideFilter) {
      let query = db
        .from('match_stats')
        .select('match_id')
        .eq('player_id', player.id)
        .in('match_id', filteredMatchIds)

      if (roleFilter) {
        query = query.eq('role', roleFilter)
      }

      if (sideFilter) {
        const teamId = sideFilter === 'blue' ? 100 : 200
        query = query.eq('team_id', teamId)
      }

      const { data: matchStats, error: statsError } = await query

      if (!statsError && matchStats) {
        filteredMatchIds = matchStats.map(s => s.match_id)
      }
    }

    // Filter analytics to only include matches matching the filters
    const filteredAnalytics = (roleFilter || sideFilter)
      ? analytics.filter(a => filteredMatchIds.includes(a.match_id))
      : analytics

    // Aggregate all data from JSONB fields, including team_id for side differentiation
    const allDeaths: any[] = []
    const allKills: any[] = []
    const allAssists: any[] = []
    const allObjectives: any[] = []
    const allBuildings: any[] = []
    const allTimeline: any[] = []

    // Get match_stats to include role information
    const matchStatsMap: Record<string, any> = {}
    if (filteredAnalytics.length > 0) {
      const { data: matchStats } = await db
        .from('match_stats')
        .select('match_id, role')
        .eq('player_id', player.id)
        .in('match_id', filteredAnalytics.map(a => a.match_id))

      if (matchStats) {
        matchStats.forEach(stat => {
          matchStatsMap[stat.match_id] = stat.role
        })
      }
    }

    filteredAnalytics.forEach((match, index) => {
      const role = matchStatsMap[match.match_id]

      // Add team_id, role, and match_index to each death for proper filtering
      // match_index helps us track which game each death belongs to (0 = most recent)
      if (match.deaths) {
        const deathsWithMetadata = match.deaths.map((death: any) => ({
          ...death,
          team_id: match.team_id,
          role: role,
          match_index: index // 0-based index, 0 = most recent game
        }))
        allDeaths.push(...deathsWithMetadata)
      }
      if (match.kills) allKills.push(...match.kills)
      if (match.assists) allAssists.push(...match.assists)
      if (match.elite_monster_kills) allObjectives.push(...match.elite_monster_kills)
      if (match.building_kills) allBuildings.push(...match.building_kills)
      if (match.position_timeline) allTimeline.push(...match.position_timeline)
    })

    return NextResponse.json({
      deaths: allDeaths,
      kills: allKills,
      assists: allAssists,
      objectives: allObjectives,
      buildings: allBuildings,
      timeline: allTimeline,
      totalGames: filteredAnalytics.length
    })
  } catch (error) {
    console.error('X-Ray data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
