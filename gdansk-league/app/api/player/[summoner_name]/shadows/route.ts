import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ summoner_name: string }> }
) {
  try {
    const { summoner_name } = await params

    // Get player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('puuid, tier, rank, summoner_name')
      .eq('summoner_name', summoner_name)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Get shadow recommendations for this player
    const { data: shadows, error: shadowsError } = await supabase
      .from('shadow_recommendations')
      .select('*')
      .eq('user_puuid', player.puuid)
      .order('similarity_score', { ascending: false })
      .limit(3)

    if (shadowsError) {
      console.error('Error fetching shadows:', shadowsError)
      return NextResponse.json({ error: 'Failed to fetch shadows' }, { status: 500 })
    }

    // If no shadows found, return empty array with calculating flag
    if (!shadows || shadows.length === 0) {
      return NextResponse.json({
        shadows: [],
        calculating: true,
        message: 'Shadow recommendations not yet calculated'
      })
    }

    // Enrich shadow data with player information
    const enrichedShadows = await Promise.all(
      shadows.map(async (shadow) => {
        const { data: shadowPlayer } = await supabase
          .from('players')
          .select('summoner_name, tier, rank, profile_icon_id')
          .eq('puuid', shadow.shadow_puuid)
          .single()

        return {
          ...shadow,
          shadowPlayer: shadowPlayer || {
            summoner_name: 'Unknown Player',
            tier: 'EMERALD',
            rank: 'I',
            profile_icon_id: 29
          }
        }
      })
    )

    return NextResponse.json({
      shadows: enrichedShadows,
      calculating: false,
      userInfo: {
        summoner_name: player.summoner_name,
        tier: player.tier,
        rank: player.rank
      }
    })
  } catch (error) {
    console.error('Shadow API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
