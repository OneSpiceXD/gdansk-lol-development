# Gdansk LoL Project - Implementation Plan

## 🎯 Project Vision

**"LinkedIn for Gdansk League Players"**

A local esports talent network featuring:
- Professional player profiles with verification
- AI-powered performance insights
- Team formation tools
- Physical verification hub at Kinguin Lounge

---

## 📊 Value Propositions

### What Players Get
- [ ] Professional player profiles with verification
- [ ] AI-powered performance insights (death heatmaps, timing analysis)
- [ ] Team formation and teammate finding tools
- [ ] Local leaderboard and community connection
- [ ] Weekly performance updates via email

### What Kinguin Gets
- [ ] Foot traffic from player verifications
- [ ] Bootcamp bookings from team formations
- [ ] Brand positioning as "home of Gdansk esports"
- [ ] Tournament and event infrastructure
- [ ] Access to engaged local gaming community

---

## 📋 6-Week MVP Implementation Roadmap

---

### 🔵 Milestone 1: Foundation Setup (Week 1 - 3-4 hours)

**Goal:** Get all accounts and dev environment ready

**Tasks:**
- [ ] Create Supabase account (free tier - database)
  - Go to supabase.com
  - Sign up with GitHub
  - Create new project
- [ ] Create Vercel account (free tier - hosting)
  - Go to vercel.com
  - Sign up with GitHub
- [ ] Create Resend.com account (emails)
  - Go to resend.com
  - Sign up for free tier (3,000 emails/month)
- [ ] Register Riot Developer account + get API key
  - Go to developer.riotgames.com
  - Sign in with Riot account
  - Get development API key
- [ ] Create GitHub repository
  - Name: `gdansk-league` or `gdansk-lol-hub`
  - Initialize with README
- [ ] Set up local Python environment
  ```bash
  python -m venv venv
  source venv/bin/activate  # Windows: venv\Scripts\activate
  pip install requests python-dotenv pandas
  ```

**Success Criteria:**
✅ All accounts created
✅ API key working (test one API call)
✅ GitHub repo initialized
✅ Python environment ready

**Time:** 3-4 hours

---

### 🟢 Milestone 2: Data Collection (Week 1-2 - 4-5 hours)

**Goal:** Successfully fetch real player data from Riot API

**Tasks:**
- [ ] Create `riot_api.py` with basic functions
  - `get_summoner_by_name()` - Get player info
  - `get_ranked_stats()` - Get rank/LP/wins/losses
  - `get_match_history()` - Get recent matches
- [ ] Test API calls with your own summoner name
  - Verify data returns correctly
  - Check rate limiting (20 req/sec with dev key)
- [ ] Collect 30-50 player names from:
  - Facebook group "League of Legends Gdańsk" (500 members)
  - University tournament participant lists
  - op.gg filtering by EUNE region
  - Ask friends who play
- [ ] Fetch stats for all collected players
  - Loop through all names
  - Handle errors (404 if player doesn't exist)
  - Add sleep delays for rate limiting
- [ ] Store in CSV temporarily for testing
  - Columns: summoner_name, rank, lp, wins, losses, winrate

**Success Criteria:**
✅ 30+ players with rank/stats data in CSV
✅ Script can update all players successfully
✅ No API rate limit errors

**Time:** 4-5 hours

**Code Template:**
```python
# riot_api.py
import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv('RIOT_API_KEY')
REGION = "eun1"  # Europe Nordic & East
CONTINENT = "europe"

def get_summoner_by_name(summoner_name):
    url = f"https://{REGION}.api.riotgames.com/lol/summoner/v4/summoners/by-name/{summoner_name}"
    headers = {"X-Riot-Token": API_KEY}
    response = requests.get(url, headers=headers)
    return response.json()
```

---

### 🟣 Milestone 3: Database Setup (Week 2 - 2-3 hours)

**Goal:** Move from CSV to real database

**Tasks:**
- [ ] Design Supabase schema
  - Create `players` table with columns:
    - `id` (uuid, primary key)
    - `summoner_name` (text, unique)
    - `puuid` (text, unique)
    - `summoner_id` (text)
    - `rank` (text) - e.g. "GOLD II"
    - `lp` (integer)
    - `wins` (integer)
    - `losses` (integer)
    - `email` (text, nullable)
    - `claimed` (boolean, default false)
    - `verified` (boolean, default false)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)
  - Add index on `rank` and `lp` for sorting
