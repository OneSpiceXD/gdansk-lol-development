'use client';

import { useState } from 'react';
import { Users, TrendingUp } from 'lucide-react';

// Voivodeship data with player counts
const voivodeships = {
  'pomorskie': { name: 'Pomorskie (Gdańsk)', players: 2847, growth: '+12%', color: '#00D4FF' },
  'mazowieckie': { name: 'Mazowieckie (Warsaw)', players: 4521, growth: '+8%', color: '#00D4FF' },
  'wielkopolskie': { name: 'Wielkopolskie (Poznań)', players: 1923, growth: '+15%', color: '#00D4FF' },
  'malopolskie': { name: 'Małopolskie (Kraków)', players: 2156, growth: '+10%', color: '#00D4FF' },
  'dolnoslaskie': { name: 'Dolnośląskie (Wrocław)', players: 1834, growth: '+7%', color: '#00D4FF' },
  'lodzkie': { name: 'Łódzkie (Łódź)', players: 1245, growth: '+5%', color: '#00D4FF' },
  'zachodniopomorskie': { name: 'Zachodniopomorskie', players: 892, growth: '+9%', color: '#00D4FF' },
  'lubelskie': { name: 'Lubelskie', players: 743, growth: '+6%', color: '#00D4FF' },
  'slaskie': { name: 'Śląskie (Katowice)', players: 2987, growth: '+11%', color: '#00D4FF' },
  'kujawsko-pomorskie': { name: 'Kujawsko-Pomorskie', players: 654, growth: '+4%', color: '#00D4FF' },
  'podkarpackie': { name: 'Podkarpackie', players: 567, growth: '+8%', color: '#00D4FF' },
  'warminsko-mazurskie': { name: 'Warmińsko-Mazurskie', players: 432, growth: '+3%', color: '#00D4FF' },
  'swietokrzyskie': { name: 'Świętokrzyskie', players: 389, growth: '+2%', color: '#00D4FF' },
  'podlaskie': { name: 'Podlaskie', players: 501, growth: '+5%', color: '#00D4FF' },
  'opolskie': { name: 'Opolskie', players: 298, growth: '+1%', color: '#00D4FF' },
  'lubuskie': { name: 'Lubuskie', players: 312, growth: '+6%', color: '#00D4FF' },
};

