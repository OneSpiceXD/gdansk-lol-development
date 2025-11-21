'use client'

import { Lock } from 'lucide-react'

interface LockedFeatureCardProps {
  title: string
  description: string
  previewContent?: React.ReactNode
  icon?: React.ReactNode
  ctaText?: string
  className?: string
}

export default function LockedFeatureCard({
  title,
  description,
  previewContent,
  icon,
  ctaText = 'Connect to unlock deeper insights',
  className = ''
}: LockedFeatureCardProps) {
  return (
    <div className={`bg-[#151b28] rounded-lg border border-[#1e2836] p-6 relative overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {icon && <div className="text-[#00D4FF]">{icon}</div>}
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        <div className="p-2 bg-[#0A0E27] rounded-lg border border-[#1e2836]">
          <Lock className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Preview content (blurred) */}
      {previewContent && (
        <div className="relative mb-4 flex-1">
          <div className="blur-sm opacity-50 pointer-events-none select-none">
            {previewContent}
          </div>
        </div>
      )}

      {/* CTA Button */}
      <button className="w-full py-3 px-4 rounded-lg transition-all group relative overflow-hidden border border-purple-500/30 hover:border-purple-500/50 z-10 mt-auto">
        <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded blur-sm group-hover:blur-md transition-all"></span>
        <span className="relative flex items-center justify-center gap-2">
          <Lock className="w-4 h-4 text-purple-400" />
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold tracking-wide">
            {ctaText}
          </span>
        </span>
      </button>

      {/* Gradient overlay for locked effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E27]/80 via-transparent to-transparent pointer-events-none" />
    </div>
  )
}
