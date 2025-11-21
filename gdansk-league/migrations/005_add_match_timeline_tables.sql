-- Migration: Add match timeline tables for X-Ray features
-- Created: 2025-01-16
-- Purpose: Store match events (kills, deaths, objectives) and timeline snapshots for advanced analytics

-- ============================================================================
-- Table: match_events
-- Purpose: Stores individual game events (kills, deaths, objectives, etc.)
-- Use cases: Death heatmap, kill patterns, objective control analysis
-- ============================================================================

CREATE TABLE IF NOT EXISTS match_events (
  id BIGSERIAL PRIMARY KEY,
  match_id TEXT NOT NULL,
  timestamp_ms INTEGER NOT NULL, -- Milliseconds from game start
  event_type TEXT NOT NULL, -- 'CHAMPION_KILL', 'BUILDING_KILL', 'ELITE_MONSTER_KILL', etc.

  -- Participant references (1-10, matches Riot API participant IDs)
  participant_id INTEGER, -- The main participant involved (e.g., killer, builder destroyer)
  killer_id INTEGER, -- For CHAMPION_KILL events
  victim_id INTEGER, -- For CHAMPION_KILL events
  assisting_participant_ids INTEGER[], -- Array of participant IDs who assisted

  -- Position data (Summoner's Rift coordinates)
  position_x INTEGER, -- X coordinate (0-14870)
  position_y INTEGER, -- Y coordinate (0-14980)

  -- Full event data from Riot API (for additional details)
  event_data JSONB,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_timestamp CHECK (timestamp_ms >= 0),
  CONSTRAINT valid_position_x CHECK (position_x IS NULL OR (position_x >= 0 AND position_x <= 15000)),
  CONSTRAINT valid_position_y CHECK (position_y IS NULL OR (position_y >= 0 AND position_y <= 15000))
);

-- Indexes for performance
CREATE INDEX idx_match_events_match_id ON match_events(match_id);
CREATE INDEX idx_match_events_participant ON match_events(participant_id);
CREATE INDEX idx_match_events_victim ON match_events(victim_id);
CREATE INDEX idx_match_events_type ON match_events(event_type);
CREATE INDEX idx_match_events_timestamp ON match_events(match_id, timestamp_ms);
CREATE INDEX idx_match_events_position ON match_events(position_x, position_y) WHERE position_x IS NOT NULL;

-- Composite index for common queries (e.g., "get all deaths for a player in a match")
CREATE INDEX idx_match_events_victim_type ON match_events(victim_id, event_type, match_id);

COMMENT ON TABLE match_events IS 'Stores individual game events with position data for analytics and heatmaps';
COMMENT ON COLUMN match_events.timestamp_ms IS 'Milliseconds elapsed since game start';
COMMENT ON COLUMN match_events.event_type IS 'Event type from Riot API: CHAMPION_KILL, BUILDING_KILL, ELITE_MONSTER_KILL, etc.';
COMMENT ON COLUMN match_events.position_x IS 'X coordinate on Summoner''s Rift (0-14870)';
COMMENT ON COLUMN match_events.position_y IS 'Y coordinate on Summoner''s Rift (0-14980)';
COMMENT ON COLUMN match_events.event_data IS 'Full event JSON from Riot API for additional details';


-- ============================================================================
-- Table: match_timeline_snapshots
-- Purpose: Stores periodic snapshots of player state at regular intervals
-- Use cases: Movement patterns, farming efficiency, jungle pathing, gold leads
-- ============================================================================

CREATE TABLE IF NOT EXISTS match_timeline_snapshots (
  id BIGSERIAL PRIMARY KEY,
  match_id TEXT NOT NULL,
  participant_id INTEGER NOT NULL, -- 1-10, matches Riot API participant IDs
  timestamp_ms INTEGER NOT NULL, -- Milliseconds from game start (usually 60000, 120000, 180000, etc.)

  -- Position data
  position_x INTEGER NOT NULL, -- X coordinate on map
  position_y INTEGER NOT NULL, -- Y coordinate on map

  -- Player state at this timestamp
  level INTEGER,
  total_gold INTEGER, -- Total gold earned
  current_gold INTEGER, -- Gold in inventory
  xp INTEGER, -- Experience points

  -- Farm stats
  minions_killed INTEGER, -- Total minion kills
  jungle_minions_killed INTEGER, -- Total jungle minion kills

  -- Champion stats snapshot (health, armor, ability power, etc.)
  stats JSONB,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_participant CHECK (participant_id >= 1 AND participant_id <= 10),
  CONSTRAINT valid_snapshot_timestamp CHECK (timestamp_ms >= 0),
  CONSTRAINT valid_snapshot_position_x CHECK (position_x >= 0 AND position_x <= 15000),
  CONSTRAINT valid_snapshot_position_y CHECK (position_y >= 0 AND position_y <= 15000),
  CONSTRAINT valid_level CHECK (level IS NULL OR (level >= 1 AND level <= 18))
);

-- Indexes for performance
CREATE INDEX idx_timeline_snapshots_match_id ON match_timeline_snapshots(match_id);
CREATE INDEX idx_timeline_snapshots_participant ON match_timeline_snapshots(participant_id);
CREATE INDEX idx_timeline_snapshots_timestamp ON match_timeline_snapshots(match_id, timestamp_ms);

-- Composite index for common queries (e.g., "get all snapshots for a player in a match")
CREATE INDEX idx_timeline_snapshots_match_participant ON match_timeline_snapshots(match_id, participant_id, timestamp_ms);

-- Index for position-based queries
CREATE INDEX idx_timeline_snapshots_position ON match_timeline_snapshots(position_x, position_y);

COMMENT ON TABLE match_timeline_snapshots IS 'Stores periodic snapshots of player positions and stats for movement and farming analysis';
COMMENT ON COLUMN match_timeline_snapshots.timestamp_ms IS 'Milliseconds from game start, typically at 60-second intervals';
COMMENT ON COLUMN match_timeline_snapshots.stats IS 'JSONB containing champion stats: health, armor, ability_power, attack_damage, etc.';


-- ============================================================================
-- Row-Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_timeline_snapshots ENABLE ROW LEVEL SECURITY;

-- Public read access for both tables
CREATE POLICY "Allow public read access to match events"
  ON match_events FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to timeline snapshots"
  ON match_timeline_snapshots FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (backend scripts only)
CREATE POLICY "Only service role can modify match events"
  ON match_events FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Only service role can modify timeline snapshots"
  ON match_timeline_snapshots FOR ALL
  USING (auth.role() = 'service_role');
