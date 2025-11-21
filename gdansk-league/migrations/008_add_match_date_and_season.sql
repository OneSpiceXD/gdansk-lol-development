-- Migration: Add match_date and season columns to match_stats
-- Created: 2025-11-16
-- Purpose: Track when matches were played and what season they belong to

ALTER TABLE match_stats
ADD COLUMN IF NOT EXISTS match_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS season INTEGER;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_match_stats_match_date ON match_stats(match_date DESC);
CREATE INDEX IF NOT EXISTS idx_match_stats_season ON match_stats(season);
CREATE INDEX IF NOT EXISTS idx_match_stats_player_season ON match_stats(player_id, season);

-- Add comments
COMMENT ON COLUMN match_stats.match_date IS 'Timestamp when the match was played (from gameCreation)';
COMMENT ON COLUMN match_stats.season IS 'Season number (e.g., 15 for Season 2025)';
