-- Migration: Create player_champion_stats table for seasonal champion tracking
-- Description: Track player champion statistics by season (games played, wins, losses, mastery)
-- Date: 2025-11-11

-- Create player_champion_stats table
CREATE TABLE IF NOT EXISTS player_champion_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  champion_id INTEGER NOT NULL REFERENCES champions(id) ON DELETE CASCADE,
  season VARCHAR(10) NOT NULL, -- Format: 'S3_2025', 'S1_2026', etc.
  games_played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  mastery_points INTEGER DEFAULT 0,
  last_played_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Ensure one entry per player/champion/season combination
  UNIQUE(player_id, champion_id, season)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_player_champion_stats_player_season
  ON player_champion_stats(player_id, season);

CREATE INDEX IF NOT EXISTS idx_player_champion_stats_season
  ON player_champion_stats(season);

CREATE INDEX IF NOT EXISTS idx_player_champion_stats_games_played
  ON player_champion_stats(games_played DESC);

CREATE INDEX IF NOT EXISTS idx_player_champion_stats_last_played
  ON player_champion_stats(last_played_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE player_champion_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to player_champion_stats"
  ON player_champion_stats
  FOR SELECT
  USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_player_champion_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER player_champion_stats_updated_at
  BEFORE UPDATE ON player_champion_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_player_champion_stats_updated_at();

-- Add comment for documentation
COMMENT ON TABLE player_champion_stats IS 'Tracks player champion statistics by season for seasonal rankings';
COMMENT ON COLUMN player_champion_stats.season IS 'Season identifier in format S{number}_{year}, e.g., S3_2025';
COMMENT ON COLUMN player_champion_stats.games_played IS 'Total ranked games played with this champion in this season';
COMMENT ON COLUMN player_champion_stats.wins IS 'Number of wins with this champion in this season';
COMMENT ON COLUMN player_champion_stats.losses IS 'Number of losses with this champion in this season';
COMMENT ON COLUMN player_champion_stats.mastery_points IS 'Total mastery points for this champion (all-time)';
