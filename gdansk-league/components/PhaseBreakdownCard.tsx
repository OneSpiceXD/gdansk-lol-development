'use client'

interface PhaseStats {
  kda: number
  winrate: number
  games: number
}

interface PhaseBreakdownCardProps {
  earlyGame: PhaseStats
  midGame: PhaseStats
  lateGame: PhaseStats
}

export default function PhaseBreakdownCard({
  earlyGame,
  midGame,
  lateGame
}: PhaseBreakdownCardProps) {
  // Find best phase
  const phases = [
    { name: 'Early', stats: earlyGame, icon: '🌅' },
    { name: 'Mid', stats: midGame, icon: '☀️' },
    { name: 'Late', stats: lateGame, icon: '🌙' }
  ]

  const bestPhase = phases.reduce((best, current) =>
    current.stats.kda > best.stats.kda ? current : best
  )

  const worstPhase = phases.reduce((worst, current) =>
    current.stats.kda < worst.stats.kda ? current : worst
  )

  return (
    <div className="bg-[#0f1420] rounded-lg p-6 border border-[#1e2836]">
      <h3 className="text-lg font-bold text-white mb-4">
        Game phase breakdown
      </h3>

      {/* Phase timeline */}
      <div className="space-y-3 mb-4">
        {phases.map((phase, idx) => {
          const isBest = phase.name === bestPhase.name
          const isWorst = phase.name === worstPhase.name
          const maxKDA = Math.max(earlyGame.kda, midGame.kda, lateGame.kda)
          const barWidth = (phase.stats.kda / maxKDA) * 100

          return (
            <div key={idx} className="bg-[#151b28] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{phase.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {phase.name} game
                      {isBest && <span className="ml-2 text-xs text-green-400">✓ Strongest</span>}
                      {isWorst && <span className="ml-2 text-xs text-red-400">⚠ Weakest</span>}
                    </div>
                    <div className="text-xs text-gray-500">
                      {phase.name === 'Early' ? '0-15 min' :
                       phase.name === 'Mid' ? '15-25 min' :
                       '25+ min'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {phase.stats.kda.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">KDA</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-[#0A0E27] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isBest ? 'bg-green-500' :
                    isWorst ? 'bg-red-500' :
                    'bg-cyan-500'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {/* Winrate */}
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  {phase.stats.winrate.toFixed(1)}% winrate
                </span>
                <span className="text-gray-500">
                  {phase.stats.games} games
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Insight */}
      <div className="bg-[#151b28] rounded-lg p-3 border-l-4 border-cyan-500">
        <div className="text-xs text-gray-300">
          {bestPhase.name === worstPhase.name ? (
            <>Consistent performance across all game phases</>
          ) : (
            <>
              Focus on improving your {worstPhase.name.toLowerCase()} game to match your {bestPhase.name.toLowerCase()} game performance
            </>
          )}
        </div>
      </div>
    </div>
  )
}
