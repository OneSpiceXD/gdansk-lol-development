'use client'

interface SideComparisonCardProps {
  blueSideWinrate: number
  redSideWinrate: number
  blueSideKDA: number
  redSideKDA: number
  blueSideGames: number
  redSideGames: number
}

export default function SideComparisonCard({
  blueSideWinrate,
  redSideWinrate,
  blueSideKDA,
  redSideKDA,
  blueSideGames,
  redSideGames
}: SideComparisonCardProps) {
  // Determine which side is better
  const blueIsBetter = blueSideWinrate > redSideWinrate
  const winrateDiff = Math.abs(blueSideWinrate - redSideWinrate)

  return (
    <div className="bg-[#0f1420] rounded-lg p-6 border border-[#1e2836]">
      <h3 className="text-lg font-bold text-white mb-4">
        Blue vs Red side performance
      </h3>

      {/* Side by side comparison */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Blue Side */}
        <div className={`bg-[#151b28] rounded-lg p-4 border-2 transition-all ${
          blueIsBetter ? 'border-blue-500' : 'border-[#1e2836]'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-300">Blue side</span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-white">
                {blueSideWinrate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Winrate</div>
            </div>

            <div className="pt-2 border-t border-[#1e2836]">
              <div className="text-lg font-semibold text-blue-300">
                {blueSideKDA.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">KDA</div>
            </div>

            <div className="text-xs text-gray-500">
              {blueSideGames} games
            </div>
          </div>
        </div>

        {/* Red Side */}
        <div className={`bg-[#151b28] rounded-lg p-4 border-2 transition-all ${
          !blueIsBetter ? 'border-red-500' : 'border-[#1e2836]'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-red-300">Red side</span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-white">
                {redSideWinrate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Winrate</div>
            </div>

            <div className="pt-2 border-t border-[#1e2836]">
              <div className="text-lg font-semibold text-red-300">
                {redSideKDA.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">KDA</div>
            </div>

            <div className="text-xs text-gray-500">
              {redSideGames} games
            </div>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="bg-[#151b28] rounded-lg p-3 border-l-4 border-cyan-500">
        <div className="text-xs text-gray-300">
          {winrateDiff < 5 ? (
            <>You perform equally well on both sides of the map</>
          ) : blueIsBetter ? (
            <>You're {winrateDiff.toFixed(1)}% stronger on blue side. Focus on red side macro play.</>
          ) : (
            <>You're {winrateDiff.toFixed(1)}% stronger on red side. Focus on blue side macro play.</>
          )}
        </div>
      </div>
    </div>
  )
}
