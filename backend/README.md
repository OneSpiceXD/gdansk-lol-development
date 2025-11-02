# Backend - Gdansk LoL Hub

Python backend for fetching and processing League of Legends player data.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```bash
cp .env.example .env
# Edit .env and add your API keys
```

4. Test Riot API connection:
```bash
python scripts/riot_api.py
```

## Project Structure

```
backend/
├── api/              # API endpoints (Flask/FastAPI)
├── scripts/          # Data fetching scripts
│   └── riot_api.py   # Riot API client
├── models/           # Database models
├── requirements.txt  # Python dependencies
└── .env.example      # Environment variables template
```

## Scripts

### `riot_api.py`
Riot API client for fetching player data.

**Usage:**
```python
from scripts.riot_api import RiotAPI

client = RiotAPI()
summoner = client.get_summoner_by_name("SummonerName")
ranked = client.get_ranked_stats(summoner['id'])
```

## Next Steps

1. ✅ Set up Riot API client
2. [ ] Create player data fetching script
3. [ ] Set up Supabase connection
4. [ ] Build database migration script
5. [ ] Create daily update scheduler
