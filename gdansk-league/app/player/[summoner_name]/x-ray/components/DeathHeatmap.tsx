'use client'

import Image from 'next/image'
import { useState } from 'react'

interface Death {
  x: number
  y: number
  timestamp: number
  killer_champion: string
  assisting_champions: string[]
  team_id?: number
  role?: string
  match_index?: number
}

interface DeathHeatmapProps {
  deaths: Death[]
  visualizationMode: 'dots' | 'heatmap'
}

export default function DeathHeatmap({ deaths, visualizationMode }: DeathHeatmapProps) {
  // Summoner's Rift map dimensions (in game units)
  // Using standard League of Legends coordinate system
  // The minimap represents the full playable area from approximately 0 to 14800
  const MAP_MIN_X = 0
  const MAP_MAX_X = 14800
  const MAP_MIN_Y = 0
  const MAP_MAX_Y = 14800
  const MAP_RANGE_X = MAP_MAX_X - MAP_MIN_X
  const MAP_RANGE_Y = MAP_MAX_Y - MAP_MIN_Y

  // Debug: Calculate actual min/max from death data
  if (deaths.length > 0) {
    const minX = Math.min(...deaths.map(d => d.x))
    const maxX = Math.max(...deaths.map(d => d.x))
    const minY = Math.min(...deaths.map(d => d.y))
    const maxY = Math.max(...deaths.map(d => d.y))
    console.log('Death coordinate ranges:', { minX, maxX, minY, maxY })
    console.log('Current map bounds:', { MAP_MIN_X, MAP_MAX_X, MAP_MIN_Y, MAP_MAX_Y })
  }


  return (
    <div
      className="relative w-[625px] h-[625px] bg-[#0f1420] rounded-lg border border-[#1e2836] overflow-hidden"
    >
      {/* Map background */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/Summoner's_Rift_Minimap.png"
          alt="Summoner's Rift"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Death count overlay */}
      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded text-xs text-gray-300 border border-gray-700">
        {deaths.length} deaths
      </div>

      {/* Legend - Top Right */}
      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded text-xs border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full border border-blue-300"></div>
            <span className="text-blue-300">Blue side deaths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full border border-red-300"></div>
            <span className="text-red-300">Red side deaths</span>
          </div>
        </div>
      </div>

      {/* Render deaths as dots or heatmap */}
      {visualizationMode === 'dots' && deaths.map((death, idx) => {
        const isBlueTeam = death.team_id === 100
        return (
          <div
            key={idx}
            className={`absolute w-3 h-3 rounded-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer border-2 shadow-lg ${
              isBlueTeam
                ? 'bg-blue-500 border-blue-300'
                : 'bg-red-500 border-red-300'
            }`}
            style={{
              left: `${((death.x - MAP_MIN_X) / MAP_RANGE_X) * 100}%`,
              top: `${100 - ((death.y - MAP_MIN_Y) / MAP_RANGE_Y) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
            title={`Killed by ${death.killer_champion}${death.assisting_champions.length > 0 ? ` (+ ${death.assisting_champions.length} assists)` : ''}`}
          />
        )
      })}
    </div>
  )
}
