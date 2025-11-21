-- Fix RLS policies for player_champion_stats table
-- Allow INSERT and UPDATE operations (needed for scripts to populate data)

-- Drop existing policy
DROP POLICY IF EXISTS "Allow public read access to player_champion_stats" ON player_champion_stats;

-- Create policies for all operations
CREATE POLICY "Allow public read access to player_champion_stats"
  ON player_champion_stats
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to player_champion_stats"
  ON player_champion_stats
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to player_champion_stats"
  ON player_champion_stats
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE player_champion_stats IS 'Tracks player champion statistics by season. RLS allows public read/write access for data collection scripts.';
