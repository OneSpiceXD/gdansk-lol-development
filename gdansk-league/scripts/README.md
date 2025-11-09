# Riot API Data Collection Scripts

Python scripts for collecting and managing League of Legends player data from the Riot Games API.

## Setup

### 1. Install Python Dependencies

```bash
cd scripts
pip install -r requirements.txt
```

### 2. Configure API Key

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your Riot API key from https://developer.riotgames.com/

3. Add your API key to `.env`:
   ```
   RIOT_API_KEY=RGAPI-your-actual-key-here
   ```

### 3. Test the API Connection

```bash
python riot_api.py
```

This will test the API with a sample summoner. Edit the `test_summoner` variable in `riot_api.py` to test with your own summoner name.

## Usage

### Collect Player Data

1. Add player names to `../data/player_names.txt` (one name per line)

2. Run the collection script:
   ```bash
   python collect_players.py
   ```

3. Results will be saved to `../data/collected_players.csv`

## Files

- `riot_api.py` - Core Riot API integration
- `collect_players.py` - Batch player data collection
- `requirements.txt` - Python dependencies
- `.env` - API keys and configuration (create from .env.example)

## API Rate Limits

The scripts include automatic rate limit handling:
- 1.2 second delay between requests
- Automatic retry on rate limit errors
- Maximum 3 retry attempts per request

## Next Steps

After collecting player data:
1. Set up Supabase database
2. Run migration to import CSV data
3. Connect Next.js frontend to Supabase
