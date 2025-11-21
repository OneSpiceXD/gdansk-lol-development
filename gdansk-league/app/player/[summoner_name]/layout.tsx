'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Champion {
  id: number
  name: string
  image_url: string
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
}

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

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
      } catch (err) {
        console.error('Error fetching player:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayer()
  }, [summonerName])

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

  // Determine active tab based on pathname
  const isXRayPage = pathname?.includes('/x-ray')
  const isOverviewPage = pathname === `/player/${summonerName}`

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.push('/leaderboard')}
          className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          ← Back to Leaderboard
        </button>

        {/* Player Header with Champion Splash */}
        <div className="relative rounded-lg overflow-hidden mb-6 border border-[#1e2836]">
          {/* Background Champion Splash */}
          {player.top_champion_1 && (
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${player.top_champion_1.name}_0.jpg`}
                alt={player.top_champion_1.name}
                fill
                className="object-cover"
                style={{ objectPosition: '35% 20%' }}
                priority
              />
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e1a] via-[#0a0e1a]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent" />
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 flex items-center gap-4 px-6 py-4">
            {/* Profile Icon */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-cyan-500/50 shadow-2xl flex-shrink-0">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/15.22.1/img/profileicon/${player.profile_icon_id || 29}.png`}
                alt={player.summoner_name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1">
              {/* Summoner Name */}
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">{player.summoner_name}</h1>
                <span className="px-2.5 py-0.5 bg-[#0a0e1a]/80 backdrop-blur-sm text-gray-300 text-xs rounded-full border border-gray-700">
                  #{player.region || 'EUW'}
                </span>
                <div className="flex items-center gap-1 px-2.5 py-0.5 bg-[#0a0e1a]/80 backdrop-blur-sm rounded-full border border-gray-700">
                  <span className="text-xs text-gray-400">👁</span>
                  <span className="text-xs text-gray-300">5 Views</span>
                </div>
              </div>

              {/* Player Tags */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-500/30 backdrop-blur-sm text-emerald-300 text-xs rounded-full border border-emerald-500/50">
                  Team Player
                </span>
                <span className="px-2.5 py-0.5 bg-cyan-500/30 backdrop-blur-sm text-cyan-300 text-xs rounded-full border border-cyan-500/50">
                  Vision Focused
                </span>
                <span className="px-2.5 py-0.5 bg-purple-500/30 backdrop-blur-sm text-purple-300 text-xs rounded-full border border-purple-500/50">
                  Closer
                </span>
              </div>
            </div>

            {/* Share Button */}
            <button className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-[#0a0e1a]/80 backdrop-blur-sm hover:bg-[#151b28] rounded-lg border border-gray-700 transition-colors">
              <span className="text-gray-300 text-sm">⚙️</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="relative z-10 flex items-center gap-8 px-6 pb-3 border-b border-gray-700/50">
            <Link
              href={`/player/${summonerName}`}
              className={`font-medium pb-2 border-b-2 transition-colors ${
                isOverviewPage
                  ? 'text-white border-cyan-400'
                  : 'text-gray-400 hover:text-white border-transparent'
              }`}
            >
              Overview
            </Link>
            <button
              className={`font-medium pb-2 border-b-2 transition-colors text-gray-400 hover:text-white border-transparent`}
            >
              Matches
            </button>
            <button
              className={`font-medium pb-2 border-b-2 transition-colors text-gray-400 hover:text-white border-transparent`}
            >
              Champions
            </button>
            <Link
              href={`/player/${summonerName}/x-ray`}
              className={`font-bold pb-2 border-b-2 transition-all group ${
                isXRayPage
                  ? 'border-purple-500'
                  : 'border-transparent hover:border-purple-500/50'
              }`}
            >
              <span className="relative inline-block px-3 py-1">
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded blur-sm group-hover:blur-md transition-all"></span>
                <span className="relative bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent bg-[length:200%_100%] animate-shimmer font-bold text-lg tracking-wide drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                  X-Ray
                </span>
              </span>
            </Link>
          </div>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}
