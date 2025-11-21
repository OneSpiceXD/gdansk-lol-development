-- Migration: Add role-specific metrics tables and columns
-- Created: 2025-11-14
-- Purpose: Store detailed match statistics for role-specific metric calculations

-- Table to store per-match statistics for each player
CREATE TABLE IF NOT EXISTS match_stats (
  id SERIAL PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  match_id VARCHAR(50) NOT NULL,

  -- Basic match info
  role VARCHAR(20) NOT NULL, -- TOP, JUNGLE, MID, ADC, SUPPORT
  champion_id INTEGER NOT NULL,
  game_duration INTEGER NOT NULL, -- seconds
  win BOOLEAN NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW(),

  -- Core stats
  kills INTEGER NOT NULL DEFAULT 0,
  deaths INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,

  -- Farm stats
  total_minions_killed INTEGER NOT NULL DEFAULT 0,
  neutral_minions_killed INTEGER NOT NULL DEFAULT 0,
  cs_per_minute DECIMAL(5,2),

  -- Damage stats
  total_damage_to_champions INTEGER NOT NULL DEFAULT 0,
  damage_per_minute DECIMAL(8,2),
  damage_share DECIMAL(5,4), -- team damage percentage (0-1)
  total_damage_taken INTEGER NOT NULL DEFAULT 0,
  damage_self_mitigated INTEGER NOT NULL DEFAULT 0,

  -- Gold stats
  gold_earned INTEGER NOT NULL DEFAULT 0,

  -- Vision stats
  vision_score INTEGER NOT NULL DEFAULT 0,
  vision_score_per_minute DECIMAL(5,2),
  wards_placed INTEGER NOT NULL DEFAULT 0,
  wards_killed INTEGER NOT NULL DEFAULT 0,
  control_wards_purchased INTEGER NOT NULL DEFAULT 0,

  -- Objective stats
  damage_to_turrets INTEGER NOT NULL DEFAULT 0,
  damage_to_objectives INTEGER NOT NULL DEFAULT 0,
  turret_plates_taken INTEGER NOT NULL DEFAULT 0,
  turrets_killed INTEGER NOT NULL DEFAULT 0,
  dragon_kills INTEGER NOT NULL DEFAULT 0,
  baron_kills INTEGER NOT NULL DEFAULT 0,
  rift_herald_kills INTEGER NOT NULL DEFAULT 0,

  -- Combat stats
  time_ccing_others INTEGER NOT NULL DEFAULT 0, -- seconds
  total_heal_on_teammates INTEGER NOT NULL DEFAULT 0,
  total_damage_shielded_on_teammates INTEGER NOT NULL DEFAULT 0,

  -- Challenge-based stats (from Riot API challenges)
  kill_participation DECIMAL(5,4), -- 0-1
  solo_kills INTEGER NOT NULL DEFAULT 0,
  takedowns_first_15_min INTEGER NOT NULL DEFAULT 0,
  save_ally_from_death INTEGER NOT NULL DEFAULT 0,

  -- Role-specific calculated metrics
  -- ADC metrics
  gold_efficiency DECIMAL(8,2), -- damage per gold
  positioning_score INTEGER, -- damage / deaths

  -- Support metrics
  death_efficiency DECIMAL(5,2), -- value per death

  -- Jungle metrics
  objective_control_score INTEGER, -- dragons + barons + heralds

  -- Top metrics
  early_game_dominance DECIMAL(5,2),
  durability_score INTEGER, -- damage absorbed per death
  split_push_pressure DECIMAL(8,2),

  -- Timeline-based metrics (NULL until calculated)
  roaming_impact INTEGER, -- successful roams
  jungle_proximity JSONB, -- {friendly: 0.3, enemy: 0.2, lanes: 0.4, river: 0.1}

  -- Constraints
  UNIQUE(player_id, match_id),
  CHECK(role IN ('TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT')),
  CHECK(game_duration > 0),
  CHECK(kills >= 0 AND deaths >= 0 AND assists >= 0)
);

