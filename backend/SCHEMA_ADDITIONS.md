# Database Schema Additions - Runes & Timeline Tracking

## Additional Tables for Enhanced Player Analysis

### 1. **match_participant_runes** Table
Track rune choices for each player in each match.

```sql
CREATE TABLE match_participant_runes (
  -- Composite Primary Key
  match_id TEXT NOT NULL,
  puuid TEXT NOT NULL,

  -- Primary Rune Tree
  primary_style INTEGER NOT NULL,  -- e.g., 8400 = Resolve, 8200 = Sorcery
  primary_perk_1 INTEGER NOT NULL, -- Keystone
  primary_perk_2 INTEGER NOT NULL,
  primary_perk_3 INTEGER NOT NULL,
  primary_perk_4 INTEGER NOT NULL,

  -- Secondary Rune Tree
  secondary_style INTEGER NOT NULL,
  secondary_perk_1 INTEGER NOT NULL,
  secondary_perk_2 INTEGER NOT NULL,

  -- Stat Shards
  stat_offense INTEGER,  -- e.g., 5008 = Adaptive Force
  stat_flex INTEGER,     -- e.g., 5008 = Adaptive Force
  stat_defense INTEGER,  -- e.g., 5001 = Health Scaling

  PRIMARY KEY (match_id, puuid),
  FOREIGN KEY (match_id, puuid) REFERENCES match_participants(match_id, puuid) ON DELETE CASCADE
);

CREATE INDEX idx_runes_primary_style ON match_participant_runes(primary_style);
CREATE INDEX idx_runes_keystone ON match_participant_runes(primary_perk_1);
```

**Rune Style IDs (for reference):**
- 8000 = Precision
- 8100 = Domination
- 8200 = Sorcery
- 8300 = Inspiration
- 8400 = Resolve

**Usage Examples:**
```sql
-- Most popular keystone for a champion
SELECT primary_perk_1, COUNT(*) as times_picked
FROM match_participant_runes mpr
JOIN match_participants mp ON mpr.match_id = mp.match_id AND mpr.puuid = mp.puuid
WHERE mp.champion_id = 78  -- Poppy
GROUP BY primary_perk_1
ORDER BY times_picked DESC;

-- Player's rune diversity
SELECT
  primary_style,
  COUNT(DISTINCT primary_perk_1) as unique_keystones,
  COUNT(*) as games_played
FROM match_participant_runes
WHERE puuid = $1
GROUP BY primary_style;
```

---

### 2. **match_timeline_snapshots** Table
Track player progression throughout the match at key intervals.

```sql
CREATE TABLE match_timeline_snapshots (
  id SERIAL PRIMARY KEY,

  -- References
  match_id TEXT NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
  puuid TEXT NOT NULL REFERENCES players(puuid) ON DELETE CASCADE,
  participant_id INTEGER NOT NULL,  -- 1-10

  -- Timing
  timestamp_ms INTEGER NOT NULL,  -- Milliseconds since game start
  frame_interval INTEGER,  -- Usually 60000 (1 minute)

  -- Progression Stats at this point in time
  level INTEGER NOT NULL,
  current_gold INTEGER NOT NULL,
  total_gold INTEGER NOT NULL,
  xp INTEGER NOT NULL,
  minions_killed INTEGER NOT NULL,
  jungle_minions_killed INTEGER NOT NULL,

  -- Combat Stats (cumulative)
  total_damage_done_to_champions INTEGER,
  magic_damage_done_to_champions INTEGER,
  physical_damage_done_to_champions INTEGER,
  true_damage_done_to_champions INTEGER,
  total_damage_taken INTEGER,

  -- Position on map
  position_x INTEGER,
  position_y INTEGER,

  -- Champion Stats at this moment
  health INTEGER,
  health_max INTEGER,
  armor INTEGER,
  magic_resist INTEGER,
  attack_damage INTEGER,
  ability_power INTEGER,
  movement_speed INTEGER,

  -- Efficiency Metrics
  gold_per_second FLOAT,
  time_enemy_spent_controlled INTEGER,  -- CC dealt

  -- Indexes
  CONSTRAINT unique_timeline_snapshot UNIQUE(match_id, puuid, timestamp_ms)
);

CREATE INDEX idx_timeline_match_puuid ON match_timeline_snapshots(match_id, puuid, timestamp_ms);
CREATE INDEX idx_timeline_puuid ON match_timeline_snapshots(puuid);
```

**Snapshot Collection Strategy:**
- Store frames at: 5min, 10min, 15min, 20min, 25min, 30min, game end
- ~7 snapshots per player per game
- For 100 players × 20 games × 7 snapshots = 14,000 rows (~1.4 MB)

---

### 3. **match_events** Table (Optional - For Deep Analysis)
Track critical game events for replay analysis.

```sql
CREATE TABLE match_events (
  id SERIAL PRIMARY KEY,

  match_id TEXT NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
  timestamp_ms INTEGER NOT NULL,
  event_type TEXT NOT NULL,  -- CHAMPION_KILL, BUILDING_KILL, ELITE_MONSTER_KILL, etc.

  -- Participants involved
  killer_puuid TEXT REFERENCES players(puuid),
  victim_puuid TEXT REFERENCES players(puuid),
  assisting_puuids TEXT[],  -- Array of PUUIDs

  -- Event details (JSON for flexibility)
  event_data JSONB,

  -- Position
  position_x INTEGER,
  position_y INTEGER
);

CREATE INDEX idx_events_match ON match_events(match_id, timestamp_ms);
CREATE INDEX idx_events_killer ON match_events(killer_puuid);
CREATE INDEX idx_events_victim ON match_events(victim_puuid);
CREATE INDEX idx_events_type ON match_events(event_type);
```

