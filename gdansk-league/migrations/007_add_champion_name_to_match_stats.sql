-- Migration: Add champion_name column to match_stats table
-- Created: 2025-01-16
-- Purpose: Store champion name alongside champion_id for easier querying

ALTER TABLE match_stats ADD COLUMN IF NOT EXISTS champion_name VARCHAR(50);

-- Add index for champion name lookups
CREATE INDEX IF NOT EXISTS idx_match_stats_champion_name ON match_stats(champion_name);

COMMENT ON COLUMN match_stats.champion_name IS 'Champion name (e.g., Ahri, LeeSin) for easier querying alongside champion_id';
