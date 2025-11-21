'use client'

import { getTierFromPercentile, type TierInfo } from '@/lib/tierCalculator'
import { Crown, Trophy, Award, Gem, Zap } from 'lucide-react'

interface TierBadgeProps {
  percentile: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export default function TierBadge({
  percentile,
  size = 'md',
  showLabel = true,
  className = ''
}: TierBadgeProps) {
  const tier = getTierFromPercentile(percentile)

  // Size classes
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1',
      text: 'text-xs',
      icon: 12
    },
    md: {
      container: 'px-3 py-1.5',
      text: 'text-sm',
      icon: 14
    },
    lg: {
      container: 'px-4 py-2',
      text: 'text-base',
      icon: 16
    }
  }

  const currentSize = sizeClasses[size]

  // Get icon based on tier
  const getTierIcon = (tierInfo: TierInfo) => {
    const IconProps = {
      size: currentSize.icon,
      className: 'inline-block'
    }

    switch (tierInfo.name) {
      case 'CHALLENGER':
      case 'GRANDMASTER':
        return <Crown {...IconProps} />
      case 'MASTER':
        return <Trophy {...IconProps} />
      case 'DIAMOND':
      case 'EMERALD':
        return <Gem {...IconProps} />
      case 'PLATINUM':
      case 'GOLD':
        return <Award {...IconProps} />
      default:
        return <Zap {...IconProps} />
    }
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${currentSize.container} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${tier.color}20, ${tier.color}40)`,
        border: `1.5px solid ${tier.color}`,
        color: tier.color
      }}
    >
      {getTierIcon(tier)}
      {showLabel && (
        <span className={`${currentSize.text} uppercase tracking-wide`}>
          {tier.displayName}
        </span>
      )}
    </div>
  )
}
