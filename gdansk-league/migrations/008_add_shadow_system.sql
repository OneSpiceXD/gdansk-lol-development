-- Migration 008: Add Shadow Player System
-- Adds shadow player matching functionality for learning from higher-ranked players

-- Add shadow-related columns to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS main_role TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_shadow_eligible BOOLEAN DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS shadow_tier TEXT; -- 'EMERALD_PLUS', 'MASTER_PLUS'

-- Create index on main_role for faster queries
CREATE INDEX IF NOT EXISTS idx_players_main_role ON players(main_role);
CREATE INDEX IF NOT EXISTS idx_players_shadow_eligible ON players(is_shadow_eligible, shadow_tier);

-- Create shadow_recommendations table
CREATE TABLE IF NOT EXISTS shadow_recommendations (
  id SERIAL PRIMARY KEY,
  user_puuid TEXT NOT NULL,
  shadow_puuid TEXT NOT NULL,
  role TEXT NOT NULL,
  similarity_score FLOAT NOT NULL,
  shared_champions TEXT[], -- Array of champion names
  user_weakness TEXT, -- 'high_early_deaths', 'low_vision', 'poor_cs', etc.
  shadow_strength TEXT, -- What shadow excels at
  reasoning JSONB, -- Detailed explanation and comparison data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_puuid, shadow_puuid)
);

-- Create indexes for shadow_recommendations
CREATE INDEX IF NOT EXISTS idx_shadow_recommendations_user ON shadow_recommendations(user_puuid);
CREATE INDEX IF NOT EXISTS idx_shadow_recommendations_score ON shadow_recommendations(user_puuid, similarity_score DESC);
CREATE INDEX IF NOT EXISTS idx_shadow_recommendations_created ON shadow_recommendations(created_at);

-- Add comments for documentation
COMMENT ON TABLE shadow_recommendations IS 'Stores matched shadow players for users to learn from';
COMMENT ON COLUMN shadow_recommendations.user_weakness IS 'Primary weakness identified: high_early_deaths, low_vision, poor_cs, low_damage, poor_positioning';
COMMENT ON COLUMN shadow_recommendations.shadow_strength IS 'What the shadow player excels at that addresses the user weakness';
COMMENT ON COLUMN shadow_recommendations.reasoning IS 'JSONB containing: comparison text, shared champions list, champion overlap ratio, detailed stats';
