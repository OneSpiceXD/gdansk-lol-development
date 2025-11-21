'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Champion {
  id: number
  name: string
  image_url: string
}

interface Player {
  rank: number
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

type SortField = 'rank' | 'lp' | 'winrate' | 'trend' | 'activity'
type SortDirection = 'asc' | 'desc'

export default function LeaderboardPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [regionFilter, setRegionFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard')
        const data = await res.json()
        setPlayers(data)
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New field, default to descending
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Filter players based on search and filters
  let filteredPlayers = players.filter(player => {
    const matchesSearch = player.summoner_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRegion = regionFilter === 'all' || player.region === regionFilter
    const matchesTier = tierFilter === 'all' || player.tier === tierFilter
    const matchesRole = roleFilter === 'all' || player.main_role === roleFilter

    return matchesSearch && matchesRegion && matchesTier && matchesRole
  })

  // Apply sorting if a sort field is selected
  if (sortField) {
    filteredPlayers = [...filteredPlayers].sort((a, b) => {
      let compareA: number
      let compareB: number

      switch (sortField) {
        case 'rank':
          compareA = a.rank
          compareB = b.rank
          break
        case 'lp':
          compareA = a.lp
          compareB = b.lp
          break
        case 'winrate':
          compareA = a.winrate
          compareB = b.winrate
          break
        case 'trend':
          compareA = a.lp_change_7d ?? -Infinity
          compareB = b.lp_change_7d ?? -Infinity
          break
        case 'activity':
          compareA = new Date(a.created_at).getTime()
          compareB = new Date(b.created_at).getTime()
          break
        default:
          return 0
      }

      return sortDirection === 'desc' ? compareB - compareA : compareA - compareB
    })
  }

  // Get unique values for filters
  const regions = Array.from(new Set(players.map(p => p.region).filter((r): r is string => Boolean(r))))
  const tiers = Array.from(new Set(players.map(p => p.tier).filter((t): t is string => Boolean(t))))
  const roles = Array.from(new Set(players.map(p => p.main_role).filter((r): r is string => Boolean(r))))

  // Calculate stats
  const totalPlayers = players.length
  const activeToday = players.filter(player => {
    const hoursSince = (Date.now() - new Date(player.created_at).getTime()) / (1000 * 60 * 60)
    return hoursSince < 24
  }).length

  const getTrendDisplay = (lpChange: number | null) => {
    if (lpChange === null) return null

    const color = lpChange > 20 ? 'text-green-400' : lpChange > 0 ? 'text-yellow-400' : 'text-red-400'
    const arrow = lpChange > 20 ? '↗' : lpChange > 0 ? '→' : '↘'
    const sign = lpChange > 0 ? '+' : ''

    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <span>{arrow}</span>
        <span>{sign}{lpChange} LP</span>
      </div>
    )
  }

  const getActivityColor = (createdAt: string) => {
    const hoursSince = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
    if (hoursSince < 6) return 'bg-green-400'
    if (hoursSince < 24) return 'bg-yellow-400'
    return 'bg-gray-400'
  }

  const getActivityText = (createdAt: string) => {
    const hoursSince = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60))
    if (hoursSince < 1) return 'Just now'
    if (hoursSince < 24) return `${hoursSince}h ago`
    const daysSince = Math.floor(hoursSince / 24)
    return `${daysSince}d ago`
  }

  const getTierIcon = (tier: string) => {
    const tierLower = tier.toLowerCase()
    // Official Riot Games rank emblems (locally hosted)
    return `/ranks/${tierLower}.png`
  }

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'desc' ? ' ↓' : ' ↑'
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-6 py-4 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-gray-200 transition-colors select-none"
      onClick={() => handleSort(field)}
    >
      {children}{getSortIndicator(field)}
    </th>
  )

  const handlePlayerClick = (summonerName: string) => {
    router.push(`/player/${encodeURIComponent(summonerName)}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-blue-400 text-xl">Loading leaderboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold mb-1 flex items-center gap-3">
              <Image
                src="https://flagcdn.com/w40/pl.png"
                alt="Poland"
                width={40}
                height={30}
                className="inline-block"
              />
              Leaderboards
            </h1>
            <p className="text-gray-400">Detailed regional rankings with performance metrics and activity tracking</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Last updated: 2 hours ago</div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-400">Total Players:</span>
              <span className="text-2xl font-bold text-white">{totalPlayers.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="w-full bg-[#0f1420] border border-[#1e2836] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Poland</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="w-full bg-[#0f1420] border border-[#1e2836] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Ranks</option>
            {tiers.map(tier => (
              <option key={tier} value={tier}>{tier}</option>
            ))}
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-[#0f1420] border border-[#1e2836] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by player name..."
            className="w-full bg-[#0f1420] border border-[#1e2836] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        </div>

        <div className="bg-[#0f1420] rounded-lg overflow-hidden border border-[#1e2836]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#151b28] border-b border-[#1e2836]">
                <tr>
                  <SortableHeader field="rank">RANK</SortableHeader>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">PLAYER</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">TIER</th>
                  <SortableHeader field="lp">LP</SortableHeader>
                  <SortableHeader field="winrate">WIN RATE</SortableHeader>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">TOP CHAMPIONS</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">ROLE</th>
                  <SortableHeader field="trend">TREND (7D)</SortableHeader>
                  <SortableHeader field="activity">ACTIVITY</SortableHeader>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">REGION</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player, index) => (
                  <tr
                    key={player.rank}
                    onClick={() => handlePlayerClick(player.summoner_name)}
                    className={`border-b border-[#1e2836] hover:bg-[#151b28] hover:shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:border-l-4 hover:border-l-[#00d9ff] transition-all duration-300 ease-out cursor-pointer ${
                      index < 3 ? 'bg-[#151b28]/50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold">{player.rank}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#1e2836]">
                          <Image
                            src={`https://ddragon.leagueoflegends.com/cdn/15.22.1/img/profileicon/${player.profile_icon_id || 29}.png`}
                            alt={player.summoner_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">
                            {player.summoner_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="relative w-12 h-12">
                          <Image
                            src={getTierIcon(player.tier)}
                            alt={player.tier}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{player.tier}</div>
                          {player.rank_division && <div className="text-xs text-gray-400">Division {player.rank_division}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold">{player.lp}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span>{player.winrate.toFixed(1)}%</span>
                      <div className="text-xs text-gray-400">{player.wins}W {player.losses}L</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {player.top_champion_1 && (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#1e2836]" title={player.top_champion_1.name}>
                            <Image
                              src={player.top_champion_1.image_url}
                              alt={player.top_champion_1.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        {player.top_champion_2 && (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#1e2836]" title={player.top_champion_2.name}>
                            <Image
                              src={player.top_champion_2.image_url}
                              alt={player.top_champion_2.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        {player.top_champion_3 && (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#1e2836]" title={player.top_champion_3.name}>
                            <Image
                              src={player.top_champion_3.image_url}
                              alt={player.top_champion_3.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm px-2 py-1 rounded bg-[#1e2836] text-gray-300">
                        {player.main_role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getTrendDisplay(player.lp_change_7d)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getActivityColor(player.created_at)}`} />
                        <span className="text-sm text-gray-400">{getActivityText(player.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {player.city && player.region ? (
                        <div className="text-sm">
                          <div>{player.city}</div>
                          <div className="text-gray-400 text-xs">{player.region}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
