-- Gdansk LoL Project - Supabase Database Schema
-- PostgreSQL schema for player data and leaderboard

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  summoner_name TEXT UNIQUE NOT NULL,
  puuid TEXT UNIQUE NOT NULL,
  summoner_id TEXT NOT NULL,
  summoner_level INTEGER DEFAULT 0,

  -- Ranked stats
  tier TEXT DEFAULT 'UNRANKED',
  rank TEXT DEFAULT '',
  lp INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  winrate DECIMAL(5,2) DEFAULT 0.0,

  -- Profile claiming
  email TEXT,
  claimed BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_fetched_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rank_lp ON players(tier, lp DESC);
CREATE INDEX IF NOT EXISTS idx_summoner_name ON players(summoner_name);
CREATE INDEX IF NOT EXISTS idx_claimed ON players(claimed);
CREATE INDEX IF NOT EXISTS idx_updated_at ON players(updated_at);

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Match history table (for future AI insights)
CREATE TABLE IF NOT EXISTS match_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  match_id TEXT NOT NULL,

  -- Match basics
  game_duration INTEGER,
  game_mode TEXT,
  game_version TEXT,

  -- Player performance
  champion_name TEXT,
  kills INTEGER DEFAULT 0,
  deaths INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  gold_earned INTEGER DEFAULT 0,
  cs INTEGER DEFAULT 0,
  damage_dealt INTEGER DEFAULT 0,
  damage_taken INTEGER DEFAULT 0,
  vision_score INTEGER DEFAULT 0,

  -- Match result
  win BOOLEAN,

  -- Metadata
  game_ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(player_id, match_id)
);

CREATE INDEX IF NOT EXISTS idx_match_player ON match_history(player_id);
CREATE INDEX IF NOT EXISTS idx_match_date ON match_history(game_ended_at DESC);

-- Email capture table (for email collection campaign)
CREATE TABLE IF NOT EXISTS email_signups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_created ON email_signups(created_at DESC);

-- Comments
COMMENT ON TABLE players IS 'Main player profiles with ranked stats';
COMMENT ON TABLE match_history IS 'Match history for AI insights (death heatmaps, timing analysis)';
COMMENT ON TABLE email_signups IS 'Email addresses collected from landing page';

-- Row Level Security (RLS) Policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_signups ENABLE ROW LEVEL SECURITY;

-- Allow public read access to players
CREATE POLICY "Public players are viewable by everyone"
ON players FOR SELECT
USING (true);

-- Allow public read access to match history
CREATE POLICY "Public match history is viewable by everyone"
ON match_history FOR SELECT
USING (true);

-- Email signups: only insert allowed
CREATE POLICY "Anyone can insert email signups"
ON email_signups FOR INSERT
WITH CHECK (true);

-- View for leaderboard (top players by LP)
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  id,
  summoner_name,
  tier,
  rank,
  lp,
  wins,
  losses,
  winrate,
  summoner_level,
  claimed,
  verified,
  ROW_NUMBER() OVER (ORDER BY
    CASE tier
      WHEN 'CHALLENGER' THEN 9
      WHEN 'GRANDMASTER' THEN 8
      WHEN 'MASTER' THEN 7
      WHEN 'DIAMOND' THEN 6
      WHEN 'EMERALD' THEN 5
      WHEN 'PLATINUM' THEN 4
      WHEN 'GOLD' THEN 3
      WHEN 'SILVER' THEN 2
      WHEN 'BRONZE' THEN 1
      WHEN 'IRON' THEN 0
      ELSE -1
    END DESC,
    lp DESC
  ) as rank_position
FROM players
WHERE tier != 'UNRANKED'
ORDER BY rank_position;

COMMENT ON VIEW leaderboard IS 'Pre-computed leaderboard rankings for fast queries';
