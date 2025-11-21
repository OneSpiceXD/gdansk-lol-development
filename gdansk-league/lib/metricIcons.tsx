import {
  Star,
  TrendingUp,
  Clock,
  Eye,
  Swords,
  Crown,
  Target,
  Navigation,
  Gem,
  Crosshair,
  Link,
  Bolt,
  Sword,
  Heart,
  Building,
  Radar,
  Skull,
} from 'lucide-react'

// Map metric IDs to their corresponding lucide-react icon components
export const metricIconMap: { [key: string]: React.ComponentType<{ className?: string; size?: number }> } = {
  // Damage metrics
  'damage_per_minute': Star,
  'damage_share': TrendingUp,

  // Farm/CS metrics
  'cs_per_minute': Clock,

  // Vision metrics
  'vision_score': Eye,
  'vision_score_per_minute': Eye,

  // Team play metrics
  'kill_participation': Swords,
  'kda': Crown,

  // Objective metrics
  'objective_control': Target,
  'objective_damage': Target,

  // Movement/Roaming metrics
  'roaming_impact': Navigation,

  // Gold metrics
  'gold_efficiency': Gem,

  // Positioning metrics
  'positioning_score': Crosshair,

  // Crowd Control metrics
  'crowd_control_score': Link,

  // Early game metrics
  'early_game_impact': Bolt,
  'early_game_dominance': Bolt,

  // Solo kill metrics
  'solo_kills': Sword,

  // Durability metrics
  'durability_score': Heart,

  // Split push metrics
  'split_push_pressure': Building,

  // Jungle metrics
  'jungle_proximity': Radar,

  // Death metrics
  'death_efficiency': Skull,
}

// Get icon component for a metric ID
export const getMetricIcon = (metricId: string) => {
  return metricIconMap[metricId] || Star // Default fallback
}

// Check if a metric has an icon
export const hasMetricIcon = (metricId: string) => {
  return metricId in metricIconMap
}
