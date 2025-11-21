'use client'

import Image from 'next/image'
import { type TierName } from '@/lib/tierCalculator'

interface RankIconProps {
  tier: TierName
  size?: number
  className?: string
}

export default function RankIcon({ tier, size = 48, className = '' }: RankIconProps) {
  // Map tier names to image file names
  const tierToFileName: Record<TierName, string> = {
    'CHALLENGER': 'challenger',
    'GRANDMASTER': 'grandmaster',
    'MASTER': 'master',
    'DIAMOND': 'diamond',
    'EMERALD': 'emerald',
    'PLATINUM': 'platinum',
    'GOLD': 'gold',
    'SILVER': 'silver',
    'BRONZE': 'bronze',
    'IRON': 'iron',
  }

  const fileName = tierToFileName[tier]
  const imagePath = `/ranks/${fileName}.png`

  return (
    <div className={className} style={{ width: size, height: size, position: 'relative' }}>
      <Image
        src={imagePath}
        alt={`${tier} rank`}
        width={size}
        height={size}
        className="object-contain"
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))' }}
      />
    </div>
  )
}
