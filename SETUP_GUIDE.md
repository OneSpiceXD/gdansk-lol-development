# Gdansk LoL Project - Complete Setup Guide

This guide will walk you through setting up the complete data collection and leaderboard system for Milestone 2.

## 📋 Prerequisites

- Python 3.8+ installed
- Node.js 18+ installed
- Riot Games Developer Account
- Supabase Account (free tier)
- Git and GitHub

## 🎯 Milestone 2 Goal

Successfully fetch real player data from Riot API and display it on your leaderboard.

**Success Criteria:**
- ✅ 30+ players with rank/stats data in database
- ✅ Script can update all players successfully
- ✅ No API rate limit errors
- ✅ Leaderboard displays real data

**Estimated Time:** 4-6 hours

---

## Phase A: Python Backend Setup (1-2 hours)

### Step 1: Install Python Dependencies

```bash
cd gdansk-league/scripts
pip install -r requirements.txt
```

This installs:
- `requests` - For Riot API calls
- `python-dotenv` - For environment variables
- `supabase` - For database connection
- `pandas` - For data processing

### Step 2: Get Your Riot API Key

1. Go to https://developer.riotgames.com/
2. Sign in with your Riot account
3. Register a new "Personal API Key"
4. Copy the key (starts with `RGAPI-`)

**Important:** Personal API keys expire after 24 hours. For production, you'll need to apply for a production key.

### Step 3: Configure Environment Variables

```bash
cd gdansk-league/scripts
cp .env.example .env
```

Edit `.env` and add your Riot API key:

```
RIOT_API_KEY=RGAPI-your-actual-key-here
```

### Step 4: Test the Riot API Connection

```bash
python riot_api.py
```

Expected output:
```
=== Testing Riot API Connection ===

Region: eun1
Continent: europe
API Key: ********************xxxxx

Testing with summoner name: 'Faker'
```

If it works, you'll see player data. If it fails:
- Check your API key is correct
- Make sure you copied it without extra spaces
- Verify you're on EUNE server (Poland)

---

## Phase B: Data Collection (1-2 hours)

### Step 1: Collect Player Names

You need 30-50 summoner names from Gdansk/Poland region. Here's where to find them:

**Option 1: Facebook**
1. Join "League of Legends Gdańsk" group (~500 members)
2. Look for posts with summoner names
3. Ask members to share their names

**Option 2: op.gg**
1. Go to https://eune.op.gg/
2. Search for high-ranked players
3. Filter by Poland if possible
4. Copy names from leaderboard

**Option 3: Your Network**
- Ask friends who play LoL
- Check Gdańsk University esports club
- Visit Kinguin Lounge and ask players

### Step 2: Add Player Names

Edit `gdansk-league/data/player_names.txt`:

```
# Gdansk LoL Project - Player Names

PlayerName1
PlayerName2
PlayerName3
YourSummonerName
... (add 30-50 names)
```

**Tips:**
- One name per line
- No quotes or special characters
- Lines starting with # are comments
- Make sure names are from EUNE server

### Step 3: Run Data Collection

```bash
cd gdansk-league/scripts
python collect_players.py
```

This will:
- Read all player names from the file
- Fetch stats for each player from Riot API
- Save results to `data/collected_players.csv`
- Show progress and summary statistics

Expected output:
```
=== Starting Collection for 30 Players ===

[1/30] Processing: PlayerName1
  ✓ Success: DIAMOND II (45 LP)

[2/30] Processing: PlayerName2
  ✓ Success: PLATINUM I (78 LP)

...

=== Collection Complete ===
✓ Successful: 28/30
✗ Failed: 2/30

✓ Collection complete! Data saved to ../data/collected_players.csv
```

**Troubleshooting:**
- **"Player not found"**: Check spelling, they might have changed their name
- **"Rate limit exceeded"**: Script will auto-retry, just wait
- **"API key invalid"**: Your key expired, get a new one from developer.riotgames.com

---

## Phase C: Supabase Database Setup (1 hour)

### Step 1: Create Supabase Project

1. Go to https://supabase.com/
2. Sign in (or create account)
3. Click "New Project"
4. Enter details:
   - Name: `gdansk-lol-project`
   - Database Password: (choose strong password and save it!)
   - Region: Europe (for lower latency)
