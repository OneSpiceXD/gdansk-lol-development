import { NextResponse } from 'next/server'

const RIOT_API_KEY = process.env.RIOT_API_KEY

export async function POST(request: Request) {
  try {
    const { puuid, summonerName } = await request.json()

    if (!puuid) {
      return NextResponse.json({ error: 'PUUID is required' }, { status: 400 })
    }

    if (!RIOT_API_KEY) {
      return NextResponse.json({ error: 'Riot API key not configured' }, { status: 500 })
    }

    // Fetch live game data
    const spectatorUrl = `https://euw1.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`

    const response = await fetch(spectatorUrl, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY
      }
    })

    if (response.status === 404) {
      return NextResponse.json({ error: 'Player is not in a live game' }, { status: 404 })
    }

    if (!response.ok) {
      console.error('Riot API error:', response.status, await response.text())
      return NextResponse.json({ error: 'Failed to fetch live game data' }, { status: response.status })
    }

    const gameData = await response.json()

    // Generate spectator command for Windows
    const platformId = gameData.platformId || 'EUW1'
    const gameId = gameData.gameId
    const encryptionKey = gameData.observers?.encryptionKey

    // Spectator command format
    const spectatorCommand = `"C:\\Riot Games\\League of Legends\\LeagueClient.exe" "spectator spectator.euw1.lol.pvp.net:80 ${encryptionKey} ${gameId} ${platformId}"`

    // BAT file content
    const batFileContent = `@echo off
echo Starting spectator mode for ${summonerName || 'player'}...
echo.
start "" "C:\\Riot Games\\League of Legends\\LeagueClient.exe" "spectator spectator.euw1.lol.pvp.net:80 ${encryptionKey} ${gameId} ${platformId}"
echo.
echo If League doesn't open, make sure it's installed at the default location.
pause
`

    return NextResponse.json({
      success: true,
      spectatorCommand,
      batFileContent,
      gameData: {
        gameId,
        platformId,
        encryptionKey,
        gameMode: gameData.gameMode,
        gameStartTime: gameData.gameStartTime
      }
    })
  } catch (error) {
    console.error('Spectator command generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
