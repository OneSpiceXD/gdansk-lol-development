import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const RIOT_API_KEY = process.env.RIOT_API_KEY

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

    // First get the player's PUUID from database
    const { data: player, error: playerError } = await db
      .from('players')
      .select('puuid')
      .eq('summoner_name', summoner_name)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    if (!RIOT_API_KEY) {
      return NextResponse.json({ error: 'Riot API key not configured' }, { status: 500 })
    }

    // Check if player is in an active game
    const spectatorUrl = `https://euw1.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${player.puuid}`

    const response = await fetch(spectatorUrl, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    })

    // 404 means not in game
    if (response.status === 404) {
      return NextResponse.json({
        isLive: false,
        message: 'Player is not currently in a game'
      })
    }

    if (!response.ok) {
      console.error('Riot API error:', response.status, await response.text())
      return NextResponse.json({
        isLive: false,
        error: 'Failed to fetch live game data'
      }, { status: response.status })
    }

    const gameData = await response.json()

    // Return live game data
    return NextResponse.json({
      isLive: true,
      gameData: {
        gameId: gameData.gameId,
        platformId: gameData.platformId,
        encryptionKey: gameData.observers?.encryptionKey,
        gameMode: gameData.gameMode,
        gameType: gameData.gameType,
        gameStartTime: gameData.gameStartTime,
        participants: gameData.participants
      }
    })
  } catch (error) {
    console.error('Live game check error:', error)
    return NextResponse.json({
      isLive: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
