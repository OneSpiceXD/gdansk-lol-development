# Setup Instructions: Blue/Red Side Filter

## Overview
Adding blue side (Team 100) and red side (Team 200) filtering to the X-Ray death heatmap feature.

## Status
✅ Code changes complete
❌ Database migration pending (manual step required)
❌ Data repopulation pending

## Step 1: Run Database Migration

The `team_id` column needs to be added to both tables before the feature will work.

### Option A: Supabase SQL Editor (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to: **SQL Editor** > **New Query**
3. Copy and paste this SQL:

```sql
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
```

4. Click **Run**

### Option B: Direct Database Access

If you have psycopg2 and a DATABASE_URL:

```bash
cd gdansk-league/scripts
python run_migration_011.py
```

## Step 2: Repopulate Match Data

Once the migration is complete, repopulate the match data to include team_id:

```bash
cd gdansk-league/scripts
python clean_match_data.py  # Already completed
python repopulate_ranked_data.py
```

**Note**: This will fetch 100 ranked solo/duo matches and may take 2-3 minutes due to API rate limiting (1.2s delay between requests).

## Step 3: Test the Feature

1. Go to: `http://localhost:3000/player/petRoXD/x-ray`
2. Test the side filter buttons:
   - **Both sides** (default)
   - **Blue side** (Team 100 only)
   - **Red side** (Team 200 only)
3. Verify the radial gradient heatmap is rendering correctly
4. Test combined filters: e.g., "ADC on Blue side"

## What Changed

### 1. Database Schema
- Added `team_id INTEGER` to `match_stats` table
- Added `team_id INTEGER` to `match_analytics_summary` table
- Added indexes for performance

### 2. Data Collection (`repopulate_ranked_data.py`)
- Now captures `participant.teamId` from Riot API
- Stores team_id (100=Blue, 200=Red) in both tables

### 3. API Route (`/api/player/[summoner_name]/x-ray-data/route.ts`)
- Added `side` query parameter
- Filters matches by `team_id` based on side selection

### 4. Frontend (`page.tsx`)
- Added side filter state
- Added blue/red/both side buttons
- Connected to API with side parameter

### 5. Heatmap Visualization (`DeathHeatmap.tsx`)
- Changed from grid squares to radial gradients
- Overlapping red circles create heat effect
- 40px radius, rgba(239, 68, 68) with varying opacity

## Troubleshooting

### "Could not find the 'team_id' column"
**Solution**: Run the migration SQL in Supabase SQL Editor (Step 1)

### "No X-Ray data available"
**Solution**: Run `python repopulate_ranked_data.py` after migration

### "Failed to get match data: 429"
**Solution**: Riot API rate limit hit. Script already has 1.2s delays, just wait for it to complete. Some matches may be skipped due to rate limits, but you'll get most of them.

## Files Modified

- `gdansk-league/migrations/011_add_team_side_to_tables.sql` (new)
- `gdansk-league/scripts/repopulate_ranked_data.py` (modified)
- `gdansk-league/app/api/player/[summoner_name]/x-ray-data/route.ts` (modified)
- `gdansk-league/app/player/[summoner_name]/x-ray/page.tsx` (modified)
- `gdansk-league/app/player/[summoner_name]/x-ray/components/DeathHeatmap.tsx` (modified)

## Next Steps After Setup

Once the migration and repopulation are complete:

1. Verify blue/red side filtering works
2. Check that role + side combined filters work
3. Confirm radial gradient heatmap looks good
4. Consider adding similar filters to kills/objectives tabs
