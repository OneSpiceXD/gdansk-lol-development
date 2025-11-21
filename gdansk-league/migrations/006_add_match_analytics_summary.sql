-- Migration: Replace raw timeline tables with aggregated analytics summary
-- Created: 2025-01-16
-- Purpose: Reduce storage by 98% while preserving all data needed for X-Ray features

-- ============================================================================
-- Drop old tables (raw timeline data)
-- ============================================================================

DROP TABLE IF EXISTS match_events CASCADE;
DROP TABLE IF EXISTS match_timeline_snapshots CASCADE;

-- ============================================================================
-- Table: match_analytics_summary
-- Purpose: Store aggregated match analytics per player (one row per match)
-- Storage: ~1.4 KB per player per match (vs ~400 KB with raw timeline)
-- ============================================================================

CREATE TABLE match_analytics_summary (
  id BIGSERIAL PRIMARY KEY,
  match_id TEXT NOT NULL,
  player_puuid TEXT NOT NULL,
  participant_id INTEGER NOT NULL, -- 1-10, player's participant ID in this match

  -- Death events (player as victim)
  deaths JSONB, -- [{x, y, timestamp, killer_champion, assisting_champions: []}]

  -- Kill events (player as killer)
  kills JSONB, -- [{x, y, timestamp, victim_champion, assisting_champions: []}]

  -- Assist events (player assisted)
  assists JSONB, -- [{x, y, timestamp, killer_champion, victim_champion}]

  -- Elite monster kills (dragons, baron, rift herald)
  elite_monster_kills JSONB, -- [{type: 'dragon/baron/herald', subtype: 'fire/cloud/etc', x, y, timestamp}]

  -- Building kills (towers, inhibitors, nexus)
  building_kills JSONB, -- [{type: 'tower/inhibitor', lane: 'top/mid/bot', x, y, timestamp}]

  -- Position timeline (sampled every 5 minutes: 0, 5, 10, 15, 20, 25, 30, 35+)
  position_timeline JSONB, -- [{timestamp, x, y, level, total_gold, current_gold, cs, jungle_cs}]

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_player_match UNIQUE (match_id, player_puuid),
  CONSTRAINT valid_participant CHECK (participant_id >= 1 AND participant_id <= 10)
);

-- Indexes for performance
CREATE INDEX idx_analytics_summary_match_id ON match_analytics_summary(match_id);
CREATE INDEX idx_analytics_summary_player ON match_analytics_summary(player_puuid);
CREATE INDEX idx_analytics_summary_created_at ON match_analytics_summary(created_at);

-- Composite index for common queries
CREATE INDEX idx_analytics_summary_player_recent ON match_analytics_summary(player_puuid, created_at DESC);

-- Comments
COMMENT ON TABLE match_analytics_summary IS 'Aggregated match analytics per player - one row per match with all events and position samples';
COMMENT ON COLUMN match_analytics_summary.deaths IS 'Array of death events with position, timestamp, and killer info';
COMMENT ON COLUMN match_analytics_summary.kills IS 'Array of kill events with position, timestamp, and victim info';
COMMENT ON COLUMN match_analytics_summary.assists IS 'Array of assist events with position and participant info';
COMMENT ON COLUMN match_analytics_summary.elite_monster_kills IS 'Dragons, Baron, Rift Herald kills by this player';
COMMENT ON COLUMN match_analytics_summary.building_kills IS 'Tower and inhibitor destructions by this player';
COMMENT ON COLUMN match_analytics_summary.position_timeline IS 'Position snapshots at 5-minute intervals with stats';

-- ============================================================================
-- Row-Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE match_analytics_summary ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access to match analytics"
  ON match_analytics_summary FOR SELECT
  USING (true);

-- Only service role can insert/update/delete
CREATE POLICY "Only service role can modify match analytics"
  ON match_analytics_summary FOR ALL
  USING (auth.role() = 'service_role');