**Storage consideration:**
- Storing all events is expensive (~200-500 events per match)
- Recommend storing only CHAMPION_KILL, ELITE_MONSTER_KILL, BUILDING_KILL
- For 100 players × 20 games: ~1 MB

---

## Updated Storage Estimates

With runes and timeline tracking:

| Scale | Without Timeline | With Timeline (7 snapshots) | With Timeline + Events |
|-------|-----------------|----------------------------|------------------------|
| **100 players** | 2.5 MB | 4 MB | 5 MB |
| **500 players** | 12.5 MB | 20 MB | 25 MB |
| **1,000 players** | 25 MB | 40 MB | 50 MB |

**Still well within Supabase free tier (500 MB)**

---

## Analysis Capabilities with Timeline Data

### 1. **Identify Time Wasting**
```sql
-- Compare player's CS at 10 minutes vs average
WITH player_cs_10min AS (
  SELECT
    puuid,
    match_id,
    minions_killed + jungle_minions_killed as cs
  FROM match_timeline_snapshots
  WHERE timestamp_ms = 600000  -- 10 minutes
    AND puuid = $1
),
average_cs_10min AS (
  SELECT
    AVG(minions_killed + jungle_minions_killed) as avg_cs
  FROM match_timeline_snapshots mts
  JOIN match_participants mp ON mts.match_id = mp.match_id AND mts.puuid = mp.puuid
  WHERE timestamp_ms = 600000
    AND mp.team_position = $2  -- Same role
)
SELECT
  p.match_id,
  p.cs,
  a.avg_cs,
  p.cs - a.avg_cs as cs_diff,
  CASE
    WHEN p.cs < a.avg_cs * 0.8 THEN 'Poor farming'
    WHEN p.cs > a.avg_cs * 1.2 THEN 'Excellent farming'
    ELSE 'Average'
  END as efficiency
FROM player_cs_10min p, average_cs_10min a;
```

### 2. **Track Gold/XP Lead Over Time**
```sql
-- Visualize gold progression vs opponent
SELECT
  mts.timestamp_ms / 60000 as minute,
  mts.total_gold as player_gold,
  opp.total_gold as opponent_gold,
  mts.total_gold - opp.total_gold as gold_diff
FROM match_timeline_snapshots mts
JOIN match_participants mp ON mts.match_id = mp.match_id AND mts.puuid = mp.puuid
LEFT JOIN match_timeline_snapshots opp
  ON mts.match_id = opp.match_id
  AND mts.timestamp_ms = opp.timestamp_ms
  AND opp.puuid = (
    -- Get opponent in same position
    SELECT puuid FROM match_participants
    WHERE match_id = mts.match_id
      AND team_position = mp.team_position
      AND team_id != mp.team_id
  )
WHERE mts.puuid = $1 AND mts.match_id = $2
ORDER BY mts.timestamp_ms;
```

### 3. **Early Game vs Late Game Performance**
```sql
-- Compare early (0-15min) vs late game (20min+) damage output
SELECT
  puuid,
  AVG(CASE
    WHEN timestamp_ms <= 900000
    THEN total_damage_done_to_champions
  END) as avg_damage_early,
  AVG(CASE
    WHEN timestamp_ms >= 1200000
    THEN total_damage_done_to_champions
  END) as avg_damage_late
FROM match_timeline_snapshots
WHERE puuid = $1
GROUP BY puuid;
```

### 4. **Rune Performance Analysis**
```sql
-- Find best performing rune setup for a champion
SELECT
  mpr.primary_style,
  mpr.primary_perk_1 as keystone,
  COUNT(*) as games_played,
  AVG(mp.kda) as avg_kda,
  SUM(CASE WHEN mp.win THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as win_rate
FROM match_participant_runes mpr
JOIN match_participants mp
  ON mpr.match_id = mp.match_id AND mpr.puuid = mp.puuid
WHERE mp.champion_id = $1
GROUP BY mpr.primary_style, mpr.primary_perk_1
HAVING COUNT(*) >= 5  -- Minimum sample size
ORDER BY win_rate DESC, avg_kda DESC;
```

---

## Data Collection Strategy

### Full Collection (Claimed Players)
For players who have claimed their profile:
- Store ALL timeline snapshots (every minute)
- Store ALL events (kills, objectives, etc.)
- Store runes for every match

### Lite Collection (Unclaimed Players)
For unclaimed players in the database:
- Store only 3 key snapshots: 10min, 20min, game end
- Store runes (minimal storage cost)
- Skip detailed events

This keeps storage efficient while maintaining rich data for engaged users.

---

## Frontend Visualization Examples

With this timeline data, you can create:

1. **Gold/XP Charts** - Line chart showing progression vs opponent
2. **CS Timeline** - Track farming efficiency minute-by-minute
3. **Damage Output Timeline** - See when player is active vs passive
4. **Heatmaps** - Player position throughout the game
5. **Critical Moments** - Highlight kills, deaths, objectives with event markers
6. **Rune Comparison** - Show win rates for different rune setups per champion

---

## Recommendation

**For MVP (100 players):**
1. ✅ Add `match_participant_runes` table (essential, low storage)
2. ✅ Add `match_timeline_snapshots` table with 7 snapshots per game (valuable for progression tracking)
3. ❌ Skip `match_events` table initially (can add later if needed)

This gives you:
- Rune tracking for strategy analysis
- Timeline progression to identify time wasting
- ~4 MB total for 100 players
- All within free tier with room to scale

**Total storage: 2.5 MB (base) + 1.5 MB (runes + timeline) = 4 MB for 100 players**