- [ ] Create migration script from CSV to Supabase
  - Install supabase-py: `pip install supabase`
  - Read CSV data
  - Insert into Supabase
- [ ] Build `update_players.py` script for daily refreshes
  - Fetch all players from database
  - Update their stats via Riot API
  - Save back to database
- [ ] Test manual update of all players
  - Run update script
  - Verify data updates correctly

**Success Criteria:**
✅ All players in Supabase database
✅ Can update all players programmatically
✅ Database schema properly indexed

**Time:** 2-3 hours

**Database Schema SQL:**
```sql
CREATE TABLE players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  summoner_name TEXT UNIQUE NOT NULL,
  puuid TEXT UNIQUE NOT NULL,
  summoner_id TEXT NOT NULL,
  rank TEXT,
  lp INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  email TEXT,
  claimed BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rank_lp ON players(rank, lp DESC);
```

---

### 🟣 Milestone 4: Basic Website (Week 3 - 6-8 hours)

**Goal:** Public leaderboard anyone can visit

**Tasks:**
- [ ] Create Next.js app
  ```bash
  npx create-next-app@latest gdansk-league-web
  cd gdansk-league-web
  npm run dev
  ```
- [ ] Build homepage with leaderboard table
  - Fetch players from Supabase
  - Sort by rank + LP
  - Display: Position, Name, Rank, LP, Winrate
- [ ] Add sorting/filtering by rank tier
  - Filter buttons: All, Iron, Bronze, Silver, Gold, Plat, Diamond+
  - Search by summoner name
- [ ] Create individual player profile pages
  - Route: `/player/[name]`
  - Show detailed stats
  - Match history (last 10 games)
  - Champion pool (top 5 played)
- [ ] Basic styling with Tailwind
  - Clean, gaming-themed design
  - Responsive (mobile-friendly)
  - Dark mode by default
- [ ] Deploy to Vercel
  - Connect GitHub repo
  - Auto-deploy on push
  - Get live URL

**Success Criteria:**
✅ Live website showing current Gdansk leaderboard
✅ Player profiles working
✅ Site is mobile-responsive
✅ Loads in under 2 seconds

**Time:** 6-8 hours

---

### 🟠 Milestone 5: Profile Claiming (Week 3-4 - 4-5 hours)

**Goal:** Let players claim their profiles

**Tasks:**
- [ ] Build `/claim` page with form
  - Input: Summoner name + email
  - Validate summoner exists in database
- [ ] Create verification method
  - Option 1: Change Riot profile icon to specific icon for 5 min
  - Option 2: Use Riot verification code in profile description
  - Player submits verification
- [ ] Add "Claimed" badge to leaderboard
  - Show ✓ Claimed badge next to name
  - Different styling for claimed profiles
- [ ] Set up welcome email automation
  - Use Resend.com
  - Send immediately after claim
  - Include: "Your profile is live! Here's your Gdansk rank"
- [ ] Create weekly rank update email
  - Cron job (GitHub Actions or Vercel cron)
  - Email all claimed players weekly
  - "Your rank this week: [rank], Position: #[X]"

**Success Criteria:**
✅ Players can claim profiles successfully
✅ Verification system works
✅ Emails are sending
✅ 5+ test claims completed

**Time:** 4-5 hours

---

### 🟠 Milestone 6: First AI Insight - Death Heatmap (Week 4-5 - 6-8 hours)

**Goal:** Add unique value with death heatmap visualization

**Tasks:**
- [ ] Fetch match timeline data for claimed players
  - Endpoint: `/lol/match/v5/matches/{matchId}/timeline`
  - For last 20 matches
- [ ] Extract death event positions
  - Parse timeline for `CHAMPION_KILL` events
  - Get victim position (X, Y coordinates)
  - Store death positions
- [ ] Generate heatmap visualization
  - Use matplotlib or plotly
  - Overlay on Summoner's Rift map
  - Color intensity = death frequency
