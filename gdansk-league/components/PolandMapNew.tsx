'use client';

import { useState } from 'react';
import { Users, TrendingUp } from 'lucide-react';
import voivodeshipsData from '@/data/poland-voivodeships-svg.json';

// Voivodeship data with player counts - mapping Polish names to English keys
const voivodeshipMapping: Record<string, string> = {
  'pomorskie': 'pomorskie',
  'mazowieckie': 'mazowieckie',
  'wielkopolskie': 'wielkopolskie',
  'małopolskie': 'malopolskie',
  'dolnośląskie': 'dolnoslaskie',
  'łódzkie': 'lodzkie',
  'zachodniopomorskie': 'zachodniopomorskie',
  'lubelskie': 'lubelskie',
  'śląskie': 'slaskie',
  'kujawsko-pomorskie': 'kujawsko-pomorskie',
  'podkarpackie': 'podkarpackie',
  'warmińsko-mazurskie': 'warminsko-mazurskie',
  'świętokrzyskie': 'swietokrzyskie',
  'podlaskie': 'podlaskie',
  'opolskie': 'opolskie',
  'lubuskie': 'lubuskie',
};

const voivodeships = {
  'pomorskie': {
    name: 'Pomorskie (Gdańsk)',
    players: 2847,
    growth: '+12%',
    avgRank: 'Emerald II',
    topPlayers: [
      { name: 'xKomandor', rank: 'Master', tier: 'I', lp: 234 },
      { name: 'GdańskPro', rank: 'Diamond', tier: 'I', lp: 89 },
      { name: 'BalticAce', rank: 'Diamond', tier: 'II', lp: 67 },
      { name: 'TriCityGG', rank: 'Diamond', tier: 'III', lp: 45 },
      { name: 'SopotMain', rank: 'Diamond', tier: 'IV', lp: 12 }
    ]
  },
  'mazowieckie': {
    name: 'Mazowieckie (Warsaw)',
    players: 4521,
    growth: '+8%',
    avgRank: 'Platinum I',
    topPlayers: [
      { name: 'WarsawLegend', rank: 'Grandmaster', tier: 'I', lp: 456 },
      { name: 'PolskaPower', rank: 'Master', tier: 'I', lp: 312 },
      { name: 'CapitalMain', rank: 'Master', tier: 'I', lp: 178 },
      { name: 'PragaKing', rank: 'Diamond', tier: 'I', lp: 94 },
      { name: 'WislaCarry', rank: 'Diamond', tier: 'I', lp: 76 }
    ]
  },
  'wielkopolskie': {
    name: 'Wielkopolskie (Poznań)',
    players: 1923,
    growth: '+15%',
    avgRank: 'Platinum II',
    topPlayers: [
      { name: 'PoznanBeast', rank: 'Master', tier: 'I', lp: 201 },
      { name: 'WartaMain', rank: 'Diamond', tier: 'I', lp: 88 },
      { name: 'GreatPoland', rank: 'Diamond', tier: 'II', lp: 54 },
      { name: 'LechSupport', rank: 'Diamond', tier: 'III', lp: 32 },
      { name: 'MaltaADC', rank: 'Diamond', tier: 'III', lp: 19 }
    ]
  },
  'malopolskie': {
    name: 'Małopolskie (Kraków)',
    players: 2156,
    growth: '+10%',
    avgRank: 'Platinum III',
    topPlayers: [
      { name: 'KrakowChamp', rank: 'Master', tier: 'I', lp: 267 },
      { name: 'WawelKing', rank: 'Diamond', tier: 'I', lp: 91 },
      { name: 'TatraMain', rank: 'Diamond', tier: 'II', lp: 63 },
      { name: 'RynekGG', rank: 'Diamond', tier: 'II', lp: 41 },
      { name: 'WislaTop', rank: 'Diamond', tier: 'III', lp: 28 }
    ]
  },
  'dolnoslaskie': {
    name: 'Dolnośląskie (Wrocław)',
    players: 1834,
    growth: '+7%',
    avgRank: 'Platinum II',
    topPlayers: [
      { name: 'WroclawPro', rank: 'Master', tier: 'I', lp: 189 },
      { name: 'OdraCarry', rank: 'Diamond', tier: 'I', lp: 72 },
      { name: 'DwarfMain', rank: 'Diamond', tier: 'II', lp: 59 },
      { name: 'SilesiaTop', rank: 'Diamond', tier: 'III', lp: 35 },
      { name: 'RynekJG', rank: 'Diamond', tier: 'III', lp: 21 }
    ]
  },
  'lodzkie': {
    name: 'Łódzkie (Łódź)',
    players: 1245,
    growth: '+5%',
    avgRank: 'Gold I',
    topPlayers: [
      { name: 'LodzMain', rank: 'Diamond', tier: 'I', lp: 78 },
      { name: 'PiotrkowGG', rank: 'Diamond', tier: 'II', lp: 56 },
      { name: 'ManufakturaCarry', rank: 'Diamond', tier: 'III', lp: 43 },
      { name: 'TextileADC', rank: 'Diamond', tier: 'IV', lp: 29 },
      { name: 'CentralMain', rank: 'Platinum', tier: 'I', lp: 87 }
    ]
  },
  'zachodniopomorskie': {
    name: 'Zachodniopomorskie',
    players: 892,
    growth: '+9%',
    avgRank: 'Gold II',
    topPlayers: [
      { name: 'SzczecinTop', rank: 'Diamond', tier: 'I', lp: 64 },
      { name: 'BalticMain', rank: 'Diamond', tier: 'II', lp: 51 },
      { name: 'OderCarry', rank: 'Diamond', tier: 'III', lp: 38 },
      { name: 'WestPomMain', rank: 'Diamond', tier: 'IV', lp: 22 },
      { name: 'CoastGG', rank: 'Platinum', tier: 'I', lp: 76 }
    ]
  },
  'lubelskie': {
    name: 'Lubelskie',
    players: 743,
    growth: '+6%',
    avgRank: 'Gold III',
    topPlayers: [
      { name: 'LublinPro', rank: 'Diamond', tier: 'II', lp: 47 },
      { name: 'EastMain', rank: 'Diamond', tier: 'III', lp: 34 },
      { name: 'BugCarry', rank: 'Diamond', tier: 'IV', lp: 26 },
      { name: 'ZamoскGG', rank: 'Platinum', tier: 'I', lp: 82 },
      { name: 'LublinADC', rank: 'Platinum', tier: 'I', lp: 71 }
    ]
  },
  'slaskie': {
    name: 'Śląskie (Katowice)',
    players: 2987,
    growth: '+11%',
    avgRank: 'Platinum I',
    topPlayers: [
      { name: 'KatowiceKing', rank: 'Grandmaster', tier: 'I', lp: 523 },
      { name: 'SilesianMain', rank: 'Master', tier: 'I', lp: 289 },
      { name: 'SpodekCarry', rank: 'Master', tier: 'I', lp: 145 },
      { name: 'CoalMiner', rank: 'Diamond', tier: 'I', lp: 93 },
      { name: 'RudaTop', rank: 'Diamond', tier: 'I', lp: 81 }
    ]
  },
  'kujawsko-pomorskie': {
    name: 'Kujawsko-Pomorskie',
    players: 654,
    growth: '+4%',
    avgRank: 'Gold II',
    topPlayers: [
      { name: 'BydgoszczMain', rank: 'Diamond', tier: 'II', lp: 52 },
      { name: 'TorunGG', rank: 'Diamond', tier: 'III', lp: 41 },
      { name: 'KuyaviaCarry', rank: 'Diamond', tier: 'IV', lp: 33 },
      { name: 'BrdaTop', rank: 'Platinum', tier: 'I', lp: 79 },
      { name: 'GrudziadzADC', rank: 'Platinum', tier: 'I', lp: 68 }
    ]
  },
  'podkarpackie': {
    name: 'Podkarpackie',
    players: 567,
    growth: '+8%',
    avgRank: 'Gold III',
    topPlayers: [
      { name: 'RzeszowPro', rank: 'Diamond', tier: 'II', lp: 49 },
      { name: 'SubcarpathMain', rank: 'Diamond', tier: 'III', lp: 36 },
      { name: 'SanCarry', rank: 'Diamond', tier: 'IV', lp: 27 },
      { name: 'PrzemyslGG', rank: 'Platinum', tier: 'I', lp: 74 },
      { name: 'TarnobrzegTop', rank: 'Platinum', tier: 'II', lp: 62 }
    ]
  },
  'warminsko-mazurskie': {
    name: 'Warmińsko-Mazurskie',
    players: 432,
    growth: '+3%',
    avgRank: 'Gold IV',
    topPlayers: [
      { name: 'OlsztynMain', rank: 'Diamond', tier: 'III', lp: 38 },
      { name: 'MasurianLake', rank: 'Diamond', tier: 'IV', lp: 29 },
      { name: 'ElblagCarry', rank: 'Platinum', tier: 'I', lp: 81 },
      { name: 'WarmiaGG', rank: 'Platinum', tier: 'I', lp: 73 },
      { name: 'LakeTop', rank: 'Platinum', tier: 'II', lp: 58 }
    ]
  },
  'swietokrzyskie': {
    name: 'Świętokrzyskie',
    players: 389,
    growth: '+2%',
    avgRank: 'Silver I',
    topPlayers: [
      { name: 'KielceMain', rank: 'Diamond', tier: 'III', lp: 35 },
      { name: 'HolyCrossGG', rank: 'Diamond', tier: 'IV', lp: 24 },
      { name: 'NidaCarry', rank: 'Platinum', tier: 'I', lp: 77 },
      { name: 'MountainTop', rank: 'Platinum', tier: 'II', lp: 54 },
      { name: 'OstrowiecADC', rank: 'Platinum', tier: 'II', lp: 48 }
    ]
  },
  'podlaskie': {
    name: 'Podlaskie',
    players: 501,
    growth: '+5%',
    avgRank: 'Gold III',
    topPlayers: [
      { name: 'BialystokPro', rank: 'Diamond', tier: 'II', lp: 45 },
      { name: 'PodlaskieMain', rank: 'Diamond', tier: 'III', lp: 37 },
      { name: 'NarewCarry', rank: 'Diamond', tier: 'IV', lp: 25 },
      { name: 'SuwalkiGG', rank: 'Platinum', tier: 'I', lp: 72 },
      { name: 'BiebrzaTop', rank: 'Platinum', tier: 'I', lp: 66 }
    ]
  },
  'opolskie': {
    name: 'Opolskie',
    players: 298,
    growth: '+1%',
    avgRank: 'Silver II',
    topPlayers: [
      { name: 'OpoleMain', rank: 'Diamond', tier: 'IV', lp: 21 },
      { name: 'OderMain', rank: 'Platinum', tier: 'I', lp: 69 },
      { name: 'OpoleCarry', rank: 'Platinum', tier: 'II', lp: 51 },
      { name: 'KedzierzynGG', rank: 'Platinum', tier: 'II', lp: 44 },
      { name: 'NysaTop', rank: 'Platinum', tier: 'III', lp: 37 }
    ]
  },
  'lubuskie': {
    name: 'Lubuskie',
    players: 312,
    growth: '+6%',
    avgRank: 'Silver I',
    topPlayers: [
      { name: 'GorzowMain', rank: 'Diamond', tier: 'III', lp: 32 },
      { name: 'LubuskMain', rank: 'Diamond', tier: 'IV', lp: 23 },
      { name: 'OdraCarry', rank: 'Platinum', tier: 'I', lp: 75 },
      { name: 'ZielonaTop', rank: 'Platinum', tier: 'I', lp: 68 },
      { name: 'NotecADC', rank: 'Platinum', tier: 'II', lp: 53 }
    ]
  },
};