5. Wait ~2 minutes for project to initialize

### Step 2: Get Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### Step 3: Add Credentials to .env

Edit `gdansk-league/scripts/.env`:

```
RIOT_API_KEY=RGAPI-your-key-here
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...your-key-here
```

### Step 4: Create Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `gdansk-league/supabase/schema.sql`
4. Paste into the query editor
5. Click **Run**

You should see:
```
Success. No rows returned.
```

This created:
- `players` table for player profiles
- `match_history` table for future AI insights
- `email_signups` table for email collection
- Indexes for fast queries
- Row Level Security policies

### Step 5: Import CSV Data to Supabase

```bash
cd gdansk-league/scripts
python import_to_supabase.py
```

Expected output:
```
=== Starting Supabase Import ===

[1/28] ✓ Imported: PlayerName1
[2/28] ✓ Imported: PlayerName2
...

=== Import Complete ===
✓ Successful: 28/28

=== Verifying Database ===

Total players in database: 28

Top 5 Players:
  1. PlayerName1 - DIAMOND II (45 LP)
  2. PlayerName2 - PLATINUM I (78 LP)
  ...

✓ Import complete! 28 players imported to Supabase.
```

### Step 6: Verify in Supabase Dashboard

1. Go to **Table Editor** in Supabase
2. Click **players** table
3. You should see all your players with their stats!

---

## Phase D: Frontend Integration (2 hours)

### Step 1: Install Supabase Client in Next.js

```bash
cd gdansk-league
npm install @supabase/supabase-js
```

### Step 2: Create Supabase Client (NEXT STEP - will implement together)

This will create:
- `lib/supabase.ts` - Supabase client configuration
- `app/api/players/route.ts` - API route to fetch players
- Update `components/v2/ActivityFeed.tsx` to show real data

---

## Current Progress

✅ **Phase A: Python Setup** - COMPLETE
- Scripts created and tested
- Riot API integration working

✅ **Phase B: Data Collection** - READY
- Collection script ready
- Template files created
- **YOUR NEXT ACTION:** Add 30-50 player names and run collection

✅ **Phase C: Database Setup** - READY
- Schema created
- Import script ready
- **YOUR NEXT ACTION:** Create Supabase project and import data

⏳ **Phase D: Frontend** - PENDING
- Will implement after you have data in Supabase

---

## Quick Start Checklist

- [ ] Install Python dependencies (`pip install -r requirements.txt`)
- [ ] Get Riot API key from developer.riotgames.com
- [ ] Add API key to `scripts/.env`
- [ ] Test API connection (`python riot_api.py`)
- [ ] Add 30-50 player names to `data/player_names.txt`
- [ ] Run data collection (`python collect_players.py`)
- [ ] Create Supabase project
- [ ] Run database schema (`supabase/schema.sql` in SQL Editor)
- [ ] Add Supabase credentials to `scripts/.env`
- [ ] Import data to Supabase (`python import_to_supabase.py`)
- [ ] Verify data in Supabase dashboard

---

## Need Help?

**Common Issues:**

1. **"Module not found" error**
   - Run `pip install -r requirements.txt` again
   - Make sure you're in the `scripts/` directory

2. **"API key invalid"**
   - Personal API keys expire after 24 hours
   - Get a fresh key from developer.riotgames.com

3. **"Player not found"**
   - Check summoner name spelling
   - Verify they're on EUNE server
   - They might have changed their name recently

4. **Rate limit errors**
   - Script has built-in delays (1.2s between requests)
   - Will auto-retry up to 3 times
   - If persistent, reduce batch size

---

## Next Milestone (After This)

Once you have data in Supabase:
- **Milestone 3**: Build basic leaderboard page with real data
- **Milestone 4**: Add profile claiming functionality
- **Milestone 5**: Implement first AI insight (death heatmap)
- **Milestone 6**: Launch to Gdansk community

---

**Your immediate next action:**
1. Install Python dependencies
2. Get Riot API key
3. Add 30-50 player names to `data/player_names.txt`
4. Run the collection script

Good luck! 🚀
