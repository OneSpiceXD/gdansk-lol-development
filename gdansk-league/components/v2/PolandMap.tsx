'use client';

import { useState } from 'react';
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
    topPlayers: [
      { name: 'xKomandor', rank: 'Master I' },
      { name: 'GdańskPro', rank: 'Diamond I' },
      { name: 'BalticAce', rank: 'Diamond II' },
      { name: 'TriCityGG', rank: 'Diamond III' },
      { name: 'SopotMain', rank: 'Diamond IV' }
    ]
  },
  'mazowieckie': {
    name: 'Mazowieckie (Warsaw)',
    players: 4521,
    growth: '+8%',
    topPlayers: [
      { name: 'WarsawLegend', rank: 'Grandmaster' },
      { name: 'PolskaPower', rank: 'Master I' },
      { name: 'CapitalMain', rank: 'Master I' },
      { name: 'PragaKing', rank: 'Diamond I' },
      { name: 'WislaCarry', rank: 'Diamond I' }
    ]
  },
  'wielkopolskie': {
    name: 'Wielkopolskie (Poznań)',
    players: 1923,
    growth: '+15%',
    topPlayers: [
      { name: 'PoznanBeast', rank: 'Master I' },
      { name: 'WartaMain', rank: 'Diamond I' },
      { name: 'GreatPoland', rank: 'Diamond II' },
      { name: 'LechSupport', rank: 'Diamond III' },
      { name: 'MaltaADC', rank: 'Diamond III' }
    ]
  },
  'malopolskie': {
    name: 'Małopolskie (Kraków)',
    players: 2156,
    growth: '+10%',
    topPlayers: [
      { name: 'KrakowChamp', rank: 'Master I' },
      { name: 'WawelKing', rank: 'Diamond I' },
      { name: 'TatraMain', rank: 'Diamond II' },
      { name: 'RynekGG', rank: 'Diamond II' },
      { name: 'WislaTop', rank: 'Diamond III' }
    ]
  },
  'dolnoslaskie': {
    name: 'Dolnośląskie (Wrocław)',
    players: 1834,
    growth: '+7%',
    topPlayers: [
      { name: 'WroclawPro', rank: 'Master I' },
      { name: 'OdraCarry', rank: 'Diamond I' },
      { name: 'DwarfMain', rank: 'Diamond II' },
      { name: 'SilesiaTop', rank: 'Diamond III' },
      { name: 'RynekJG', rank: 'Diamond III' }
    ]
  },
  'lodzkie': {
    name: 'Łódzkie (Łódź)',
    players: 1245,
    growth: '+5%',
    topPlayers: [
      { name: 'LodzMain', rank: 'Diamond I' },
      { name: 'PiotrkowGG', rank: 'Diamond II' },
      { name: 'TextileKing', rank: 'Diamond III' },
      { name: 'PilsudskiGG', rank: 'Platinum I' },
      { name: 'LodzCarry', rank: 'Platinum I' }
    ]
  },
  'zachodniopomorskie': {
    name: 'Zachodniopomorskie',
    players: 892,
    growth: '+9%',
    topPlayers: [
      { name: 'SzczecinMain', rank: 'Diamond I' },
      { name: 'BalticMain', rank: 'Diamond II' },
      { name: 'OderTop', rank: 'Diamond III' },
      { name: 'PomeraniaGG', rank: 'Platinum I' },
      { name: 'CoastCarry', rank: 'Platinum I' }
    ]
  },
  'lubelskie': {
    name: 'Lubelskie',
    players: 743,
    growth: '+6%',
    topPlayers: [
      { name: 'LublinMain', rank: 'Diamond II' },
      { name: 'EastPoland', rank: 'Diamond III' },
      { name: 'BugCarry', rank: 'Diamond IV' },
      { name: 'ZamoscGG', rank: 'Platinum I' },
      { name: 'LublinTop', rank: 'Platinum I' }
    ]
  },
  'slaskie': {
    name: 'Śląskie (Katowice)',
    players: 2987,
    growth: '+11%',
    topPlayers: [
      { name: 'KatowiceMain', rank: 'Master I' },
      { name: 'SilesiaPro', rank: 'Diamond I' },
      { name: 'MinerMain', rank: 'Diamond I' },
      { name: 'RudaCarry', rank: 'Diamond II' },
      { name: 'SosnoTop', rank: 'Diamond II' }
    ]
  },
  'kujawsko-pomorskie': {
    name: 'Kujawsko-Pomorskie',
    players: 654,
    growth: '+4%',
    topPlayers: [
      { name: 'BydgoszczMain', rank: 'Diamond III' },
      { name: 'TorunPro', rank: 'Diamond III' },
      { name: 'KujawMain', rank: 'Diamond IV' },
      { name: 'VistulaGG', rank: 'Platinum I' },
      { name: 'BrdaCarry', rank: 'Platinum II' }
    ]
  },
  'podkarpackie': {
    name: 'Podkarpackie',
    players: 567,
    growth: '+8%',
    topPlayers: [
      { name: 'RzeszowMain', rank: 'Diamond II' },
      { name: 'CarpathiaGG', rank: 'Diamond III' },
      { name: 'SanCarry', rank: 'Diamond IV' },
      { name: 'PrzemyslTop', rank: 'Platinum I' },
      { name: 'MountainMain', rank: 'Platinum I' }
    ]
  },
  'warminsko-mazurskie': {
    name: 'Warmińsko-Mazurskie',
    players: 432,
    growth: '+3%',
    topPlayers: [
      { name: 'OlsztynMain', rank: 'Diamond IV' },
      { name: 'MazuryGG', rank: 'Platinum I' },
      { name: 'LakeMain', rank: 'Platinum I' },
      { name: 'WarmiaGG', rank: 'Platinum I' },
      { name: 'LakeTop', rank: 'Platinum II' }
    ]
  },
  'swietokrzyskie': {
    name: 'Świętokrzyskie',
    players: 389,
    growth: '+2%',
    topPlayers: [
      { name: 'KielceMain', rank: 'Diamond III' },
      { name: 'HolyCrossGG', rank: 'Diamond IV' },
      { name: 'NidaCarry', rank: 'Platinum I' },
      { name: 'MountainTop', rank: 'Platinum II' },
      { name: 'OstrowiecADC', rank: 'Platinum II' }
    ]
  },
  'podlaskie': {
    name: 'Podlaskie',
    players: 501,
    growth: '+5%',
    topPlayers: [
      { name: 'BialystokPro', rank: 'Diamond II' },
      { name: 'PodlaskieMain', rank: 'Diamond III' },
      { name: 'NarewCarry', rank: 'Diamond IV' },
      { name: 'SuwalkiGG', rank: 'Platinum I' },
      { name: 'BiebrzaTop', rank: 'Platinum I' }
    ]
  },
  'opolskie': {
    name: 'Opolskie',
    players: 298,
    growth: '+1%',
    topPlayers: [
      { name: 'OpoleMain', rank: 'Diamond IV' },
      { name: 'OderMain', rank: 'Platinum I' },
      { name: 'OpoleCarry', rank: 'Platinum II' },
      { name: 'KedzierzynGG', rank: 'Platinum II' },
      { name: 'NysaTop', rank: 'Platinum III' }
    ]
  },
  'lubuskie': {
    name: 'Lubuskie',
    players: 312,
    growth: '+6%',
    topPlayers: [
      { name: 'GorzowMain', rank: 'Diamond III' },
      { name: 'LubuskMain', rank: 'Diamond IV' },
      { name: 'OdraCarry', rank: 'Platinum I' },
      { name: 'ZielonaTop', rank: 'Platinum I' },
      { name: 'NotecADC', rank: 'Platinum II' }
    ]
  },
};