-- Indexes for efficient querying
CREATE INDEX idx_match_stats_player_id ON match_stats(player_id);
CREATE INDEX idx_match_stats_role ON match_stats(role);
CREATE INDEX idx_match_stats_player_role ON match_stats(player_id, role);
CREATE INDEX idx_match_stats_recorded_at ON match_stats(recorded_at DESC);
CREATE INDEX idx_match_stats_player_recorded ON match_stats(player_id, recorded_at DESC);

-- Table to store aggregated percentile data for benchmarking
CREATE TABLE IF NOT EXISTS role_percentiles (
  id SERIAL PRIMARY KEY,
  role VARCHAR(20) NOT NULL,
  tier VARCHAR(20) NOT NULL, -- IRON, BRONZE, SILVER, etc.
  region VARCHAR(10) NOT NULL, -- POLISH, EUW, EUNE
  metric_name VARCHAR(50) NOT NULL,

  -- Percentile breakpoints
  p10 DECIMAL(10,2),
  p20 DECIMAL(10,2),
  p30 DECIMAL(10,2),
  p40 DECIMAL(10,2),
  p50 DECIMAL(10,2), -- median
  p60 DECIMAL(10,2),
  p70 DECIMAL(10,2),
  p80 DECIMAL(10,2),
  p90 DECIMAL(10,2),

  -- Sample stats
  sample_size INTEGER NOT NULL,
  mean_value DECIMAL(10,2),
  std_dev DECIMAL(10,2),

  last_updated TIMESTAMP DEFAULT NOW(),

  UNIQUE(role, tier, region, metric_name),
  CHECK(role IN ('TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT')),
  CHECK(region IN ('POLISH', 'EUW', 'EUNE'))
);

CREATE INDEX idx_percentiles_lookup ON role_percentiles(role, tier, region, metric_name);

-- Add role_metrics JSONB column to player_champion_stats for aggregated data
ALTER TABLE player_champion_stats
ADD COLUMN IF NOT EXISTS role_metrics JSONB;

-- Example role_metrics structure:
-- {
--   "damage_per_minute": {"value": 954.2, "percentile": 12, "polish_avg": 820.5, "euw_avg": 875.3},
--   "cs_per_minute": {"value": 7.2, "percentile": 35, "polish_avg": 6.8, "euw_avg": 7.0},
--   ...
-- }

-- Function to calculate percentile for a given value
CREATE OR REPLACE FUNCTION get_percentile_rank(
  p_role VARCHAR,
  p_tier VARCHAR,
  p_region VARCHAR,
  p_metric_name VARCHAR,
  p_value DECIMAL
) RETURNS INTEGER AS $$
DECLARE
  v_percentile INTEGER;
BEGIN
  -- Simple percentile calculation based on percentile breakpoints
  SELECT CASE
    WHEN p_value >= p90 THEN 10
    WHEN p_value >= p80 THEN 20
    WHEN p_value >= p70 THEN 30
    WHEN p_value >= p60 THEN 40
    WHEN p_value >= p50 THEN 50
    WHEN p_value >= p40 THEN 60
    WHEN p_value >= p30 THEN 70
    WHEN p_value >= p20 THEN 80
    WHEN p_value >= p10 THEN 90
    ELSE 95
  END INTO v_percentile
  FROM role_percentiles
  WHERE role = p_role
    AND tier = p_tier
    AND region = p_region
    AND metric_name = p_metric_name;

  RETURN COALESCE(v_percentile, 50); -- Default to 50th percentile if no data
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE match_stats IS 'Stores detailed per-match statistics for role-specific metric calculations';
COMMENT ON TABLE role_percentiles IS 'Stores percentile breakpoints for benchmarking metrics across roles, tiers, and regions';
COMMENT ON COLUMN match_stats.jungle_proximity IS 'JSON object storing % time in jungle zones: {friendly, enemy, lanes, river}';
COMMENT ON COLUMN match_stats.roaming_impact IS 'Number of successful roams (kills/assists outside primary lane)';
COMMENT ON COLUMN player_champion_stats.role_metrics IS 'Aggregated role-specific metrics with percentiles and benchmarks';