export default function PolandMap() {
  const [selectedRegion, setSelectedRegion] = useState<keyof typeof voivodeships>('pomorskie');
  const [hoveredRegion, setHoveredRegion] = useState<keyof typeof voivodeships | null>(null);

  const totalPlayers = Object.values(voivodeships).reduce((sum, v) => sum + v.players, 0);

  return (
    <section className="py-20 bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-[32px] font-semibold text-[var(--text-primary)] mb-4">
            Players across Poland
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            {totalPlayers.toLocaleString()} active players nationwide. Click a region to see local stats.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Interactive Map */}
          <div className="relative">
            <svg
              viewBox="0 0 400 500"
              className="w-full h-auto"
              style={{ maxWidth: '450px', margin: '0 auto' }}
            >
              {/* Zachodniopomorskie - Northwest coast */}
              <path
                d="M 50 80 L 120 60 L 170 80 L 175 120 L 140 135 L 90 130 L 55 110 Z"
                fill="transparent"
                stroke="var(--accent-cyan)"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedRegion('zachodniopomorskie')}
                onMouseEnter={() => setHoveredRegion('zachodniopomorskie')}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Pomorskie - North, contains Gdańsk */}
              <path
                d="M 175 80 L 240 70 L 280 85 L 285 115 L 260 130 L 220 135 L 175 120 Z"
                fill="transparent"
                stroke="var(--accent-cyan)"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedRegion('pomorskie')}
                onMouseEnter={() => setHoveredRegion('pomorskie')}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Warmińsko-Mazurskie - Northeast */}
              <path
                d="M 285 85 L 350 75 L 365 110 L 355 145 L 305 150 L 285 115 Z"
                fill="transparent"
                stroke="var(--accent-cyan)"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedRegion('warminsko-mazurskie')}
                onMouseEnter={() => setHoveredRegion('warminsko-mazurskie')}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Podlaskie - Far Northeast */}
              <path
                d="M 305 150 L 355 145 L 370 180 L 365 215 L 330 225 L 305 195 Z"
                fill="transparent"
                stroke="var(--accent-cyan)"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedRegion('podlaskie')}
                onMouseEnter={() => setHoveredRegion('podlaskie')}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Lubuskie - West */}
              <path
                d="M 55 135 L 110 135 L 135 165 L 130 205 L 90 215 L 55 195 Z"
                fill="transparent"
                stroke="var(--accent-cyan)"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedRegion('lubuskie')}
                onMouseEnter={() => setHoveredRegion('lubuskie')}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Kujawsko-Pomorskie - North-center */}
              <path
                d="M 140 135 L 220 135 L 240 165 L 230 200 L 180 205 L 145 185 Z"
                fill="transparent"
                stroke="var(--accent-cyan)"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedRegion('kujawsko-pomorskie')}
                onMouseEnter={() => setHoveredRegion('kujawsko-pomorskie')}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Wielkopolskie - West-center (Poznań) */}
              <path
                d="M 90 215 L 145 210 L 180 240 L 175 285 L 135 295 L 95 275 Z"
                fill="transparent"
                stroke="var(--accent-cyan)"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedRegion('wielkopolskie')}
                onMouseEnter={() => setHoveredRegion('wielkopolskie')}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Mazowieckie - Center-east (Warsaw) */}
              <path
                d="M 230 200 L 305 195 L 330 225 L 325 280 L 280 295 L 235 285 L 225 240 Z"
                fill="transparent"
                stroke="var(--accent-cyan)"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedRegion('mazowieckie')}
                onMouseEnter={() => setHoveredRegion('mazowieckie')}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Łódzkie - Center (Łódź) */}
              <path
                d="M 175 240 L 235 240 L 240 280 L 215 305 L 170 300 L 165 270 Z"
                fill="transparent"
                stroke="var(--accent-cyan)"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedRegion('lodzkie')}
                onMouseEnter={() => setHoveredRegion('lodzkie')}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Lubelskie - East */}
              <path
                d="M 280 295 L 325 285 L 345 320 L 340 365 L 300 375 L 270 350 Z"
                fill="transparent"
                stroke="var(--accent-cyan)"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedRegion('lubelskie')}
                onMouseEnter={() => setHoveredRegion('lubelskie')}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Dolnośląskie - Southwest (Wrocław) */}
              <path
                d="M 75 295 L 135 295 L 155 330 L 145 365 L 95 375 L 70 345 Z"
                fill="transparent"
                stroke="var(--accent-cyan)"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedRegion('dolnoslaskie')}
                onMouseEnter={() => setHoveredRegion('dolnoslaskie')}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Opolskie - Small region south-center */}
              <path
                d="M 145 325 L 180 320 L 190 350 L 180 370 L 155 365 Z"
                fill="transparent"
                stroke="var(--accent-cyan)"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedRegion('opolskie')}
                onMouseEnter={() => setHoveredRegion('opolskie')}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Śląskie - South (Katowice) */}
              <path
                d="M 155 365 L 190 365 L 210 395 L 205 420 L 165 425 L 145 400 Z"
                fill="transparent"
                stroke="var(--accent-cyan)"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedRegion('slaskie')}
                onMouseEnter={() => setHoveredRegion('slaskie')}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Świętokrzyskie - Center-south */}
              <path
                d="M 215 305 L 270 305 L 280 340 L 265 370 L 220 370 L 210 340 Z"
                fill="transparent"
                stroke="var(--accent-cyan)"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedRegion('swietokrzyskie')}
                onMouseEnter={() => setHoveredRegion('swietokrzyskie')}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Małopolskie - South (Kraków) */}
              <path
                d="M 205 380 L 265 375 L 285 405 L 280 440 L 235 450 L 200 430 Z"
                fill="transparent"
                stroke="var(--accent-cyan)"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedRegion('malopolskie')}
                onMouseEnter={() => setHoveredRegion('malopolskie')}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Podkarpackie - Southeast */}
              <path
                d="M 285 375 L 340 365 L 355 405 L 345 445 L 285 445 L 280 410 Z"
                fill="transparent"
                stroke="var(--accent-cyan)"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200"
                onClick={() => setSelectedRegion('podkarpackie')}
                onMouseEnter={() => setHoveredRegion('podkarpackie')}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Blinking red dots for ALL regions - show on selected */}
              {selectedRegion === 'pomorskie' && (
                <circle cx="230" cy="100" r="6" fill="#EF4444">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {selectedRegion === 'mazowieckie' && (
                <circle cx="280" cy="240" r="7" fill="#EF4444">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {selectedRegion === 'wielkopolskie' && (
                <circle cx="130" cy="250" r="6" fill="#EF4444">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {selectedRegion === 'malopolskie' && (
                <circle cx="240" cy="415" r="6" fill="#EF4444">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {selectedRegion === 'dolnoslaskie' && (
                <circle cx="110" cy="335" r="6" fill="#EF4444">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {selectedRegion === 'slaskie' && (
                <circle cx="180" cy="395" r="6" fill="#EF4444">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {selectedRegion === 'lodzkie' && (
                <circle cx="205" cy="270" r="5" fill="#EF4444">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {selectedRegion === 'zachodniopomorskie' && (
                <circle cx="110" cy="95" r="5" fill="#EF4444">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {selectedRegion === 'lubelskie' && (
                <circle cx="310" cy="330" r="5" fill="#EF4444">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {selectedRegion === 'kujawsko-pomorskie' && (
                <circle cx="190" cy="170" r="5" fill="#EF4444">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {selectedRegion === 'podkarpackie' && (
                <circle cx="315" cy="410" r="5" fill="#EF4444">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {selectedRegion === 'warminsko-mazurskie' && (
                <circle cx="320" cy="115" r="5" fill="#EF4444">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {selectedRegion === 'swietokrzyskie' && (
                <circle cx="245" cy="340" r="4" fill="#EF4444">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {selectedRegion === 'podlaskie' && (
                <circle cx="335" cy="185" r="5" fill="#EF4444">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {selectedRegion === 'opolskie' && (
                <circle cx="170" cy="345" r="4" fill="#EF4444">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {selectedRegion === 'lubuskie' && (
                <circle cx="90" cy="175" r="5" fill="#EF4444">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
            </svg>
          </div>

          {/* Right: Stats Panel */}
          <div className="bg-[rgba(255,255,255,0.05)] border border-[var(--border-color)] rounded-xl p-8 backdrop-blur-[10px]">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                {voivodeships[selectedRegion].name}
              </h3>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Users className="w-4 h-4" />
                <span className="text-sm">Regional Statistics</span>
              </div>
            </div>

            {/* Player Count */}
            <div className="mb-6 p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-lg">
              <div className="text-sm text-[var(--text-secondary)] mb-2">Active Players</div>
              <div className="text-5xl font-bold text-white mb-2">
                {voivodeships[selectedRegion].players.toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--color-success)]" />
                <span className="text-sm font-semibold text-[var(--color-success)]">
                  {voivodeships[selectedRegion].growth} this month
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[rgba(255,255,255,0.03)] rounded-lg border border-[var(--border-color)]">
                <div className="text-xs text-[var(--text-muted)] mb-1">Avg. Rank</div>
                <div className="text-lg font-semibold text-[var(--text-primary)]">Platinum II</div>
              </div>
              <div className="p-4 bg-[rgba(255,255,255,0.03)] rounded-lg border border-[var(--border-color)]">
                <div className="text-xs text-[var(--text-muted)] mb-1">Teams</div>
                <div className="text-lg font-semibold text-[var(--text-primary)]">142</div>
              </div>
              <div className="p-4 bg-[rgba(255,255,255,0.03)] rounded-lg border border-[var(--border-color)]">
                <div className="text-xs text-[var(--text-muted)] mb-1">Tournaments</div>
                <div className="text-lg font-semibold text-[var(--text-primary)]">8/month</div>
              </div>
              <div className="p-4 bg-[rgba(255,255,255,0.03)] rounded-lg border border-[var(--border-color)]">
                <div className="text-xs text-[var(--text-muted)] mb-1">LFG Posts</div>
                <div className="text-lg font-semibold text-[var(--text-primary)]">89</div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6">
              <button className="w-full px-6 py-3 bg-cyan-accent text-[#0A0E27] font-semibold rounded-lg hover:bg-[#00B8E6] transition-all">
                View Regional Leaderboard →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