type VoivodeshipKey = keyof typeof voivodeships;

export default function PolandMap() {
  const [selectedRegion, setSelectedRegion] = useState<VoivodeshipKey>('pomorskie');
  const [hoveredRegion, setHoveredRegion] = useState<VoivodeshipKey | null>(null);

  // Get the English key from Polish name
  const getEnglishKey = (polishName: string): VoivodeshipKey | null => {
    const key = voivodeshipMapping[polishName];
    return (key && key in voivodeships) ? key as VoivodeshipKey : null;
  };

  return (
    <section className="py-32 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
      <div className="max-w-[1280px] mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-[800px] mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-block text-xs text-[var(--accent)] uppercase tracking-wider font-semibold">
              Interactive map
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-[rgba(255,165,0,0.1)] border border-[rgba(255,165,0,0.3)] rounded text-[10px] uppercase tracking-wider font-semibold text-[#FFA500]">
              <span className="w-1.5 h-1.5 bg-[#FFA500] rounded-full"></span>
              Preview data
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            Find players in your city
          </h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            Explore player distribution across Poland, view regional rankings, and discover top talent in your area.
          </p>
        </div>

        {/* Map and Stats Layout */}
        <div className="grid lg:grid-cols-[1fr_420px] gap-12 items-center">
          {/* Left: Map Visual (Outside frame, larger) */}
          <div className="relative">
            <svg
              viewBox="-20 0 440 470"
              className="w-full h-auto relative z-10"
              style={{ maxWidth: '650px', margin: '0 auto' }}
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
                      stroke={isHovered || isSelected ? "#00d9ff" : "var(--accent)"}
                      strokeWidth={isHovered || isSelected ? "2" : "1.5"}
                      className="cursor-pointer transition-all duration-200"
                      style={{
                        filter: isHovered || isSelected ? 'drop-shadow(0 0 8px rgba(0, 217, 255, 0.6))' : 'none'
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

          {/* Right: Stats Panel Card with Hover Effects */}
          <div
            className="group relative bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-8 flex flex-col min-h-[500px] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,217,255,0.5)] hover:border-[#00d9ff] transition-all duration-300 ease-out cursor-pointer overflow-hidden"
          >
            {/* Gradient Light Effect */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at top, rgba(0, 217, 255, 0.08) 0%, transparent 50%)',
                opacity: 0.6
              }}
            />
            {/* Header */}
            <div className="mb-8 pb-8 border-b border-[var(--border-subtle)]">
              <h3 className="text-2xl font-semibold mb-1">{voivodeships[selectedRegion].name}</h3>
            </div>

            {/* Big Stat */}
            <div className="mb-8">
              <div className="text-6xl font-semibold text-white leading-none mb-2">
                {voivodeships[selectedRegion].players.toLocaleString()}
              </div>
              <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Active players
              </div>
              <div className="inline-block px-2 py-1 text-xs font-semibold bg-[rgba(0,255,136,0.1)] text-[#00ff88] rounded">
                {voivodeships[selectedRegion].growth} this month
              </div>
            </div>

            {/* Top Players List */}
            <div className="flex-1">
              <h4 className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-4">
                Top 5 players
              </h4>
              <div className="space-y-0">
                {voivodeships[selectedRegion].topPlayers.map((player, index) => {
                  // Define colors for top 3 placements
                  let bgGradient = 'bg-gradient-to-br from-[var(--accent)] to-[#0088cc]';
                  if (index === 0) {
                    // Gold for 1st place
                    bgGradient = 'bg-gradient-to-br from-[#FFD700] to-[#FFA500]';
                  } else if (index === 1) {
                    // Silver for 2nd place
                    bgGradient = 'bg-gradient-to-br from-[#C0C0C0] to-[#A8A8A8]';
                  } else if (index === 2) {
                    // Bronze for 3rd place
                    bgGradient = 'bg-gradient-to-br from-[#CD7F32] to-[#B8732C]';
                  }

                  return (
                    <div
                      key={player.name}
                      className="flex justify-between items-center py-3 border-b border-[var(--border-subtle)] last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full ${bgGradient} flex items-center justify-center text-xs font-semibold text-[var(--bg-primary)]`}>
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium">{player.name}</span>
                      </div>
                      <span className="text-xs text-[var(--text-secondary)] font-medium">{player.rank}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-auto">
              <button className="w-full py-3 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg text-sm font-medium hover:-translate-y-1 hover:scale-105 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden group">
                <span className="relative z-10">View regional leaderboard</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
