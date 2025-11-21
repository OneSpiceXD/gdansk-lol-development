# Database Schema Design for Ranked Game Statistics

## Overview

This schema is designed to efficiently store and query ranked League of Legends match data for player statistics tracking. Focus is on **ranked Solo/Duo games only** (queue 420).

## Data Source: Riot API Analysis

Based on real API responses, the Riot Match-V5 API provides:
- **145 player fields** per match participant
- **127 challenge metrics** (advanced stats)
- **18 timeline event types** (kills, objectives, items, etc.)
- **Match metadata** (duration, outcome, timestamps)

## Recommended Schema

### 1. **players** Table
Primary player tracking table.

```sql
CREATE TABLE players (
  -- Identity (Primary Key)
  puuid TEXT PRIMARY KEY,

  -- Riot ID (current)
  game_name TEXT NOT NULL,
  tag_line TEXT NOT NULL,

  -- Summoner Info
  summoner_level INTEGER,
  profile_icon_id INTEGER,

  -- Ranked Stats (current season snapshot)
  tier TEXT,  -- IRON, BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, MASTER, GRANDMASTER, CHALLENGER
  rank TEXT,  -- I, II, III, IV (or NULL for Master+)
  league_points INTEGER,
  wins INTEGER,
  losses INTEGER,

  -- Tracking
  is_claimed BOOLEAN DEFAULT FALSE,  -- User has claimed this profile
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  CONSTRAINT unique_riot_id UNIQUE(game_name, tag_line)
);

CREATE INDEX idx_players_claimed ON players(is_claimed);
CREATE INDEX idx_players_updated ON players(last_updated);
CREATE INDEX idx_players_tier_rank ON players(tier, rank, league_points);
```

### 2. **matches** Table
Core match data (ranked games only).

```sql
CREATE TABLE matches (
  -- Identity
  match_id TEXT PRIMARY KEY,  -- e.g., "EUW1_7590372232"

  -- Match Info
  game_creation BIGINT NOT NULL,  -- Unix timestamp (ms)
  game_duration INTEGER NOT NULL,  -- Seconds
  game_version TEXT,
  queue_id INTEGER DEFAULT 420,  -- Ranked Solo/Duo

  -- Outcome
  winning_team_id INTEGER,  -- 100 or 200
  ended_in_surrender BOOLEAN,
  ended_in_early_surrender BOOLEAN,

  -- Tracking
  fetched_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_matches_creation ON matches(game_creation DESC);
```

### 3. **match_participants** Table
Player performance in each match (145+ fields available, storing most useful).

```sql
CREATE TABLE match_participants (
  -- Composite Primary Key
  match_id TEXT NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
  puuid TEXT NOT NULL REFERENCES players(puuid) ON DELETE CASCADE,

  -- Match Context
  team_id INTEGER NOT NULL,  -- 100 (blue) or 200 (red)
  team_position TEXT,  -- TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY
  win BOOLEAN NOT NULL,

  -- Champion
  champion_id INTEGER NOT NULL,
  champion_name TEXT NOT NULL,

  -- Core Performance (KDA)
  kills INTEGER NOT NULL,
  deaths INTEGER NOT NULL,
  assists INTEGER NOT NULL,

  -- Economy
  gold_earned INTEGER,
  gold_spent INTEGER,
  total_minions_killed INTEGER,  -- CS (lane minions)
  neutral_minions_killed INTEGER,  -- Jungle camps

  -- Experience
  champ_level INTEGER,
  champ_experience INTEGER,

  -- Damage (Combat)
  total_damage_dealt_to_champions INTEGER,
  physical_damage_dealt_to_champions INTEGER,
  magic_damage_dealt_to_champions INTEGER,
  true_damage_dealt_to_champions INTEGER,
  total_damage_taken INTEGER,
  damage_self_mitigated INTEGER,

  -- Vision
  vision_score INTEGER,
  wards_placed INTEGER,
  wards_killed INTEGER,
  control_wards_placed INTEGER,  -- From challenges
  detector_wards_placed INTEGER,  -- Pink wards bought

  -- Objectives
  turret_kills INTEGER,
  inhibitor_kills INTEGER,
  baron_kills INTEGER,
  dragon_kills INTEGER,
  damage_dealt_to_objectives INTEGER,
  damage_dealt_to_turrets INTEGER,

  -- Utility
  time_ccing_others INTEGER,  -- Crowd control time (seconds)
  total_heal INTEGER,
  total_heals_on_teammates INTEGER,
  total_damage_shielded_on_teammates INTEGER,

  -- Kills/Deaths Detail
  double_kills INTEGER,
  triple_kills INTEGER,
  quadra_kills INTEGER,
  penta_kills INTEGER,
  first_blood_kill BOOLEAN,
  first_blood_assist BOOLEAN,
  largest_killing_spree INTEGER,
  largest_multi_kill INTEGER,

  -- Time
  time_played INTEGER,  -- Should match match.game_duration
  total_time_spent_dead INTEGER,
  longest_time_spent_living INTEGER,

  -- Items (end game)
  item0 INTEGER,
  item1 INTEGER,
  item2 INTEGER,
  item3 INTEGER,
  item4 INTEGER,
  item5 INTEGER,
  item6 INTEGER,  -- Trinket

  -- Summoner Spells
  summoner1_id INTEGER,
  summoner2_id INTEGER,
  summoner1_casts INTEGER,
  summoner2_casts INTEGER,

  -- Advanced Stats (from challenges)
  kda FLOAT,  -- (kills + assists) / deaths
  kill_participation FLOAT,  -- Percentage of team kills participated in
  gold_per_minute FLOAT,
  damage_per_minute FLOAT,
  vision_score_per_minute FLOAT,
  cs_per_minute FLOAT,  -- Calculated: (totalMinionsKilled) / (gameDuration / 60)

  -- Game Context
  game_ended_in_surrender BOOLEAN,
  game_ended_in_early_surrender BOOLEAN,

  PRIMARY KEY (match_id, puuid)
);

CREATE INDEX idx_match_participants_puuid ON match_participants(puuid);
CREATE INDEX idx_match_participants_champion ON match_participants(champion_id);
CREATE INDEX idx_match_participants_win ON match_participants(win);
CREATE INDEX idx_match_participants_position ON match_participants(team_position);
```

