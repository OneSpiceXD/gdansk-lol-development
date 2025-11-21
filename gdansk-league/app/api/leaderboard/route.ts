import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const CURRENT_SEASON = 'S3_2025'

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Use local reference after null check
    const db = supabase

    // Fetch players
    const { data: players, error } = await db
      .from('players')
      .select('*')

    if (error) {
      console.error('Error fetching players:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Define tier hierarchy (higher number = higher rank)
    const tierOrder: { [key: string]: number } = {
      'CHALLENGER': 10,
      'GRANDMASTER': 9,
      'MASTER': 8,
      'DIAMOND': 7,
      'EMERALD': 6,
      'PLATINUM': 5,
      'GOLD': 4,
      'SILVER': 3,
      'BRONZE': 2,
      'IRON': 1
    }

    // For each player, get LP from 7 days ago and seasonal top champions
    const playersWithTrend = await Promise.all(
      (players || []).map(async (player) => {
        // Get LP history
        const { data: historyData } = await db
          .from('player_history')
          .select('lp, recorded_at')
          .eq('player_id', player.id)
          .lte('recorded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('recorded_at', { ascending: false })
          .limit(1)
          .single()

        const lpChange7d = historyData ? player.lp - historyData.lp : null

        // Get top 3 champions for current season
        const { data: seasonalChampions } = await db
          .from('player_champion_stats')
          .select(`
            champion_id,
            games_played,
            champions (
              id,
              name,
              image_url
            )
          `)
          .eq('player_id', player.id)
          .eq('season', CURRENT_SEASON)
          .order('games_played', { ascending: false })
          .limit(3)

        return {
          ...player,
          lp_change_7d: lpChange7d,
          top_champion_1: seasonalChampions?.[0]?.champions || null,
          top_champion_2: seasonalChampions?.[1]?.champions || null,
          top_champion_3: seasonalChampions?.[2]?.champions || null,
          top_champion_1_points: seasonalChampions?.[0]?.games_played || 0,
          top_champion_2_points: seasonalChampions?.[1]?.games_played || 0,
          top_champion_3_points: seasonalChampions?.[2]?.games_played || 0,
        }
      })
    )

    // Sort by tier (using hierarchy) and then by LP
    const sortedPlayers = playersWithTrend.sort((a, b) => {
      const tierA = tierOrder[a.tier.toUpperCase()] || 0
      const tierB = tierOrder[b.tier.toUpperCase()] || 0

      if (tierA !== tierB) {
        return tierB - tierA // Higher tier first
      }

      return b.lp - a.lp // Higher LP first within same tier
    })

    // Add rank numbers based on tier/LP
    const rankedPlayers = sortedPlayers.map((player, index) => ({
      ...player,
      rank: index + 1
    }))

    return NextResponse.json(rankedPlayers)
  } catch (error: any) {
    console.error('Error in leaderboard API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
