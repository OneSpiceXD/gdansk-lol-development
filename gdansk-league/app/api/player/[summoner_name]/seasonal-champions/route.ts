import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const CURRENT_SEASON = 'S3_2025'

interface RouteParams {
  params: Promise<{
    summoner_name: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { summoner_name } = await params
    const decodedName = decodeURIComponent(summoner_name)

    // Get season from query params (default to current season)
    const { searchParams } = new URL(request.url)
    const season = searchParams.get('season') || CURRENT_SEASON
    const limit = parseInt(searchParams.get('limit') || '3')

    // Fetch player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id')
      .eq('summoner_name', decodedName)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Fetch top champions for this season
    const { data: championStats, error: statsError } = await supabase
      .from('player_champion_stats')
      .select(`
        champion_id,
        games_played,
        wins,
        losses,
        last_played_at,
        champions (
          id,
          name,
          image_url
        )
      `)
      .eq('player_id', player.id)
      .eq('season', season)
      .order('games_played', { ascending: false })
      .limit(limit)

    if (statsError) {
      console.error('Error fetching seasonal champion stats:', statsError)
      return NextResponse.json({ error: 'Failed to fetch champion stats' }, { status: 500 })
    }

    // Format response
    const formattedStats = championStats.map(stat => ({
      champion: stat.champions,
      games: stat.games_played,
      wins: stat.wins,
      losses: stat.losses,
      winrate: stat.games_played > 0 ? ((stat.wins / stat.games_played) * 100).toFixed(1) : '0.0',
      lastPlayed: stat.last_played_at
    }))

    return NextResponse.json({
      season,
      champions: formattedStats
    })

  } catch (error) {
    console.error('Error in seasonal-champions route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