- [ ] Display on player profile page
  - Show heatmap image
  - Add section: "Where You Die Most"
- [ ] Add insight text
  - Analyze death clusters
  - Generate text: "You die most often near Dragon pit. Consider warding here earlier."
  - "You die less in top lane - this is your safe zone"

**Success Criteria:**
✅ Death heatmap visible on claimed profiles
✅ Insights are accurate and helpful
✅ Images load quickly
✅ Works for all map positions

**Time:** 6-8 hours

---

### 🔴 Milestone 7: Community Launch (Week 5 - 2-3 hours)

**Goal:** Get first real users

**Tasks:**
- [ ] Post in Facebook group with live link
  - Message: "Built Gdansk LoL leaderboard - claim your spot!"
  - Include screenshot of leaderboard
  - Pin post if possible
- [ ] Share in Gdansk gaming Discord servers
  - Find local gaming communities
  - Share in #league-of-legends channels
- [ ] Reach out to university esports club
  - Email or message club organizers
  - Offer to feature university players
- [ ] Monitor signups and feedback
  - Track profile claims daily
  - Respond to questions/issues
  - Ask for feature requests
- [ ] Fix critical bugs from early users
  - Monitor error logs
  - Quick patches for blocking issues

**Success Criteria:**
✅ 20+ profile claims
✅ 50+ website visits
✅ Positive feedback from community
✅ No major bugs reported

**Time:** 2-3 hours

---

### 🔴 Milestone 8: Kinguin Preparation (Week 6 - 4-5 hours)

**Goal:** Ready to pitch partnership

**Tasks:**
- [ ] Add "Get Verified at Kinguin" section to site
  - CTA on homepage
  - Explain verification benefits
  - Show verified badge
- [ ] Create one-page pitch document (PDF)
  - Problem: No local League community infrastructure
  - Solution: Player hub + verification at Kinguin
  - Traction: X players, Y claimed profiles, Z weekly visits
  - Value to Kinguin: Foot traffic, bootcamp bookings, brand
  - Ask: 30-min meeting to discuss 3-month pilot
- [ ] Prepare metrics dashboard
  - Total players tracked
  - Claimed profiles
  - Weekly active users
  - Email open rates
- [ ] Build simple verification flow mockup
  - Show how Kinguin staff would verify players
  - Photo upload system mockup
  - Admin panel concept
- [ ] Schedule meeting with Kinguin manager
  - Visit in person or email/LinkedIn
  - Bring printed one-pager + laptop

**Success Criteria:**
✅ Pitch materials ready (PDF + mockups)
✅ Strong traction metrics to show
✅ Meeting scheduled with Kinguin
✅ Clear value proposition

**Time:** 4-5 hours

---

## 🛠️ Technical Stack

### Backend
- **Language:** Python 3.9+
- **Framework:** Flask or FastAPI (lightweight)
- **Database:** Supabase (Postgres, free tier)
- **API:** Riot Games API (MATCH-V5, SUMMONER-V4, LEAGUE-V4)
- **Hosting:** Render.com or Railway.app (free tier)

### Frontend
- **Framework:** Next.js 14 + TypeScript
- **Styling:** Tailwind CSS (included with Next.js)
- **Hosting:** Vercel (free, auto-deploy from GitHub)
- **Data Fetching:** Supabase JS client

### Services
- **Email:** Resend.com (free 3,000 emails/month)
- **Analytics:** Plausible or Vercel Analytics (free)
- **Scheduled Jobs:** GitHub Actions (free) or Vercel Cron
- **File Storage:** Supabase Storage (for player photos later)

### Development Tools
- **Version Control:** GitHub
- **API Testing:** Postman or Thunder Client
- **Environment:** `.env` file for secrets

---

## 💰 Budget

### Phase 1: MVP (Weeks 1-6)
**Total: $0**
- All services on free tiers
- No paid tools required

### Phase 2: Post-Launch (Optional)
- **Domain name:** gdanskleague.gg (~$15/year) - Makes it feel legit
- **Photo setup for Kinguin:** Ring light + backdrop (~$50-100)
- **Total Phase 2:** ~$65-115 one-time

