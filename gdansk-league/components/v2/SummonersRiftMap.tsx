'use client';

import { summonersRiftRegions } from '@/data/summoners-rift-regions';

export default function SummonersRiftMap() {
  // Upper river death hotspot for jungler
  const upperRiverRegion = summonersRiftRegions.riverUpper;

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-6 h-full">
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .blink-animation {
          animation: blink 2s ease-in-out infinite;
        }
      `}</style>

      <div className="grid grid-cols-[1fr_180px] gap-4 h-full">
        {/* Left: Map with Death Hotspot */}
        <div className="flex items-center justify-center relative">
          <div className="relative w-full" style={{ maxWidth: '300px' }}>
            {/* Background: Actual Summoner's Rift minimap */}
            <img
              src="/map11.png"
              alt="Summoner's Rift"
              className="w-full h-auto rounded opacity-60"
            />

            {/* Overlay: Death hotspot in upper river */}
            <svg
              viewBox="0 0 512 512"
              className="absolute inset-0 w-full h-full"
              style={{ mixBlendMode: 'screen' }}
            >
              {/* Red death zone - Upper River with blinking animation */}
              <path
                d={upperRiverRegion.path}
                fill="rgba(239, 68, 68, 0.5)"
                stroke="rgba(239, 68, 68, 0.8)"
                strokeWidth="2"
                className="blink-animation"
              />
            </svg>
          </div>
        </div>

        {/* Right: Death Stats */}
        <div className="flex flex-col justify-center">
          <div className="mb-4">
            <div className="text-sm text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
              You're dying
            </div>
            <div className="text-4xl font-bold text-[#EF4444] mb-2">
              32% more
            </div>
            <div className="text-xs text-[var(--text-secondary)] leading-tight">
              than EUNE Junglers at your rank
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
              Hotspot
            </div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              Upper River
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
