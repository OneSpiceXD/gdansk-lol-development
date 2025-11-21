-- Migration: Add queue_id to match_analytics_summary
-- Created: 2025-01-16
-- Purpose: Enable filtering by game mode (ranked solo/duo, ARAM, etc.)

ALTER TABLE match_analytics_summary
ADD COLUMN IF NOT EXISTS queue_id INTEGER;

-- Add index for queue filtering
CREATE INDEX IF NOT EXISTS idx_analytics_queue ON match_analytics_summary(queue_id);

-- Add comment
COMMENT ON COLUMN match_analytics_summary.queue_id IS 'Queue ID from Riot API (420 = Ranked Solo/Duo, 440 = Ranked Flex, 450 = ARAM, etc.)';

-- Update existing records to default to 420 (Ranked Solo/Duo) since that's what we've been collecting
UPDATE match_analytics_summary
SET queue_id = 420
WHERE queue_id IS NULL;