type VoivodeshipKey = keyof typeof voivodeships;

export default function PolandMapNew() {
  const [selectedRegion, setSelectedRegion] = useState<VoivodeshipKey>('pomorskie');
  const [hoveredRegion, setHoveredRegion] = useState<VoivodeshipKey | null>(null);

  const totalPlayers = Object.values(voivodeships).reduce((sum, v) => sum + v.players, 0);

  // Get the English key from Polish name
  const getEnglishKey = (polishName: string): VoivodeshipKey | null => {
    const key = voivodeshipMapping[polishName];
    return (key && key in voivodeships) ? key as VoivodeshipKey : null;
  };

  return (
    <section className="py-20 bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with dramatic player count */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-cyan-accent/10 to-purple-500/10 border border-cyan-accent/30 rounded-full backdrop-blur-xl">
            <div className="w-2 h-2 bg-cyan-accent rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-cyan-accent">87 PLAYERS REGISTERED</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-cyan-accent bg-clip-text text-transparent mb-4 animate-gradient">
            Our vision: Poland's interactive player map
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-6">
            When we reach 500 players, we'll unlock the full interactive map showing player distribution, regional rankings, and local leaderboards with REAL data.
          </p>
          <div className="text-6xl md:text-7xl font-bold text-cyan-accent mb-2">
            500
          </div>
          <p className="text-sm text-[var(--text-muted)] uppercase tracking-wider">Players needed to unlock</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Interactive Map */}
          <div className="relative">
            <svg
              viewBox="0 0 400 470"
              className="w-full h-auto"
              style={{ maxWidth: '700px', margin: '0 auto' }}
            >
              {/* Render all voivodeships */}
              {Object.entries(voivodeshipsData).map(([polishName, data]) => {
                const englishKey = getEnglishKey(polishName);
                if (!englishKey) return null;

                const isSelected = selectedRegion === englishKey;
                const isHovered = hoveredRegion === englishKey;

                return (
                  <g key={polishName}>
                    <path
                      d={data.path}
                      fill="transparent"
                      stroke="var(--accent-cyan)"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-all duration-200"
                      style={{
                        filter: (isHovered || isSelected) ? 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))' : 'none'
                      }}
                      onClick={() => setSelectedRegion(englishKey)}
                      onMouseEnter={() => setHoveredRegion(englishKey)}
                      onMouseLeave={() => setHoveredRegion(null)}
                    />
                    {/* Red blinking dot on selected region */}
                    {isSelected && (
                      <circle
                        cx={data.centroid.x}
                        cy={data.centroid.y}
                        r="6"
                        fill="#EF4444"
                      >
                        <animate
                          attributeName="opacity"
                          values="1;0.3;1"
                          dur="1.5s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Right: Stats Panel with Glass Morphism */}
          <div className="relative bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.02)] border border-cyan-accent/20 rounded-2xl p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,212,255,0.2)] hover:border-cyan-accent/40 transition-all duration-300 group">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                {voivodeships[selectedRegion].name}
              </h3>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Users className="w-4 h-4" />
                <span className="text-sm">Regional Statistics</span>
              </div>
            </div>

            {/* Consolidated Player Info */}
            <div className="mb-6 p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-lg">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <div className="text-sm text-[var(--text-secondary)] mb-1">Active Players</div>
                  <div className="text-4xl font-bold text-white">
                    {voivodeships[selectedRegion].players.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[var(--text-secondary)] mb-1">Avg. Rank</div>
                  <div className="text-lg font-semibold text-cyan-accent">
                    {voivodeships[selectedRegion].avgRank}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-cyan-500/20">
                <TrendingUp className="w-4 h-4 text-[var(--color-success)]" />
                <span className="text-sm font-semibold text-[var(--color-success)]">
                  {voivodeships[selectedRegion].growth} this month
                </span>
              </div>
            </div>

            {/* Top 5 Players */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wide">
                Top 5 Players
              </h4>
              <div className="space-y-3">
                {voivodeships[selectedRegion].topPlayers.map((player, index) => (
                  <div
                    key={player.name}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-[rgba(255,255,255,0.06)] to-[rgba(255,255,255,0.02)] rounded-xl border border-[var(--border-color)] hover:border-cyan-500/50 hover:bg-[rgba(255,255,255,0.08)] hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${index === 0 ? 'from-yellow-400 to-orange-500' : index === 1 ? 'from-gray-300 to-gray-400' : index === 2 ? 'from-orange-400 to-orange-600' : 'from-cyan-500 to-purple-500'} flex items-center justify-center text-sm font-bold text-white shadow-lg`}>
                          {player.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--bg-primary)] border-2 border-cyan-accent flex items-center justify-center text-[10px] font-bold text-cyan-accent">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-cyan-accent transition-colors">{player.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {player.rank} {player.tier}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-cyan-accent">
                      {player.lp} LP
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6">
              <button className="w-full px-6 py-3 bg-gradient-to-r from-cyan-accent to-[#00B8E6] text-[#0A0E27] font-bold rounded-xl shadow-[0_8px_30px_rgba(0,212,255,0.3)] hover:shadow-[0_12px_40px_rgba(0,212,255,0.5)] hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden">
                <span className="relative z-10">View Regional Leaderboard →</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