### Phase 3: Scaling (Future)
- Supabase Pro: $25/month (if exceed free tier)
- Resend Pro: $20/month (if exceed 3k emails)
- Only needed if you get 500+ users

---

## 📅 This Week's Concrete Actions

### Day 1-2 (2-3 hours)
- [ ] Set up all accounts: Supabase, Vercel, Resend.com, Riot Developer
- [ ] Test Riot API with 1 player (your own account)
- [ ] Verify all credentials work

### Day 3-4 (4 hours)
- [ ] Collect 30+ player names from FB group and op.gg
- [ ] Build fetching script to get all player stats
- [ ] Store in CSV file

### Day 5 (3 hours)
- [ ] Set up Supabase database schema
- [ ] Migrate CSV data to database
- [ ] Test database queries

### Weekend (6 hours)
- [ ] Build basic Next.js leaderboard page
- [ ] Deploy to Vercel
- [ ] Share with 3-5 friends for feedback

---

## 🎯 Critical Success Factors

**Week 1:**
✅ Working API connection + 30 players in database

**Week 3:**
✅ Live website with real leaderboard

**Week 5:**
✅ 20+ claimed profiles with email automation

**Week 6:**
✅ Ready to pitch Kinguin with proof of traction

---

## 🚀 Future Features (Post-MVP)

### Phase 2 Features (Months 2-3)
- [ ] Team formation and "Find Teammates" page
- [ ] Tournament registration system
- [ ] Professional player photos at Kinguin venue
- [ ] Coaching recommendation system

### Phase 3 Features (Months 4-6)
- [ ] Advanced AI insights
  - Objective timing analysis
  - Item build efficiency
  - First blood patterns
  - Champion matchup recommendations
- [ ] Coaching marketplace with local mentors
- [ ] Monthly tournament circuit at Kinguin
- [ ] Sponsor integration (peripherals, energy drinks)

### Phase 4: Expansion (Months 6-12)
- [ ] Multi-city expansion
  - Kraków, Warsaw, Wrocław
  - Partner with venues in each city
- [ ] White-label platform
  - License to other Polish cities
  - Recurring revenue: 500-1000 zł/month per venue
- [ ] National leaderboard
  - Poland-wide rankings
  - Regional tournaments

---

## 📞 Key Resources

### Finding Player Names
- Facebook: "League of Legends Gdańsk" group (500 members)
- op.gg: Filter by EUNE region + high rank
- University: Gdańsk University esports club
- Kinguin: Ask for player names (after partnership)

### Technical Documentation
- Riot API: https://developer.riotgames.com/
- Riot API Libraries: https://riot-api-libraries.readthedocs.io/
- Next.js Docs: https://nextjs.org/learn
- Supabase Docs: https://supabase.com/docs

### Design Assets (Later)
- Logo: Canva or Fiverr ($20)
- Player Cards: Figma community templates
- Icons: Heroicons (free), Gaming icon packs

---

## 💡 Business Model (Future)

### Revenue Stream 1: Kinguin Partnership
- **What you drive:** Foot traffic, bootcamp bookings, tournaments
- **What you get:** Revenue share (10%) or fixed fee (500-1000 zł/month)

### Revenue Stream 2: Premium Profiles (Optional)
- **Free tier:** Basic stats + verification
- **Premium (25 zł/season):** Advanced AI insights, priority team matching, featured profiles

### Revenue Stream 3: B2B Expansion
- **License to other venues:** 500-1000 zł/month per city
- **Scale to 10 cities:** 10,000 zł/month MRR

### Revenue Stream 4: Sponsorships
- **Local brands:** PC shops, energy drinks, ISPs
- **They pay for:** Email list access, tournament naming rights, profile sponsorships

---

## 🎮 The End Goal

**Year 1:** Gdansk hub with 200+ verified players, Kinguin partnership, profitable

**Year 2:** Expand to 5 Polish cities, 1,000+ players, 10,000 zł/month MRR

**Year 3:** National platform, attract VC or acquisition interest from Kinguin/gaming company

---

**Ready to start? Begin with Milestone 1 this week!** 🚀
