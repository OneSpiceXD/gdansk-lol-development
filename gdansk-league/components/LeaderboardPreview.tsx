import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, Star, Brain } from 'lucide-react';
import playersData from '@/data/players.json';

function getRankColor(tier: string) {
  const colors: Record<string, string> = {
    MASTER: '#9e4cff',
    DIAMOND: '#4169e1',
    EMERALD: '#00c853',
    PLATINUM: '#00bcd4',
    GOLD: '#ffd700',
    SILVER: '#c0c0c0',
    BRONZE: '#cd7f32',
  };
  return colors[tier] || '#6B7280';
}

function getMentalResilienceColor(score: number) {
  if (score >= 85) return 'text-[var(--color-success)]';
  if (score >= 70) return 'text-cyan-accent';
  return 'text-[var(--accent-orange)]';
}

type Player = typeof playersData.players[0] & {
  lpChange?: number;
  trend?: 'up' | 'down' | 'stable' | 'new';
  mentalResilience?: number;
};

export default function LeaderboardPreview() {
  const topPlayers = playersData.players.slice(0, 10) as Player[];

  return (
    <div className="bg-[rgba(255,255,255,0.05)] border border-[var(--border-color)] rounded-xl shadow-[var(--shadow)] overflow-hidden backdrop-blur-[10px]">
      <div className="p-8 border-b border-[var(--border-color)]">
        <h2 className="text-[32px] font-semibold text-[var(--text-primary)]">
          Top 10 Poland Leaderboard
        </h2>
        <p className="text-[var(--text-secondary)] mt-2">
          See where you rank among Polish players
        </p>
      </div>

      <div className="overflow-x-auto backdrop-blur-sm relative">
        <table className="w-full relative">
          <thead className="bg-gradient-to-b from-cyan-500/10 via-[var(--bg-secondary)] to-[var(--bg-secondary)] backdrop-blur-md bg-opacity-80 relative">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Rank
              </th>
              <th className="px-5 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Player
              </th>
              <th className="px-5 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Tier
              </th>
              <th className="px-5 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                LP
              </th>
              <th className="px-5 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                WR%
              </th>
              <th className="px-5 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Role
              </th>
              <th className="px-5 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Mental
              </th>
              <th className="px-5 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Trend
              </th>
              <th className="px-5 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Last Game
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {topPlayers.map((player, index) => (
              <tr
                key={player.id}
                className={`hover:bg-[rgba(255,255,255,0.05)] backdrop-blur-sm transition-all duration-200 ease-in-out hover:shadow-lg hover:shadow-cyan-500/10 relative hover:translate-x-1 ${
                  index % 2 === 1 ? 'bg-[rgba(255,255,255,0.02)]' : ''
                }`}
              >
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    #{index + 1}
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <Link
                    href={`/player/${player.summonerName}`}
                    className="hover:text-[var(--accent-cyan)] transition-colors"
                  >
                    <div className="text-sm font-medium text-[var(--text-primary)]">
                      {player.name}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {player.summonerName}
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span
                    className="px-2 py-1 text-xs font-semibold rounded-md shadow-sm"
                    style={{
                      backgroundColor: `${getRankColor(player.tier)}20`,
                      color: getRankColor(player.tier),
                      boxShadow: `0 0 10px ${getRankColor(player.tier)}20`,
                    }}
                  >
                    {player.rank}
                  </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                  {player.lp} LP
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span
                    className={`text-sm font-medium ${
                      player.winRate >= 55
                        ? 'text-[var(--color-success)]'
                        : player.winRate >= 50
                        ? 'text-[var(--text-secondary)]'
                        : 'text-[var(--color-error)]'
                    }`}
                  >
                    {player.winRate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                  {player.role}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  {player.mentalResilience && (
                    <div className="flex items-center gap-1.5">
                      <Brain className={`w-3.5 h-3.5 ${getMentalResilienceColor(player.mentalResilience)}`} />
                      <span className={`text-sm font-medium ${getMentalResilienceColor(player.mentalResilience)}`}>
                        {player.mentalResilience}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  {player.trend === 'new' ? (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-cyan-accent" />
                      <span className="text-xs font-semibold text-cyan-accent">NEW</span>
                    </div>
                  ) : player.trend === 'up' ? (
                    <div className="flex items-center gap-1 text-[var(--color-success)]">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-semibold">+{player.lpChange} LP</span>
                    </div>
                  ) : player.trend === 'down' ? (
                    <div className="flex items-center gap-1 text-[var(--color-error)]">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-xs font-semibold">{player.lpChange} LP</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[var(--text-muted)]">
                      <Minus className="w-4 h-4" />
                      <span className="text-xs">±0 LP</span>
                    </div>
                  )}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                  {player.lastUpdated}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-[rgba(255,255,255,0.02)] backdrop-blur-md border-t border-[var(--border-color)] text-center">
        <Link
          href="/leaderboard"
          className="text-cyan-accent hover:text-[var(--accent-cyan-hover)] font-medium transition-colors inline-flex items-center gap-2 hover:gap-3 transition-all"
        >
          View full leaderboard →
        </Link>
      </div>
    </div>
  );
}
