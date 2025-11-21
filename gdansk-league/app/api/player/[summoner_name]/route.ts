import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const CURRENT_SEASON = 'S3_2025'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ summoner_name: string }> }
) {
  try {
    const { summoner_name } = await params
    const summonerName = decodeURIComponent(summoner_name)

    // Fetch player
    const { data: player, error } = await supabase
      .from('players')
      .select('*')
      .eq('summoner_name', summonerName)
      .single()

    if (error || !player) {
      console.error('Player not found:', error)
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // Get top 3 champions for current season
    const { data: seasonalChampions } = await supabase
      .from('player_champion_stats')
      .select(`
        champion_id,
        games_played,
        wins,
        losses,
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

    // Get LP history from 7 days ago
    const { data: historyData } = await supabase
      .from('player_history')
      .select('lp, recorded_at')
      .eq('player_id', player.id)
      .lte('recorded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single()

    const lpChange7d = historyData ? player.lp - historyData.lp : null

    // Get recent LP history for chart (last 21 games worth of data)
    const { data: lpHistory } = await supabase
      .from('player_history')
      .select('lp, recorded_at')
      .eq('player_id', player.id)
      .order('recorded_at', { ascending: false })
      .limit(21)

    return NextResponse.json({
      ...player,
      lp_change_7d: lpChange7d,
      lp_history: lpHistory || [],
      top_champion_1: seasonalChampions?.[0]?.champions || null,
      top_champion_2: seasonalChampions?.[1]?.champions || null,
      top_champion_3: seasonalChampions?.[2]?.champions || null,
      top_champion_1_points: seasonalChampions?.[0]?.games_played || 0,
      top_champion_2_points: seasonalChampions?.[1]?.games_played || 0,
      top_champion_3_points: seasonalChampions?.[2]?.games_played || 0,
    })
  } catch (error: any) {
    console.error('Error in player API:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
