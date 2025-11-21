-- Migration: Add team_id to match_stats and match_analytics_summary
-- Created: 2025-01-16
-- Purpose: Enable filtering by blue side (100) vs red side (200)

-- Add team_id to match_stats
ALTER TABLE match_stats
ADD COLUMN IF NOT EXISTS team_id INTEGER;

-- Add team_id to match_analytics_summary
ALTER TABLE match_analytics_summary
ADD COLUMN IF NOT EXISTS team_id INTEGER;

-- Add indexes for team filtering
CREATE INDEX IF NOT EXISTS idx_match_stats_team ON match_stats(team_id);
CREATE INDEX IF NOT EXISTS idx_analytics_team ON match_analytics_summary(team_id);

-- Add comments
COMMENT ON COLUMN match_stats.team_id IS 'Team ID from Riot API (100 = Blue Side, 200 = Red Side)';
COMMENT ON COLUMN match_analytics_summary.team_id IS 'Team ID from Riot API (100 = Blue Side, 200 = Red Side)';

-- Note: Existing records will have NULL team_id until backfilled or new matches are fetched
