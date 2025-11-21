-- Migration: Add split columns to match_stats
-- Created: 2025-11-16
-- Purpose: Track which seasonal split the match belongs to

ALTER TABLE match_stats
ADD COLUMN IF NOT EXISTS split_number INTEGER,
ADD COLUMN IF NOT EXISTS split_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS patch VARCHAR(20);

-- Add indexes for split queries
CREATE INDEX IF NOT EXISTS idx_match_stats_split_number ON match_stats(split_number);
CREATE INDEX IF NOT EXISTS idx_match_stats_season_split ON match_stats(season, split_number);
CREATE INDEX IF NOT EXISTS idx_match_stats_patch ON match_stats(patch);

-- Add comments
COMMENT ON COLUMN match_stats.split_number IS 'Split number within the season (1, 2, or 3)';
COMMENT ON COLUMN match_stats.split_name IS 'Name of the split (e.g., "Welcome to Noxus", "Spirit Blossom Beyond", "Trials of Twilight")';
COMMENT ON COLUMN match_stats.patch IS 'Game patch version (e.g., "15.22")';