### 4. **ranked_history** Table (Optional)
Track ranked progression over time for claimed players.

```sql
CREATE TABLE ranked_history (
  id SERIAL PRIMARY KEY,
  puuid TEXT NOT NULL REFERENCES players(puuid) ON DELETE CASCADE,

  -- Snapshot at time of check
  tier TEXT NOT NULL,
  rank TEXT,
  league_points INTEGER NOT NULL,
  wins INTEGER NOT NULL,
  losses INTEGER NOT NULL,

  -- Timestamp
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ranked_history_puuid ON ranked_history(puuid, recorded_at DESC);
```

## Key Design Decisions

### 1. **Normalized vs Denormalized**
- **Normalized**: Separate `players` and `matches` tables to avoid duplication
- **Denormalized**: `match_participants` includes some match context (win, surrender) for query performance

### 2. **What We're NOT Storing (from 145 available fields)**
Excluded fields that add little value for statistics:
- Ping counts (allInPings, assistMePings, etc.) - 15 fields
- PlayerScore0-11 (missions, not useful) - 12 fields
- Augments (Arena mode only) - 6 fields
- Individual spell casts (spell1Casts, spell2Casts) - optionally stored
- Perks/Runes (complex nested object) - could add if needed
- Timeline events (CHAMPION_KILL details) - could add separate table if needed

### 3. **Storage Estimates**
For 100 players with 20 matches each:
- Players: ~10 KB
- Matches: ~2 KB (2,000 unique matches assuming overlap)
- Match Participants: ~2 MB (2,000 matches × 10 players × ~100 bytes)
- **Total: ~2.5 MB**

For 500 players: ~12.5 MB
For 1,000 players: ~25 MB

**Well within Supabase free tier (500 MB)**

### 4. **Indexes Strategy**
- Primary keys on all tables
- Foreign keys with CASCADE delete
- Indexes on frequently queried fields:
  - Player lookup by Riot ID
  - Match participant queries by player
  - Filtering by position, champion, win/loss
  - Time-based queries (last_updated, game_creation)

## Query Patterns

### Most Common Queries:

1. **Get player's recent matches**
```sql
SELECT m.*, mp.*
FROM match_participants mp
JOIN matches m ON mp.match_id = m.match_id
WHERE mp.puuid = $1
ORDER BY m.game_creation DESC
LIMIT 20;
```

2. **Calculate player's average stats**
```sql
SELECT
  AVG(kills) as avg_kills,
  AVG(deaths) as avg_deaths,
  AVG(assists) as avg_assists,
  AVG(kda) as avg_kda,
  AVG(gold_per_minute) as avg_gpm,
  AVG(damage_per_minute) as avg_dpm,
  AVG(vision_score_per_minute) as avg_vspm,
  COUNT(*) as games_played,
  SUM(CASE WHEN win THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as win_rate
FROM match_participants
WHERE puuid = $1
  AND team_position = $2  -- Optional: filter by position
```

3. **Champion statistics for a player**
```sql
SELECT
  champion_name,
  COUNT(*) as games_played,
  AVG(kda) as avg_kda,
  SUM(CASE WHEN win THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as win_rate
FROM match_participants
WHERE puuid = $1
GROUP BY champion_id, champion_name
ORDER BY games_played DESC;
```

4. **Leaderboard (claimed players only)**
```sql
SELECT
  p.game_name,
  p.tag_line,
  p.tier,
  p.rank,
  p.league_points,
  p.wins,
  p.losses
FROM players p
WHERE p.is_claimed = TRUE
ORDER BY
  CASE p.tier
    WHEN 'CHALLENGER' THEN 8
    WHEN 'GRANDMASTER' THEN 7
    WHEN 'MASTER' THEN 6
    WHEN 'DIAMOND' THEN 5
    WHEN 'PLATINUM' THEN 4
    WHEN 'GOLD' THEN 3
    WHEN 'SILVER' THEN 2
    WHEN 'BRONZE' THEN 1
    WHEN 'IRON' THEN 0
  END DESC,
  p.rank DESC,
  p.league_points DESC
LIMIT 50;
```

## Next Steps

1. Create Supabase project and run migrations
2. Set up Row Level Security (RLS) policies
3. Create API endpoints for data insertion
4. Build scheduled GitHub Actions worker to fetch match data
5. Implement frontend queries using Supabase client

## Data Flow

```
[Riot API]
    ↓
[GitHub Actions Worker - Daily]
    ↓ Fetch match history for each player
    ↓ Fetch match details for new matches
    ↓
[Supabase Database]
    ↓
[Next.js Frontend - ISR]
    ↓ Read via Supabase client
    ↓
[User Browser]
```
